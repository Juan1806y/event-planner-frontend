import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Clock, User, Calendar, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import {
    obtenerMisNotificaciones,
    obtenerDetalleNotificacion,
    obtenerAsignacion,
    procesarSolicitud,
    actualizarHorarioActividad
} from '../../../components/notificacionesService';
import './OrganizadorNotificaciones.css';
import Sidebar from '../Sidebar';

const OrganizadorNotificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [detalle, setDetalle] = useState(null);
    const [asignacion, setAsignacion] = useState(null);
    const [comentarios, setComentarios] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        cargarNotificaciones();
    }, []);

    const cargarNotificaciones = async () => {
        setCargando(true);
        try {
            const data = await obtenerMisNotificaciones();
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

    return (
        <div className="organizador-container">
            <Sidebar />
            <div className="organizador-wrapper">
                {/* Header */}
                <div className="organizador-header">
                    <div className="header-title">
                        <Bell className="icon-lg" style={{ color: '#4f46e5' }} />
                        <h2>Notificaciones Pendientes</h2>
                    </div>
                    <p className="header-subtitle">Gestiona las solicitudes y notificaciones de tu evento</p>
                </div>

                <div className="notificaciones-grid">
                    {/* Lista de Notificaciones */}
                    <div className="notificaciones-list-card">
                        <h3 className="notificaciones-list-header">
                            <Bell className="icon-md" style={{ color: '#4f46e5' }} />
                            Bandeja de Entrada
                        </h3>

                        {cargando ? (
                            <div className="cargando">
                                <Loader2 className="cargando-spinner" />
                            </div>
                        ) : notificaciones.length === 0 ? (
                            <div className="estado-vacio">
                                <AlertCircle className="estado-vacio-icono" />
                                <p className="estado-vacio-texto">No hay notificaciones pendientes</p>
                            </div>
                        ) : (
                            <ul className="notificaciones-list">
                                {notificaciones.map(n => (
                                    <li key={n.id} onClick={() => verDetalle(n.id)}>
                                        <div className="notificacion-item">
                                            <div className="notificacion-contenido">
                                                <div className="notificacion-punto"></div>
                                                <span className="notificacion-titulo">{n.titulo}</span>
                                            </div>
                                            <svg
                                                className="notificacion-flecha"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
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
                                <h3>Detalle de Notificación</h3>
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
                                            Aprobar
                                        </button>
                                        <button
                                            className="btn btn-rechazar"
                                            onClick={() => manejarSolicitud(false)}
                                        >
                                            <XCircle className="icon-md" />
                                            Rechazar
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