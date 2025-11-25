import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Clock, User, Calendar, MessageSquare, Loader2, AlertCircle, Edit, Trash2, Archive } from 'lucide-react';
import {
    obtenerMisNotificaciones,
    obtenerDetalleNotificacion,
    obtenerAsignacion,
    procesarSolicitud,
    marcarComoLeida,
    eliminarNotificacion
} from '../../../components/notificacionesService';
import { actualizarActividad } from '../../../components/eventosService';
import './OrganizadorNotificaciones.css';
import Sidebar from '../Sidebar';

const OrganizadorNotificaciones = () => {
    const [vistaActual, setVistaActual] = useState('pendientes'); // 'pendientes' o 'leidas'
    const [notificaciones, setNotificaciones] = useState([]);
    const [detalle, setDetalle] = useState(null);
    const [asignacion, setAsignacion] = useState(null);
    const [comentarios, setComentarios] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [cargando, setCargando] = useState(false);
    const [actualizandoActividad, setActualizandoActividad] = useState(false);
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        cargarNotificaciones();
    }, [vistaActual]);

    const cargarNotificaciones = async () => {
        setCargando(true);
        try {
            const estado = vistaActual === 'pendientes' ? 'pendiente' : 'leida';
            const data = await obtenerMisNotificaciones(estado);
            setNotificaciones(data);
        } catch (error) {
            alert('Error cargando notificaciones');
        } finally {
            setCargando(false);
        }
    };

    const verDetalle = async (id) => {
        try {
            const data = await obtenerDetalleNotificacion(id);
            console.log('Detalle notificación:', data);
            setDetalle(data);

            setAsignacion(null);
            setComentarios('');
            setHoraInicio('');
            setHoraFin('');

            // Si estamos en vista de pendientes, marcar automáticamente como leída
            if (vistaActual === 'pendientes') {
                try {
                    await marcarComoLeida(id);
                    // Actualizar la lista después de un breve delay
                    setTimeout(() => cargarNotificaciones(), 500);
                } catch (error) {
                    console.error('Error marcando como leída:', error);
                }
            }

            const esTipo1 = data.id_TipoNotificacion === 1 || data.id_TipoNotificacion === '1';
            console.log('Es tipo 1?:', esTipo1, 'Valor:', data.id_TipoNotificacion);

            const idPonente = data.datos_adicionales?.id_ponente;
            const idActividad = data.datos_adicionales?.id_actividad;

            if (data.datos_adicionales?.cambios_solicitados) {
                const { hora_inicio, hora_fin } = data.datos_adicionales.cambios_solicitados;
                if (hora_inicio) {
                    setHoraInicio(hora_inicio.substring(0, 5));
                }
                if (hora_fin) {
                    setHoraFin(hora_fin.substring(0, 5));
                }
            }

            if (esTipo1 && idPonente && idActividad) {
                console.log('Cargando asignación para ponente:', idPonente, 'actividad:', idActividad);
                await cargarAsignacion(idPonente, idActividad);
            } else {
                console.log('No se cumple condición. Tipo:', data.id_TipoNotificacion, 'Ponente:', idPonente, 'Actividad:', idActividad);
            }
        } catch (error) {
            console.error('Error obteniendo detalle:', error);
            alert('Error obteniendo detalle');
        }
    };

    const cargarAsignacion = async (idPonente, idActividad) => {
        try {
            const response = await obtenerAsignacion(idPonente, idActividad);
            console.log('Asignación cargada:', response);

            const asignacionData = response.data || response;
            setAsignacion(asignacionData);
        } catch (error) {
            console.error('Error obteniendo asignación:', error);
            alert('Error obteniendo asignación del ponente');
        }
    };

    const aplicarCambiosActividad = async () => {
        if (!detalle?.datos_adicionales?.cambios_solicitados) {
            alert('No hay cambios solicitados para aplicar');
            return;
        }

        if (!detalle.datos_adicionales?.id_actividad) {
            alert('No se encontró el ID de la actividad');
            return;
        }

        const idActividad = detalle.datos_adicionales.id_actividad;
        const cambios = detalle.datos_adicionales.cambios_solicitados;

        console.log('Aplicando cambios a actividad:', idActividad);
        console.log('Cambios a aplicar:', cambios);

        setActualizandoActividad(true);
        try {
            const resultado = await actualizarActividad(idActividad, cambios);
            console.log('Respuesta del PUT:', resultado);
            alert('Actividad actualizada correctamente');

            // Recargar la asignación para ver los cambios reflejados
            const idPonente = detalle.datos_adicionales?.id_ponente;
            if (idPonente) {
                await cargarAsignacion(idPonente, idActividad);
            }
        } catch (error) {
            console.error('Error actualizando actividad:', error);
            alert(`Error actualizando actividad: ${error.response?.data?.message || error.message}`);
        } finally {
            setActualizandoActividad(false);
        }
    };

    const manejarSolicitud = async (aprobada) => {
        if (!asignacion) {
            alert('No hay asignación cargada');
            return;
        }

        try {
            const idPonente = asignacion.ponente.id_ponente;
            const idActividad = asignacion.actividad.id_actividad;

            await procesarSolicitud(idPonente, idActividad, aprobada, comentarios);

            alert(`Solicitud ${aprobada ? 'aprobada' : 'rechazada'} correctamente`);

            setDetalle(null);
            setAsignacion(null);
            setComentarios('');
            setHoraInicio('');
            setHoraFin('');

            cargarNotificaciones();
        } catch (error) {
            console.error(error);
            alert('Error procesando la solicitud');
        }
    };

    const manejarEliminar = async (notificacionId, event) => {
        if (event) {
            event.stopPropagation(); // Evitar que se abra el detalle
        }

        if (!window.confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
            return;
        }

        setProcesando(true);
        try {
            await eliminarNotificacion(notificacionId);

            // Si estamos viendo el detalle de esta notificación, cerrarlo
            if (detalle?.id === notificacionId) {
                setDetalle(null);
                setAsignacion(null);
                setComentarios('');
                setHoraInicio('');
                setHoraFin('');
            }

            // Recargar la lista
            await cargarNotificaciones();
            alert('Notificación eliminada correctamente');
        } catch (error) {
            console.error('Error eliminando notificación:', error);
            alert('Error al eliminar la notificación');
        } finally {
            setProcesando(false);
        }
    };

    const cerrarDetalle = () => {
        setDetalle(null);
        setAsignacion(null);
        setComentarios('');
        setHoraInicio('');
        setHoraFin('');
    };

    return (
        <div className="organizador-container">
            <Sidebar />
            <div className="organizador-wrapper">
                {/* Header */}
                <div className="organizador-header">
                    <div className="header-title">
                        <Bell className="icon-lg" style={{ color: '#4f46e5' }} />
                        <h2>Notificaciones</h2>
                    </div>
                    <p className="header-subtitle">Gestiona las solicitudes y notificaciones de tu evento</p>
                </div>

                {/* Tabs de Vista */}
                <div className="tabs-container">
                    <button
                        className={`tab-button ${vistaActual === 'pendientes' ? 'tab-active' : ''}`}
                        onClick={() => setVistaActual('pendientes')}
                    >
                        <Bell className="icon-sm" />
                        Pendientes
                    </button>
                    <button
                        className={`tab-button ${vistaActual === 'leidas' ? 'tab-active' : ''}`}
                        onClick={() => setVistaActual('leidas')}
                    >
                        <Archive className="icon-sm" />
                        Leídas
                    </button>
                </div>

                <div className="notificaciones-grid">
                    {/* Lista de Notificaciones */}
                    <div className="notificaciones-list-card">
                        <h3 className="notificaciones-list-header">
                            {vistaActual === 'pendientes' ? (
                                <>
                                    <Bell className="icon-md" style={{ color: '#4f46e5' }} />
                                    Bandeja de Entrada
                                </>
                            ) : (
                                <>
                                    <Archive className="icon-md" style={{ color: '#4f46e5' }} />
                                    Notificaciones Leídas
                                </>
                            )}
                        </h3>

                        {cargando ? (
                            <div className="cargando">
                                <Loader2 className="cargando-spinner" />
                            </div>
                        ) : notificaciones.length === 0 ? (
                            <div className="estado-vacio">
                                <AlertCircle className="estado-vacio-icono" />
                                <p className="estado-vacio-texto">
                                    {vistaActual === 'pendientes'
                                        ? 'No hay notificaciones pendientes'
                                        : 'No hay notificaciones leídas'}
                                </p>
                            </div>
                        ) : (
                            <ul className="notificaciones-list">
                                {notificaciones.map(n => (
                                    <li key={n.id} onClick={() => verDetalle(n.id)}>
                                        <div className="notificacion-item">
                                            <div className="notificacion-contenido">
                                                {vistaActual === 'pendientes' && (
                                                    <div className="notificacion-punto"></div>
                                                )}
                                                <div className="notificacion-info">
                                                    <span className="notificacion-titulo">{n.titulo}</span>
                                                    {n.fecha_creada && (
                                                        <span className="notificacion-fecha">
                                                            {new Date(n.fecha_creada).toLocaleDateString('es-ES', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="notificacion-acciones">
                                                {vistaActual === 'leidas' && (
                                                    <button
                                                        className="btn-eliminar-mini"
                                                        onClick={(e) => manejarEliminar(n.id, e)}
                                                        disabled={procesando}
                                                        title="Eliminar notificación"
                                                    >
                                                        <Trash2 className="icon-sm" />
                                                    </button>
                                                )}
                                                <svg
                                                    className="notificacion-flecha"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Panel de Detalles */}
                    <div>
                        {detalle && (
                            <div className="detalle-card">
                                <div className="detalle-header">
                                    <h3>Detalle de Notificación</h3>
                                    <button className="btn-cerrar" onClick={cerrarDetalle}>
                                        <XCircle className="icon-md" />
                                    </button>
                                </div>
                                <div className="detalle-info">
                                    <div className="detalle-row">
                                        <span className="detalle-label">ID:</span>
                                        <span className="detalle-value-mono">{detalle.id}</span>
                                    </div>
                                    <div className="detalle-row">
                                        <span className="detalle-label">Título:</span>
                                        <span className="detalle-value">{detalle.titulo}</span>
                                    </div>
                                    <div>
                                        <span className="detalle-badge">
                                            Tipo {detalle.id_TipoNotificacion}
                                        </span>
                                    </div>
                                </div>

                                {/* Mostrar JSON de cambios solicitados */}
                                {detalle.datos_adicionales?.cambios_solicitados && (
                                    <div className="cambios-solicitados">
                                        <div className="cambios-header">
                                            <Edit className="icon-sm" style={{ color: '#059669' }} />
                                            <strong style={{ color: '#059669' }}>Cambios Solicitados (JSON):</strong>
                                        </div>
                                        <pre className="cambios-json">
                                            {JSON.stringify(detalle.datos_adicionales.cambios_solicitados, null, 2)}
                                        </pre>
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <button
                                                className="btn btn-aprobar"
                                                onClick={aplicarCambiosActividad}
                                                disabled={actualizandoActividad}
                                                style={{ width: '100%' }}
                                            >
                                                {actualizandoActividad ? (
                                                    <>
                                                        <Loader2 className="icon-md cargando-spinner" />
                                                        Aplicando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="icon-md" />
                                                        Aplicar Cambios a Actividad
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Botón para eliminar desde el detalle (solo en vista de leídas) */}
                                {vistaActual === 'leidas' && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <button
                                            className="btn btn-eliminar"
                                            onClick={(e) => manejarEliminar(detalle.id, e)}
                                            disabled={procesando}
                                        >
                                            <Trash2 className="icon-md" />
                                            Eliminar Notificación
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {asignacion && detalle && (detalle.id_TipoNotificacion === 1 || detalle.id_TipoNotificacion === '1') && (
                            <div className="asignacion-card" style={{ marginTop: detalle ? '1.5rem' : '0' }}>
                                <h3>
                                    <User className="icon-md" style={{ color: '#4f46e5' }} />
                                    Solicitud de Ponente
                                </h3>

                                <div className="asignacion-info">
                                    <div className="info-box">
                                        <div className="info-box-header">
                                            <User className="icon-sm" style={{ color: '#4b5563' }} />
                                            <span className="info-box-label">Ponente</span>
                                        </div>
                                        <p className="info-box-value">
                                            {asignacion.ponente?.usuario?.nombre || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="info-box">
                                        <div className="info-box-header">
                                            <Calendar className="icon-sm" style={{ color: '#4b5563' }} />
                                            <span className="info-box-label">Actividad</span>
                                        </div>
                                        <p className="info-box-value">
                                            {asignacion.actividad?.titulo || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Mostrar horario actual de la actividad */}
                                    <div className="info-box">
                                        <div className="info-box-header">
                                            <Clock className="icon-sm" style={{ color: '#4b5563' }} />
                                            <span className="info-box-label">Horario Actual</span>
                                        </div>
                                        <p className="info-box-value">
                                            {asignacion.actividad?.hora_inicio?.substring(0, 5) || 'N/A'} - {asignacion.actividad?.hora_fin?.substring(0, 5) || 'N/A'}
                                        </p>
                                    </div>

                                    {detalle.datos_adicionales?.justificacion && (
                                        <div className="justificacion">
                                            <div className="justificacion-header">
                                                <MessageSquare className="icon-sm" style={{ color: '#d97706' }} />
                                                <span className="justificacion-label">Justificación</span>
                                            </div>
                                            <p className="justificacion-texto">
                                                "{detalle.datos_adicionales.justificacion}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <div>
                                        <label className="form-label">
                                            Comentarios del organizador
                                        </label>
                                        <textarea
                                            className="form-textarea"
                                            value={comentarios}
                                            onChange={(e) => setComentarios(e.target.value)}
                                            rows="3"
                                            placeholder="Ej: Aprobado. Horario actualizado según solicitud."
                                        />
                                    </div>

                                    <div className="botones-container">
                                        <button
                                            className="btn btn-aprobar"
                                            onClick={() => manejarSolicitud(true)}
                                        >
                                            <CheckCircle className="icon-md" />
                                            Aprobar Solicitud
                                        </button>
                                        <button
                                            className="btn btn-rechazar"
                                            onClick={() => manejarSolicitud(false)}
                                        >
                                            <XCircle className="icon-md" />
                                            Rechazar Solicitud
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizadorNotificaciones;