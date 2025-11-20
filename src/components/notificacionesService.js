// notificacionesService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export async function obtenerMisNotificaciones() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No hay token de autenticación');

        const response = await axios.get(
            `${API_URL}/notificaciones/mis-notificaciones?estado=pendiente`,
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