// notificacionesService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Obtener notificaciones pendientes del organizador
 */
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

        // Devuelve solo el array
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

        // Devuelve solo la data del detalle de la notificación
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
        const response = await axios.get(`${API_URL}/ponente-actividad/${idPonente}/${idActividad}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });
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
 * Actualizar horario de una actividad
 * @param {number} idActividad 
 * @param {string} horaInicio Formato "HH:MM:SS"
 * @param {string} horaFin Formato "HH:MM:SS"
 */
export async function actualizarHorarioActividad(idActividad, horaInicio, horaFin) {
    try {
        const response = await axios.put(
            `${API_URL}/actividades/${idActividad}`,
            { hora_inicio: horaInicio, hora_fin: horaFin },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al actualizar horario de actividad:', error);
        throw error;
    }
}