// notificacionesService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Obtener mis notificaciones filtradas por estado
 * @param {string} estado - 'pendiente' o 'leida'
 */
export async function obtenerMisNotificaciones(estado = 'pendiente') {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No hay token de autenticación');

        const response = await axios.get(
            `${API_URL}/notificaciones/mis-notificaciones?estado=${estado}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data.data;
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        throw error;
    }
}

/**
 * Obtener notificaciones aprobadas o rechazadas
 * @param {string} estadoSolicitud - 'aprobada' o 'rechazada'
 */
export async function obtenerNotificacionesPorEstadoSolicitud(estadoSolicitud) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No hay token de autenticación');

        // Obtener todas las notificaciones leídas de tipo 1 (solicitudes)
        const response = await axios.get(
            `${API_URL}/notificaciones/mis-notificaciones?estado=leida`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        const notificaciones = response.data.data || [];

        // Filtrar solo las notificaciones de tipo 1 que tienen asignación
        const notificacionesTipo1 = notificaciones.filter(n =>
            (n.id_TipoNotificacion === 1 || n.id_TipoNotificacion === '1') &&
            n.datos_adicionales?.id_ponente &&
            n.datos_adicionales?.id_actividad
        );

        // Para cada notificación, consultar el estado de la solicitud
        const notificacionesConEstado = await Promise.all(
            notificacionesTipo1.map(async (notif) => {
                try {
                    const asignacion = await obtenerAsignacion(
                        notif.datos_adicionales.id_ponente,
                        notif.datos_adicionales.id_actividad
                    );

                    const asignacionData = asignacion.data || asignacion;
                    return {
                        ...notif,
                        estado_solicitud: asignacionData.estado_solicitud
                    };
                } catch (error) {
                    console.error('Error obteniendo estado de asignación:', error);
                    return null;
                }
            })
        );

        // Filtrar por el estado solicitado y eliminar nulos
        return notificacionesConEstado.filter(n =>
            n && n.estado_solicitud === estadoSolicitud
        );
    } catch (error) {
        console.error('Error al obtener notificaciones por estado de solicitud:', error);
        throw error;
    }
}

/**
 * Revisar detalles de una notificación
 * @param {number} notificacionId 
 */
export async function obtenerDetalleNotificacion(notificacionId) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No hay token de autenticación');

        const response = await axios.get(
            `${API_URL}/notificaciones/${notificacionId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data.data;
    } catch (error) {
        console.error('Error al obtener detalle de notificación:', error);
        throw error;
    }
}

/**
 * Marcar una notificación como leída
 * @param {number} notificacionId 
 */
export async function marcarComoLeida(notificacionId) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No hay token de autenticación');

        const response = await axios.put(
            `${API_URL}/notificaciones/${notificacionId}/marcar-leida`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data.data;
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        throw error;
    }
}

/**
 * Eliminar una notificación
 * @param {number} notificacionId 
 */
export async function eliminarNotificacion(notificacionId) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No hay token de autenticación');

        const response = await axios.delete(
            `${API_URL}/notificaciones/${notificacionId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        throw error;
    }
}

/**
 * Revisar asignación de ponente en actividad
 * @param {number} idPonente 
 * @param {number} idActividad 
 */
export async function obtenerAsignacion(idPonente, idActividad) {
    try {
        const response = await axios.get(
            `${API_URL}/ponente-actividad/${idPonente}/${idActividad}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al obtener asignación:', error);
        throw error;
    }
}

/**
 * Procesar solicitud de ponente (aprobar o rechazar)
 * @param {number} idPonente 
 * @param {number} idActividad 
 * @param {boolean} aprobada 
 * @param {string} comentarios 
 */
export async function procesarSolicitud(idPonente, idActividad, aprobada, comentarios) {
    try {
        const response = await axios.put(
            `${API_URL}/ponente-actividad/${idPonente}/${idActividad}/procesar-solicitud`,
            { aprobada, comentarios },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al procesar solicitud:', error);
        throw error;
    }
}

/**
 * Actualizar actividad con los cambios solicitados
 * @param {number} idActividad 
 * @param {object} cambios Objeto con los campos a actualizar
 */
export async function actualizarActividad(idActividad, cambios) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No hay token de autenticación');

        // Preparar el objeto de actualización
        const datosActualizacion = {};

        if (cambios.titulo) {
            datosActualizacion.titulo = cambios.titulo;
        }
        if (cambios.descripcion) {
            datosActualizacion.descripcion = cambios.descripcion;
        }
        if (cambios.hora_inicio) {
            // Asegurar formato HH:MM:SS
            datosActualizacion.hora_inicio = cambios.hora_inicio.length === 5
                ? `${cambios.hora_inicio}:00`
                : cambios.hora_inicio;
        }
        if (cambios.hora_fin) {
            // Asegurar formato HH:MM:SS
            datosActualizacion.hora_fin = cambios.hora_fin.length === 5
                ? `${cambios.hora_fin}:00`
                : cambios.hora_fin;
        }
        if (cambios.fecha_actividad) {
            datosActualizacion.fecha_actividad = cambios.fecha_actividad;
        }

        const response = await axios.put(
            `${API_URL}/actividades/${idActividad}`,
            datosActualizacion,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error al actualizar actividad:', error);
        throw error;
    }
}

/**
 * Actualizar horario de una actividad (legacy - mantener por compatibilidad)
 * @param {number} idActividad 
 * @param {string} horaInicio Formato "HH:MM:SS"
 * @param {string} horaFin Formato "HH:MM:SS"
 */
export async function actualizarHorarioActividad(idActividad, horaInicio, horaFin) {
    return actualizarActividad(idActividad, {
        hora_inicio: horaInicio,
        hora_fin: horaFin
    });
}