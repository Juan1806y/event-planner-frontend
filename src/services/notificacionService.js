import { API_URL } from '../config/apiConfig';
const API_BASE = API_URL;

export const notificacionService = {
    async obtenerMisNotificaciones(token, params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.estado) queryParams.append('estado', params.estado);
            if (params.entidad_tipo) queryParams.append('entidad_tipo', params.entidad_tipo);
            if (params.limit) queryParams.append('limit', params.limit);

            const url = `${API_BASE}/notificaciones/mis-notificaciones?${queryParams}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Error al obtener notificaciones');
            }

            return {
                notificaciones: result.data || [],
                total: result.total || 0
            };
        } catch (error) {
            throw error;
        }
    },

    async marcarComoLeida(notificacionId, token) {
        try {
            const response = await fetch(
                `${API_BASE}/notificaciones/${notificacionId}/marcar-leida`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Error al marcar notificación como leída');
            }

            return result.data;
        } catch (error) {
            throw error;
        }
    },

    async eliminarNotificacion(notificacionId, token) {
        try {
            const response = await fetch(
                `${API_BASE}/notificaciones/${notificacionId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Error al eliminar notificación');
            }

            return result;
        } catch (error) {
            throw error;
        }
    },

    formatearNotificaciones(notificaciones) {
        return notificaciones.map(notif => ({
            id: notif.id,
            titulo: notif.titulo,
            contenido: notif.contenido,
            tipo: notif.tipoNotificacion?.nombre,
            prioridad: notif.prioridad,
            estado: notif.estado,
            fechaCreacion: new Date(notif.fecha_creacion),
            fechaLeida: notif.fecha_leida ? new Date(notif.fecha_leida) : null,
            datosAdicionales: notif.datos_adicionales,
            entidadTipo: notif.entidad_tipo,
            entidadId: notif.entidad_id,
            idEvento: notif.id_evento
        }));
    },
};

export default notificacionService;