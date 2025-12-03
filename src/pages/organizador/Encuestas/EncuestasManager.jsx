import React, { useState, useEffect } from 'react';
import './EncuestasManager.css';
import { obtenerEventos, obtenerPerfil, obtenerActividadesEvento } from '../../../components/eventosService';
import ListaEncuestas from './ListaEncuestas';
import FormularioEncuesta from './FormularioEncuesta';
import EnviarEncuestaAsistentes from './EnviarEncuestaAsistentes'; // NUEVO IMPORT
import Sidebar from "../Sidebar";

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
    const [mostrarEnvioEncuesta, setMostrarEnvioEncuesta] = useState(false); // NUEVO ESTADO
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

            let listaEncuestas = [];
            if (Array.isArray(data)) {
                listaEncuestas = data;
            } else if (data.data && Array.isArray(data.data)) {
                listaEncuestas = data.data;
            } else if (data.encuestas && Array.isArray(data.encuestas)) {
                listaEncuestas = data.encuestas;
            }

            setEncuestas(listaEncuestas);
        } catch (error) {
            setEncuestas([]);
            mostrarMensaje('error', 'Error al cargar las encuestas.');
        } finally {
            setCargando(false);
        }
    };

    const cargarActividades = async (eventoId) => {
        try {
            const data = await obtenerActividadesEvento(eventoId);
            console.log(data)
            const lista = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.actividades)
                        ? data.actividades
                        : [];

            setActividades(lista);
        } catch (error) {
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
        setMostrarEnvioEncuesta(false); // NUEVO
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        let valorFinal = type === 'checkbox' ? checked : value;

        if (name === 'id_actividad') {
            valorFinal = value === '' || value === 'null' ? null : parseInt(value, 10);
        }

        setFormData(prev => ({
            ...prev,
            [name]: valorFinal
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
        const nuevosErrores = {};

        if (!formData.titulo.trim()) {
            nuevosErrores.titulo = 'El título es obligatorio.';
        }

        if (!formData.url_google_form.trim()) {
            nuevosErrores.url_google_form = 'La URL del formulario es obligatoria.';
        }

        if (!formData.id_evento) {
            nuevosErrores.id_evento = 'Debes seleccionar un evento.';
        }

        if (formData.fecha_inicio && formData.fecha_fin) {
            if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
                nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio.';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const esValido = validarFormulario();

        if (!esValido) {
            mostrarMensaje('error', 'Por favor corrige los errores en el formulario.');
            return;
        }

        try {
            setCargando(true);

            // Log del payload que se está enviando
            console.log('📤 Enviando datos de encuesta:', formData);

            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion
                ? `${BASE_URL}/encuestas/${encuestaSeleccionada.id}`
                : `${BASE_URL}/encuestas`;

            console.log('🔗 URL:', url);
            console.log('📋 Método:', metodo);

            const response = await fetch(url, {
                method: metodo,
                headers: getHeaders(),
                body: JSON.stringify(formData)
            });

            console.log('📥 Response status:', response.status);

            // Intentar leer el body de la respuesta
            let errorData;
            try {
                errorData = await response.json();
                console.log('📝 Response data:', errorData);
            } catch (jsonError) {
                console.error('❌ No se pudo parsear la respuesta como JSON');
                const textResponse = await response.text();
                console.log('📄 Response text:', textResponse);
            }

            if (!response.ok) {
                // Mostrar el error específico del backend
                const errorMessage = errorData?.message
                    || errorData?.error
                    || errorData?.errors
                    || `Error ${response.status}: ${response.statusText}`;

                console.error('❌ Error del servidor:', errorMessage);
                console.error('📋 Detalles completos:', errorData);

                throw new Error(errorMessage);
            }

            mostrarMensaje('success', modoEdicion ? 'Encuesta actualizada correctamente' : 'Encuesta creada correctamente');
            cerrarFormulario();
            cargarEncuestas(eventoSeleccionado.id);
        } catch (error) {
            console.error('💥 Error capturado:', error);
            console.error('📊 Stack trace:', error.stack);

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

        setFormData(nuevoFormData);
        setModoEdicion(false);
        setEncuestaSeleccionada(null);
        setErrores({});
        setMostrarFormulario(true);
    };

    const editarEncuesta = async (encuesta) => {
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
            mostrarMensaje('error', error.message || 'Error al activar la encuesta.');
        } finally {
            setCargando(false);
        }
    };

    // NUEVA FUNCIÓN: Manejar envío de encuestas
    const abrirEnvioEncuesta = (encuesta) => {
        setEncuestaSeleccionada(encuesta);
        setMostrarEnvioEncuesta(true);
    };

    // NUEVA FUNCIÓN: Cerrar modal de envío
    const cerrarEnvioEncuesta = () => {
        setMostrarEnvioEncuesta(false);
        setEncuestaSeleccionada(null);
    };

    // NUEVA FUNCIÓN: Callback cuando el envío es exitoso
    const handleEnvioExitoso = (resultado) => {
        mostrarMensaje('success', `Encuesta enviada a ${resultado.total_enviadas} asistentes`);
        cargarEncuestas(eventoSeleccionado.id);
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
        }
    };

    return (
        <div className="encuestas-manager">
            <Sidebar />
            <div className="encuestas-header">
                <div className="header-left">
                    <div className="icon-title">
                        <span className="icon-encuestas">📋</span>
                        <h2>Gestionar Encuestas</h2>
                    </div>
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
                                        <h4>{evento.titulo}</h4>
                                        <div className="evento-meta">
                                            <span>📅 {evento.fecha_inicio} - {evento.fecha_fin}</span>
                                            <span>🎟️ {evento.modalidad || 'Sin modalidad'}</span>
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
                    onEnviar={abrirEnvioEncuesta} // NUEVA PROP
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

            {/* NUEVO: Modal para enviar encuestas */}
            {mostrarEnvioEncuesta && encuestaSeleccionada && eventoSeleccionado && (
                <EnviarEncuestaAsistentes
                    encuesta={encuestaSeleccionada}
                    eventoId={eventoSeleccionado.id}
                    onCerrar={cerrarEnvioEncuesta}
                    onEnvioExitoso={handleEnvioExitoso}
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