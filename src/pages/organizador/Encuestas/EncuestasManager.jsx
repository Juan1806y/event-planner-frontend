import React, { useState, useEffect } from 'react';
import './EncuestasManager.css';
import { obtenerEventos, obtenerPerfil } from '../../../components/eventosService';
import ListaEncuestas from './ListaEncuestas';
import FormularioEncuesta from './FormularioEncuesta';

const BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3000/api';

const EncuestasManager = () => {
    const [encuestas, setEncuestas] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [cargando, setCargando] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        tipo_encuesta: 'satisfaccion_evento',
        momento: 'despues',
        url_google_form: '',
        url_respuestas: '',
        estado: 'borrador',
        fecha_inicio: '',
        fecha_fin: '',
        id_evento: '',
        id_actividad: null,
        obligatoria: false,
        descripcion: ''
    });

    const getAuthToken = () => {
        return localStorage.getItem('access_token');
    };

    const obtenerIdUsuarioLogueado = () => {
        const token = getAuthToken();
        if (!token) return null;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            return payload.id || payload.user_id || payload.userId || payload.sub;
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    };

    const getHeaders = () => ({
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        cargarEventos();
    }, []);

    const cargarEventos = async () => {
        try {
            const perfil = await obtenerPerfil();
            const idCreador = perfil?.data?.usuario?.id
                || perfil?.data?.id
                || perfil?.usuario?.id
                || perfil?.id
                || perfil?.usuario_id
                || null;

            const data = await obtenerEventos();
            const listaEventos = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

            const eventosDelCreador = listaEventos.filter((e) => {
                if (!idCreador) return false;
                const creadorFields = [
                    e.id_creador,
                    e.creador?.id,
                    e.creador_id,
                    e.usuario?.id,
                    e.usuario_id,
                    e.idCreador,
                    e.owner_id,
                    e.owner?.id
                ];

                return creadorFields.some(field => String(field) === String(idCreador));
            });

            setEventos(eventosDelCreador);
            console.log(eventosDelCreador)
        } catch (error) {
            alert("Error al cargar eventos.");
        }
    };

    const cargarEncuestas = async (eventoId) => {
        try {
            setCargando(true);
            const response = await fetch(`${BASE_URL}/encuestas?evento_id=${eventoId}`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error al obtener encuestas: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Encuestas recibidas (raw):', data);

            // Manejar diferentes formatos de respuesta del backend
            let listaEncuestas = [];
            if (Array.isArray(data)) {
                listaEncuestas = data;
            } else if (data.data && Array.isArray(data.data)) {
                listaEncuestas = data.data;
            } else if (data.encuestas && Array.isArray(data.encuestas)) {
                listaEncuestas = data.encuestas;
            }

            console.log('📋 Encuestas procesadas:', listaEncuestas);
            console.log('📊 Total de encuestas:', listaEncuestas.length);

            setEncuestas(listaEncuestas);
        } catch (error) {
            console.error('Error en cargarEncuestas:', error);
            setEncuestas([]);
            mostrarMensaje('error', 'Error al cargar las encuestas.');
        } finally {
            setCargando(false);
        }
    };

    const cargarActividades = async (eventoId) => {
        if (!eventoId) {
            setActividades([]);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/eventos/${eventoId}/actividades`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error al obtener actividades: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Actividades recibidas:', data);
            setActividades(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error en cargarActividades:', error);
            setActividades([]);
        }
    };

    const seleccionarEvento = (evento) => {
        setEventoSeleccionado(evento);
        cargarEncuestas(evento.id);
        cargarActividades(evento.id);
    };

    const volverAEventos = () => {
        setEventoSeleccionado(null);
        setEncuestas([]);
        setActividades([]);
        setMostrarFormulario(false);
        setMostrarResultados(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        console.log('📝 Campo modificado:', {
            nombre: name,
            valor: type === 'checkbox' ? checked : value,
            tipo: type
        });

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'id_evento') {
            cargarActividades(value);
            setFormData(prev => ({ ...prev, id_actividad: null }));
        }
    };

    const validarFormulario = () => {
        console.log('🔍 INICIANDO VALIDACIÓN');
        console.log('📋 FormData actual:', formData);

        const nuevosErrores = {};

        // Validación título
        if (!formData.titulo.trim()) {
            nuevosErrores.titulo = 'El título es obligatorio.';
            console.log('❌ Error en título:', formData.titulo);
        } else {
            console.log('✅ Título válido:', formData.titulo);
        }

        // Validación URL (solo verifica que no esté vacía)
        if (!formData.url_google_form.trim()) {
            nuevosErrores.url_google_form = 'La URL del formulario es obligatoria.';
            console.log('❌ Error: URL vacía');
        } else {
            console.log('✅ URL proporcionada:', formData.url_google_form);
        }

        // Validación evento
        if (!formData.id_evento) {
            nuevosErrores.id_evento = 'Debes seleccionar un evento.';
            console.log('❌ Error: Sin evento seleccionado');
        } else {
            console.log('✅ Evento seleccionado:', formData.id_evento);
        }

        // Validación fechas
        if (formData.fecha_inicio && formData.fecha_fin) {
            if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
                nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio.';
                console.log('❌ Error en fechas:', {
                    inicio: formData.fecha_inicio,
                    fin: formData.fecha_fin
                });
            } else {
                console.log('✅ Fechas válidas');
            }
        }

        console.log('📊 RESUMEN DE VALIDACIÓN:');
        console.log('Errores encontrados:', nuevosErrores);
        console.log('¿Es válido?', Object.keys(nuevosErrores).length === 0);

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('🚀 ===== INICIO DE SUBMIT =====');
        console.log('📦 FormData completo:', JSON.stringify(formData, null, 2));
        console.log('🎯 Evento seleccionado:', eventoSeleccionado);
        console.log('✏️ Modo edición:', modoEdicion);

        const esValido = validarFormulario();

        if (!esValido) {
            console.log('⛔ VALIDACIÓN FALLÓ - Deteniendo submit');
            console.log('❌ Errores actuales:', errores);
            mostrarMensaje('error', 'Por favor corrige los errores en el formulario.');
            return;
        }

        console.log('✅ VALIDACIÓN EXITOSA - Procediendo a enviar');

        try {
            setCargando(true);
            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion
                ? `${BASE_URL}/encuestas/${encuestaSeleccionada.id}`
                : `${BASE_URL}/encuestas`;

            console.log('🌐 Preparando petición:');
            console.log('  - Método:', metodo);
            console.log('  - URL:', url);
            console.log('  - Headers:', getHeaders());
            console.log('  - Body:', JSON.stringify(formData, null, 2));

            const response = await fetch(url, {
                method: metodo,
                headers: getHeaders(),
                body: JSON.stringify(formData)
            });

            console.log('📡 Respuesta recibida:');
            console.log('  - Status:', response.status);
            console.log('  - OK:', response.ok);

            if (!response.ok) {
                const errorData = await response.json();
                console.log('❌ Error del servidor:', errorData);
                throw new Error(errorData.message || `Error al guardar encuesta: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('✅ Respuesta exitosa:', responseData);

            mostrarMensaje('success', modoEdicion ? 'Encuesta actualizada correctamente' : 'Encuesta creada correctamente');
            cerrarFormulario();
            cargarEncuestas(eventoSeleccionado.id);

            console.log('🎉 ===== SUBMIT COMPLETADO =====');
        } catch (error) {
            console.error('💥 ERROR EN SUBMIT:', error);
            console.error('Stack trace:', error.stack);
            mostrarMensaje('error', error.message || 'Error al guardar la encuesta.');
        } finally {
            setCargando(false);
        }
    };

    const mostrarMensaje = (tipo, texto) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
    };

    const abrirFormularioNuevo = () => {
        console.log('🆕 Abriendo formulario nuevo');
        console.log('Evento seleccionado:', eventoSeleccionado);

        const nuevoFormData = {
            titulo: '',
            tipo_encuesta: 'satisfaccion_evento',
            momento: 'despues',
            url_google_form: '',
            url_respuestas: '',
            estado: 'borrador',
            fecha_inicio: '',
            fecha_fin: '',
            id_evento: eventoSeleccionado.id,
            id_actividad: null,
            obligatoria: false,
            descripcion: ''
        };

        console.log('📋 Nuevo FormData:', nuevoFormData);

        setFormData(nuevoFormData);
        setModoEdicion(false);
        setEncuestaSeleccionada(null);
        setErrores({});
        setMostrarFormulario(true);
    };

    const editarEncuesta = async (encuesta) => {
        console.log('✏️ Editando encuesta:', encuesta);

        setFormData({
            titulo: encuesta.titulo,
            tipo_encuesta: encuesta.tipo_encuesta,
            momento: encuesta.momento,
            url_google_form: encuesta.url_google_form || '',
            url_respuestas: encuesta.url_respuestas || '',
            estado: encuesta.estado,
            fecha_inicio: encuesta.fecha_inicio || '',
            fecha_fin: encuesta.fecha_fin || '',
            id_evento: encuesta.id_evento,
            id_actividad: encuesta.id_actividad,
            obligatoria: encuesta.obligatoria || false,
            descripcion: encuesta.descripcion || ''
        });

        if (encuesta.id_evento) {
            await cargarActividades(encuesta.id_evento);
        }

        setModoEdicion(true);
        setEncuestaSeleccionada(encuesta);
        setErrores({});
        setMostrarFormulario(true);
    };

    const cerrarFormulario = () => {
        setMostrarFormulario(false);
        setModoEdicion(false);
        setEncuestaSeleccionada(null);
        setErrores({});
    };

    const eliminarEncuesta = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta encuesta?')) {
            return;
        }

        try {
            setCargando(true);
            const response = await fetch(`${BASE_URL}/encuestas/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar encuesta: ${response.status}`);
            }

            mostrarMensaje('success', 'Encuesta eliminada correctamente');
            cargarEncuestas(eventoSeleccionado.id);
        } catch (error) {
            console.error('Error en eliminarEncuesta:', error);
            mostrarMensaje('error', 'Error al eliminar la encuesta.');
        } finally {
            setCargando(false);
        }
    };

    const activarEncuesta = async (id) => {
        try {
            setCargando(true);
            const response = await fetch(`${BASE_URL}/encuestas/${id}/activar`, {
                method: 'PUT',
                headers: getHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al activar encuesta: ${response.status}`);
            }

            mostrarMensaje('success', 'Encuesta activada y enviada a los asistentes');
            cargarEncuestas(eventoSeleccionado.id);
        } catch (error) {
            console.error('Error en activarEncuesta:', error);
            mostrarMensaje('error', error.message || 'Error al activar la encuesta.');
        } finally {
            setCargando(false);
        }
    };

    const verResultados = async (encuesta) => {
        setEncuestaSeleccionada(encuesta);
        setMostrarResultados(true);

        try {
            const response = await fetch(`${BASE_URL}/encuestas/${encuesta.id}/estadisticas`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (response.ok) {
                const estadisticas = await response.json();
                setEncuestaSeleccionada(prev => ({ ...prev, ...estadisticas }));
            }
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    return (
        <div className="encuestas-manager">
            <div className="encuestas-header">
                <div className="header-left">
                    <div className="icon-title">
                        <span className="icon-encuestas">📋</span>
                        <h2>Gestionar Encuestas</h2>
                    </div>
                    <p className="subtitle">
                        {!eventoSeleccionado
                            ? 'Selecciona un evento para gestionar sus encuestas'
                            : `Encuestas del evento: ${eventoSeleccionado.nombre}`
                        }
                    </p>
                </div>
                {eventoSeleccionado && !mostrarFormulario && !mostrarResultados && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-volver" onClick={volverAEventos}>
                            ← Volver a Eventos
                        </button>
                        <button className="btn-nueva-encuesta" onClick={abrirFormularioNuevo} disabled={cargando}>
                            + Nueva Encuesta
                        </button>
                    </div>
                )}
            </div>

            {mensaje.texto && (
                <div className={`mensaje mensaje-${mensaje.tipo}`}>
                    {mensaje.tipo === 'success' ? '✓' : '⚠'} {mensaje.texto}
                </div>
            )}

            {cargando && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Cargando...</p>
                </div>
            )}

            {!eventoSeleccionado && !mostrarFormulario && !mostrarResultados && (
                <div className="eventos-catalogo">
                    <h3>Selecciona un Evento</h3>
                    {eventos.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📅</span>
                            <h3>No hay eventos disponibles</h3>
                            <p>Crea un evento primero para poder gestionar sus encuestas</p>
                        </div>
                    ) : (
                        <div className="eventos-grid">
                            {eventos.map(evento => (
                                <div key={evento.id} className="evento-card" onClick={() => seleccionarEvento(evento)}>
                                    <div className="evento-info">
                                        <h4>{evento.nombre}</h4>
                                        <p className="evento-descripcion">{evento.descripcion || 'Sin descripción'}</p>
                                        <div className="evento-meta">
                                            <span>📅 {evento.fecha_inicio} - {evento.fecha_fin}</span>
                                            <span>📍 {evento.ubicacion || 'Sin ubicación'}</span>
                                        </div>
                                    </div>
                                    <div className="evento-accion">
                                        <button className="btn-seleccionar">Ver Encuestas →</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {eventoSeleccionado && !mostrarFormulario && !mostrarResultados && (
                <ListaEncuestas
                    encuestas={encuestas}
                    onVerResultados={verResultados}
                    onEditar={editarEncuesta}
                    onActivar={activarEncuesta}
                    onEliminar={eliminarEncuesta}
                    onCrearPrimera={abrirFormularioNuevo}
                />
            )}

            {mostrarFormulario && (
                <FormularioEncuesta
                    formData={formData}
                    modoEdicion={modoEdicion}
                    errores={errores}
                    cargando={cargando}
                    eventoSeleccionado={eventoSeleccionado}
                    actividades={actividades}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onCerrar={cerrarFormulario}
                />
            )}

            {mostrarResultados && encuestaSeleccionada && (
                <div className="resultados-panel">
                    <div className="resultados-header">
                        <h3>📊 Estadísticas: {encuestaSeleccionada.titulo}</h3>
                        <button className="btn-cerrar" onClick={() => setMostrarResultados(false)}>✕</button>
                    </div>

                    <div className="resultados-content">
                        <div className="estadisticas-grid">
                            <div className="stat-card">
                                <span className="stat-value">{encuestaSeleccionada.respuestas_count || 0}</span>
                                <span className="stat-label">Total Respuestas</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{encuestaSeleccionada.tasa_respuesta || '0%'}</span>
                                <span className="stat-label">Tasa de Respuesta</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{encuestaSeleccionada.calificacion_promedio || 'N/A'}</span>
                                <span className="stat-label">Calificación Promedio</span>
                            </div>
                        </div>

                        <div className="resultados-acciones">
                            <a
                                href={encuestaSeleccionada.url_respuestas || encuestaSeleccionada.url_google_form}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ver-google"
                            >
                                Ver en Google Forms
                            </a>

                            <button className="btn-exportar">
                                Exportar Resultados
                            </button>
                        </div>

                        <div className="info-message">
                            <span>ℹ️</span>
                            <p>
                                Los resultados detallados se gestionan directamente en Google Forms.
                                Haz clic en "Ver en Google Forms" para acceder al análisis completo.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EncuestasManager;