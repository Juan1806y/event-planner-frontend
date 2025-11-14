// src/pages/EventosPage/EditarEventoPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, ArrowLeft, Save, AlertCircle, Building2, Users, CheckCircle, Trash2, Plus } from 'lucide-react';
import {
    obtenerEventoPorId,
    actualizarEvento,
    obtenerPerfil,
    obtenerLugares,
    obtenerActividadesEvento,
    crearActividad,
    actualizarActividad,
    eliminarActividad
} from '../../components/eventosService';
import './CrearEventoPage.css';

const ESTADOS = [
    { value: 0, label: 'Borrador' },
    { value: 1, label: 'Publicado' },
    { value: 2, label: 'Cancelado' },
    { value: 3, label: 'Finalizado' }
];

const EditarEventoPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [empresa, setEmpresa] = useState(null);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [mostrarModalExito, setMostrarModalExito] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        cupos: '',
        modalidad: 'Presencial',
        estado: 0,
        id_lugar: '',
        url_virtual: ''
    });

    // Catálogos
    const [lugares, setLugares] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [actividadesEliminadas, setActividadesEliminadas] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError(null);

            // 1. Obtener perfil para id_empresa
            const perfil = await obtenerPerfil();
            const empresaId = perfil.data?.usuario?.rolData?.id_empresa;

            if (!empresaId) {
                console.error('❌ Estructura del perfil:', perfil);
                throw new Error('No se pudo obtener el ID de la empresa');
            }

            console.log('✅ ID Empresa obtenido:', empresaId);

            // Obtener nombre de la empresa
            const nombreEmpresa = perfil.data?.usuario?.rolData?.empresa?.nombre || 'Mi Empresa';
            setEmpresa({ id: empresaId, nombre: nombreEmpresa });

            const eventoResponse = await obtenerEventoPorId(id);
            const evento = eventoResponse.data;

            const formatearFecha = (fecha) => {
                if (!fecha) return '';
                const date = new Date(fecha);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            // 4. Cargar datos en el formulario
            setFormData({
                titulo: evento.titulo || '',
                descripcion: evento.descripcion || '',
                fecha_inicio: formatearFecha(evento.fecha_inicio),
                fecha_fin: formatearFecha(evento.fecha_fin),
                cupos: evento.cupos || '',
                modalidad: evento.modalidad || 'Presencial',
                estado: evento.estado ?? 0,
                id_lugar: evento.id_lugar || '',
                url_virtual: evento.url_virtual || ''
            });

            // 4. Obtener actividades del evento
            try {
                const actividadesResponse = await obtenerActividadesEvento(id);
                const actividadesData = actividadesResponse.data || [];

                // Formatear actividades existentes
                const actividadesFormateadas = actividadesData.map(act => ({
                    id: act.id, // ID existente
                    titulo: act.titulo || '',
                    descripcion: act.descripcion || '',
                    fecha_actividad: formatearFecha(act.fecha_actividad),
                    hora_inicio: act.hora_inicio || '',
                    hora_fin: act.hora_fin || '',
                    esExistente: true // Marca que ya existe en BD
                }));

                setActividades(actividadesFormateadas.length > 0 ? actividadesFormateadas : [
                    { titulo: '', descripcion: '', fecha_actividad: '', hora_inicio: '', hora_fin: '', esExistente: false }
                ]);
            } catch (error) {
                console.warn('No se pudieron cargar las actividades:', error);
                setActividades([
                    { titulo: '', descripcion: '', fecha_actividad: '', hora_inicio: '', hora_fin: '', esExistente: false }
                ]);
            }

            // 5. Cargar catálogos
            const [lugaresRes] = await Promise.all([
                obtenerLugares(empresaId)
            ]);

            setLugares(lugaresRes.data || []);

        } catch (error) {
            console.error('❌ Error al cargar datos:', error);
            setError(error.message || 'Error al cargar el evento');
            setMensaje({ tipo: 'error', texto: error.message || 'Error al cargar el evento' });
        } finally {
            setCargando(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Limpiar campos según modalidad
        if (field === 'modalidad') {
            if (value === 'Virtual') {
                setFormData(prev => ({ ...prev, id_lugar: '' }));
            } else if (value === 'Presencial') {
                setFormData(prev => ({ ...prev, url_virtual: '' }));
            }
        }
    };
    const handleActividadChange = (index, field, value) => {
        const nuevasActividades = [...actividades];
        nuevasActividades[index][field] = value;
        setActividades(nuevasActividades);
    };

    const agregarActividad = () => {
        setActividades(prev => [
            ...prev,
            { titulo: '', descripcion: '', fecha_actividad: '', hora_inicio: '', hora_fin: '', esExistente: false }
        ]);
    };

    const eliminarActividadLocal = async (index) => {
        const actividad = actividades[index];

        if (actividad.esExistente && actividad.id) {
            // Si la actividad ya existe en BD, la marcamos para eliminar
            if (window.confirm('¿Estás seguro de eliminar esta actividad? Esta acción no se puede deshacer.')) {
                try {
                    await eliminarActividad(actividad.id);
                    setActividadesEliminadas(prev => [...prev, actividad.id]);
                    setActividades(prev => prev.filter((_, i) => i !== index));
                    setMensaje({ tipo: 'exito', texto: 'Actividad eliminada exitosamente' });
                    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
                } catch (error) {
                    console.error('Error al eliminar actividad:', error);
                    setMensaje({ tipo: 'error', texto: 'Error al eliminar la actividad' });
                }
            }
        } else {
            // Si es nueva (no existe en BD), solo la quitamos del estado
            if (actividades.length > 1) {
                setActividades(prev => prev.filter((_, i) => i !== index));
            }
        }
    };
    const validarFormulario = () => {
        if (!formData.titulo.trim()) {
            setMensaje({ tipo: 'error', texto: 'El nombre del evento es obligatorio' });
            return false;
        }
        if (!formData.fecha_inicio || !formData.fecha_fin) {
            setMensaje({ tipo: 'error', texto: 'Las fechas de inicio y fin son obligatorias' });
            return false;
        }
        if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
            setMensaje({ tipo: 'error', texto: 'La fecha de fin no puede ser anterior a la fecha de inicio' });
            return false;
        }
        if (formData.cupos && parseInt(formData.cupos) <= 0) {
            setMensaje({ tipo: 'error', texto: 'Los cupos deben ser un número positivo' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setGuardando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            // Preparar datos
            const datosActualizados = {
                titulo: formData.titulo.trim(),
                descripcion: formData.descripcion.trim(),
                fecha_inicio: formData.fecha_inicio,
                fecha_fin: formData.fecha_fin,
                cupos: parseInt(formData.cupos) || null,
                modalidad: formData.modalidad,
                estado: parseInt(formData.estado),
                id_lugar: (formData.modalidad === 'Presencial' || formData.modalidad === 'Híbrido') && formData.id_lugar
                    ? parseInt(formData.id_lugar)
                    : null,
                url_virtual: (formData.modalidad === 'Virtual' || formData.modalidad === 'Híbrido') && formData.url_virtual
                    ? formData.url_virtual.trim()
                    : null
            };

            console.log('📤 Actualizando evento con:', datosActualizados);

            await actualizarEvento(id, datosActualizados);
            // 2. Procesar actividades
            const actividadesValidas = actividades.filter(act => act.titulo.trim() !== '');

            for (const actividad of actividadesValidas) {
                const actividadData = {
                    titulo: actividad.titulo.trim(),
                    descripcion: actividad.descripcion?.trim() || '',
                    fecha_actividad: actividad.fecha_actividad || formData.fecha_inicio,
                    hora_inicio: actividad.hora_inicio || '00:00',
                    hora_fin: actividad.hora_fin || '00:00',
                    lugares: formData.id_lugar ? [parseInt(formData.id_lugar)] : []
                };

                if (actividad.esExistente && actividad.id) {
                    // Actualizar actividad existente
                    await actualizarActividad(actividad.id, actividadData);
                    console.log(`✅ Actividad ${actividad.id} actualizada`);
                } else {
                    // Crear nueva actividad
                    await crearActividad(id, actividadData);
                    console.log(`✅ Nueva actividad creada`);
                }
            }

            setMensaje({ tipo: 'exito', texto: 'Evento y actividades actualizados exitosamente' });
            setMostrarModalExito(true);

            console.log('✅ Evento actualizado exitosamente');
            setMensaje({ tipo: 'exito', texto: 'Evento actualizado exitosamente' });
            setMostrarModalExito(true);

            setTimeout(() => {
                setMostrarModalExito(false);
                navigate('/organizador');
            }, 2500);

        } catch (error) {
            console.error('❌ Error al actualizar:', error);
            const mensajeError = error.message || error.error || 'Error desconocido al actualizar';
            setMensaje({ tipo: 'error', texto: 'Error al actualizar el evento: ' + mensajeError });
        } finally {
            setGuardando(false);
        }
    };

    // Loading state
    if (cargando) {
        return (
            <div className="crear-evento-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando evento...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !empresa) {
        return (
            <div className="crear-evento-page">
                <div className="crear-evento-container">
                    <div className="error-container">
                        <AlertCircle size={64} color="#dc3545" />
                        <h2>Error al Cargar Evento</h2>
                        <p>{error}</p>
                        {mensaje.texto && (
                            <div className="mensaje-alert alert-error">
                                <AlertCircle size={20} />
                                <span>{mensaje.texto}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                onClick={() => navigate('/organizador')}
                                className="btn-cancelar-crear"
                            >
                                Volver a Eventos
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-submit-crear"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="crear-evento-page">
            <div className="crear-evento-container">
                {/* Header */}
                <div className="page-header-crear">
                    <button onClick={() => navigate('/organizador')} className="btn-back">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-content-crear">
                        <Calendar size={28} className="header-icon" />
                        <h1 className="page-title-crear">Editar Evento</h1>
                    </div>
                </div>

                {/* Empresa Info */}
                {empresa && (
                    <div className="empresa-info-header">
                        <Building2 size={20} />
                        <span>Organizando para: <strong>{empresa.nombre}</strong></span>
                    </div>
                )}

                {/* Mensajes */}
                {mensaje.texto && (
                    <div className={`mensaje-alert ${mensaje.tipo === 'exito' ? 'alert-exito' : 'alert-error'}`}>
                        {mensaje.tipo === 'exito' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-crear-evento">
                    <p className="form-hint">Actualiza la información del evento y sus actividades</p>

                    {/* Información Básica */}
                    <section className="form-section">
                        <h2 className="section-title">Información Básica</h2>

                        <div className="form-group-crear">
                            <label className="form-label-crear">
                                Nombre del Evento <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => handleInputChange('titulo', e.target.value)}
                                placeholder="Ej: Conferencia Anual de Tecnología 2025"
                                className="form-input-crear"
                                required
                            />
                        </div>

                        <div className="form-row-crear">
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Calendar size={18} />
                                    Fecha de Inicio <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                                    className="form-input-crear"
                                    required
                                />
                            </div>

                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Calendar size={18} />
                                    Fecha de Fin <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_fin}
                                    onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                                    className="form-input-crear"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row-crear">
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Users size={18} />
                                    Cupos Disponibles
                                </label>
                                <input
                                    type="number"
                                    value={formData.cupos}
                                    onChange={(e) => handleInputChange('cupos', e.target.value)}
                                    placeholder="Número máximo de participantes"
                                    className="form-input-crear"
                                    min="1"
                                />
                                <p className="form-hint">Deja vacío para cupos ilimitados</p>
                            </div>

                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    Estado del Evento <span className="required">*</span>
                                </label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => handleInputChange('estado', e.target.value)}
                                    className="form-select-crear"
                                    required
                                >
                                    {ESTADOS.map(estado => (
                                        <option key={estado.value} value={estado.value}>
                                            {estado.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Ubicación */}
                    <section className="form-section">
                        <h2 className="section-title">Ubicación</h2>

                        <div className="form-group-crear">
                            <label className="form-label-crear">
                                Tipo de Evento <span className="required">*</span>
                            </label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="Presencial"
                                        checked={formData.modalidad === 'Presencial'}
                                        onChange={(e) => handleInputChange('modalidad', e.target.value)}
                                    />
                                    <span>Presencial</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="Virtual"
                                        checked={formData.modalidad === 'Virtual'}
                                        onChange={(e) => handleInputChange('modalidad', e.target.value)}
                                    />
                                    <span>Virtual</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="Híbrido"
                                        checked={formData.modalidad === 'Híbrido'}
                                        onChange={(e) => handleInputChange('modalidad', e.target.value)}
                                    />
                                    <span>Híbrido</span>
                                </label>
                            </div>
                        </div>

                        {(formData.modalidad === 'Presencial' || formData.modalidad === 'Híbrido') && (
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Building2 size={18} />
                                    Lugar Físico {formData.modalidad === 'Presencial' && <span className="required">*</span>}
                                </label>
                                <select
                                    value={formData.id_lugar}
                                    onChange={(e) => handleInputChange('id_lugar', e.target.value)}
                                    className="form-select-crear"
                                    required={formData.modalidad === 'Presencial'}
                                >
                                    <option value="">-- Seleccione un lugar --</option>
                                    {Array.isArray(lugares) ? (
                                        lugares.map((lugar) => (
                                            <option key={lugar.id} value={lugar.id}>
                                                {lugar.nombre} — {lugar.ubicacion?.direccion}
                                            </option>
                                        ))
                                    ) : (
                                        <option key={lugares.id} value={lugares.id}>
                                            {lugares.nombre} — {lugares.ubicacion?.direccion}
                                        </option>
                                    )}
                                </select>
                                {lugares.length === 0 && (
                                    <p className="form-hint text-warning">No hay lugares registrados</p>
                                )}
                            </div>
                        )}

                        {(formData.modalidad === 'Virtual' || formData.modalidad === 'Híbrido') && (
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    URL Virtual {formData.modalidad === 'Virtual' && <span className="required">*</span>}
                                </label>
                                <input
                                    type="url"
                                    value={formData.url_virtual}
                                    onChange={(e) => handleInputChange('url_virtual', e.target.value)}
                                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                    className="form-input-crear"
                                    required={formData.modalidad === 'Virtual'}
                                />
                            </div>
                        )}
                    </section>

                    {/* Agenda del Evento */}
                    <section className="form-section">
                        <h2 className="section-title">Agenda del Evento</h2>
                        <p className="section-description">Actividades Programadas</p>

                        {actividades.map((actividad, index) => (
                            <div key={index} className="actividad-card">
                                <div className="actividad-header">
                                    <h3 className="actividad-title">
                                        Actividad {index + 1}
                                        {actividad.esExistente && (
                                            <span style={{
                                                marginLeft: '0.5rem',
                                                fontSize: '0.75rem',
                                                color: '#667eea',
                                                fontWeight: 'normal'
                                            }}>
                                                (Guardada)
                                            </span>
                                        )}
                                    </h3>
                                    {actividades.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => eliminarActividadLocal(index)}
                                            className="btn-eliminar-actividad"
                                            title={actividad.esExistente ? "Eliminar de la base de datos" : "Quitar actividad"}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="form-group-crear">
                                    <label className="form-label-crear">Nombre de la Actividad</label>
                                    <input
                                        type="text"
                                        value={actividad.titulo}
                                        onChange={(e) => handleActividadChange(index, 'titulo', e.target.value)}
                                        placeholder="Ej: Conferencia inaugural"
                                        className="form-input-crear"
                                    />
                                </div>

                                <div className="form-row-crear">
                                    <div className="form-group-crear">
                                        <label className="form-label-crear">Fecha:</label>
                                        <input
                                            type="date"
                                            value={actividad.fecha_actividad}
                                            onChange={(e) => handleActividadChange(index, 'fecha_actividad', e.target.value)}
                                            className="form-input-crear"
                                        />
                                    </div>
                                    <div className="form-group-crear">
                                        <label className="form-label-crear">Hora de Inicio</label>
                                        <input
                                            type="time"
                                            value={actividad.hora_inicio}
                                            onChange={(e) => handleActividadChange(index, 'hora_inicio', e.target.value)}
                                            className="form-input-crear"
                                        />
                                    </div>
                                </div>

                                <div className="form-row-crear">
                                    <div className="form-group-crear">
                                        <label className="form-label-crear">Hora de Fin</label>
                                        <input
                                            type="time"
                                            value={actividad.hora_fin}
                                            onChange={(e) => handleActividadChange(index, 'hora_fin', e.target.value)}
                                            className="form-input-crear"
                                        />
                                    </div>
                                </div>

                                <div className="form-group-crear">
                                    <label className="form-label-crear">Descripción</label>
                                    <textarea
                                        value={actividad.descripcion}
                                        onChange={(e) => handleActividadChange(index, 'descripcion', e.target.value)}
                                        placeholder="Descripción breve de la actividad"
                                        className="form-textarea-crear"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={agregarActividad}
                            className="btn-agregar-actividad"
                        >
                            <Plus size={20} />
                            Agregar Actividad
                        </button>
                    </section>

                    {/* Detalles Adicionales */}
                    <section className="form-section">
                        <h2 className="section-title">Detalles Adicionales</h2>

                        <div className="form-group-crear">
                            <label className="form-label-crear">Descripción Adicional</label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                placeholder="Información adicional sobre el evento"
                                className="form-textarea-crear"
                                rows="5"
                            />
                        </div>
                    </section>

                    {/* Botones de Acción */}
                    <div className="form-actions-crear">
                        <button
                            type="button"
                            onClick={() => navigate('/organizador')}
                            className="btn-cancelar-crear"
                            disabled={guardando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="btn-submit-crear"
                        >
                            <Save size={20} />
                            {guardando ? 'Guardando Cambios...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de éxito */}
            {mostrarModalExito && (
                <div className="modal-overlay">
                    <div className="modal-exito">
                        <CheckCircle size={48} color="#28a745" />
                        <h2>¡Evento actualizado exitosamente!</h2>
                        <p>Las actividades también han sido actualizadas.</p>
                        <button
                            className="btn-submit-crear"
                            onClick={() => {
                                setMostrarModalExito(false);
                                navigate('/organizador');
                            }}
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default EditarEventoPage;