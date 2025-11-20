// OrganizadorNotificaciones.jsx
import React, { useState, useEffect } from 'react';
import {
    obtenerMisNotificaciones,
    obtenerDetalleNotificacion,
    obtenerAsignacion,
    procesarSolicitud,
    actualizarHorarioActividad
} from '../../../components/notificacionesService';

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
            setDetalle(data);
        } catch (error) {
            alert('Error obteniendo detalle');
        }
    };

    const verAsignacion = async (idPonente, idActividad) => {
        try {
            const data = await obtenerAsignacion(idPonente, idActividad);
            setAsignacion(data);
        } catch (error) {
            alert('Error obteniendo asignación');
        }
    };

    const manejarAprobacion = async (idPonente, idActividad, aprobada) => {
        try {
            await procesarSolicitud(idPonente, idActividad, aprobada, comentarios);
            if (aprobada && horaInicio && horaFin) {
                await actualizarHorarioActividad(idActividad, horaInicio, horaFin);
            }
            alert('Solicitud procesada correctamente');
            cargarNotificaciones(); // refresca la lista
            setDetalle(null);
            setAsignacion(null);
            setComentarios('');
            setHoraInicio('');
            setHoraFin('');
        } catch (error) {
            alert('Error procesando solicitud');
        }
    };

    return (
        <div>
            <h2>Notificaciones Pendientes</h2>
            {cargando ? <p>Cargando...</p> : null}
            <ul>
                {notificaciones.map((n) => (
                    <li key={n.id}>
                        <span>{n.titulo}</span>
                        <button onClick={() => verDetalle(n.id)}>Ver Detalle</button>
                    </li>
                ))}
            </ul>

            {detalle && (
                <div style={{ marginTop: '20px', border: '1px solid gray', padding: '10px' }}>
                    <h3>Detalle de Notificación</h3>
                    <p>ID: {detalle.id}</p>
                    <p>Descripción: {detalle.descripcion}</p>

                    {detalle.id_ponente && detalle.id_actividad && (
                        <>
                            <button
                                onClick={() =>
                                    verAsignacion(detalle.id_ponente, detalle.id_actividad)
                                }
                            >
                                Ver Asignación del Ponente
                            </button>
                        </>
                    )}
                </div>
            )}

            {asignacion && (
                <div style={{ marginTop: '20px', border: '1px solid blue', padding: '10px' }}>
                    <h3>Asignación</h3>
                    <p>Ponente: {asignacion.ponente.nombre}</p>
                    <p>Actividad: {asignacion.actividad.titulo}</p>

                    <div style={{ marginTop: '10px' }}>
                        <label>
                            Comentarios:
                            <input
                                type="text"
                                value={comentarios}
                                onChange={(e) => setComentarios(e.target.value)}
                            />
                        </label>
                        <br />
                        <label>
                            Hora Inicio (solo si aprueba):
                            <input
                                type="time"
                                value={horaInicio}
                                onChange={(e) => setHoraInicio(e.target.value)}
                            />
                        </label>
                        <br />
                        <label>
                            Hora Fin (solo si aprueba):
                            <input
                                type="time"
                                value={horaFin}
                                onChange={(e) => setHoraFin(e.target.value)}
                            />
                        </label>
                        <br />
                        <button
                            onClick={() =>
                                manejarAprobacion(asignacion.ponente.id, asignacion.actividad.id, true)
                            }
                        >
                            Aprobar
                        </button>
                        <button
                            onClick={() =>
                                manejarAprobacion(asignacion.ponente.id, asignacion.actividad.id, false)
                            }
                            style={{ marginLeft: '10px' }}
                        >
                            Rechazar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizadorNotificaciones;
