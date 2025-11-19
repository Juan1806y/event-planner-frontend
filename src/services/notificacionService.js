import { API_PREFIX } from '../config/apiConfig';
const API_BASE = API_PREFIX;

export const notificacionService = {
    /**
     * Obtiene las notificaciones del usuario
     */
    async obtenerMisNotificaciones(token, params = {}) {
        try {
            console.log('🔔 Obteniendo notificaciones...');

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

            console.log('📡 Response status notificaciones:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response notificaciones:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📦 Notificaciones obtenidas:', result);

            if (!result.success) {
                throw new Error(result.message || 'Error al obtener notificaciones');
            }

            return {
                notificaciones: result.data || [],
                total: result.total || 0
            };
        } catch (error) {
            console.error('💥 Error en obtenerMisNotificaciones:', error);
            throw error;
        }
    },

    /**
     * Marca una notificación como leída
     */
    async marcarComoLeida(notificacionId, token) {
        try {
            console.log(`📝 Marcando notificación como leída: ${notificacionId}`);

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

            console.log('📡 Response status marcar leída:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response marcar leída:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Notificación marcada como leída:', result);

            if (!result.success) {
                throw new Error(result.message || 'Error al marcar notificación como leída');
            }

            return result.data;
        } catch (error) {
            console.error('💥 Error en marcarComoLeida:', error);
            throw error;
        }
    },

    /**
     * Elimina una notificación
     */
    async eliminarNotificacion(notificacionId, token) {
        try {
            console.log(`🗑️ Eliminando notificación: ${notificacionId}`);

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

            console.log('📡 Response status eliminar:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response eliminar:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Notificación eliminada:', result);

            if (!result.success) {
                throw new Error(result.message || 'Error al eliminar notificación');
            }

            return result;
        } catch (error) {
            console.error('💥 Error en eliminarNotificacion:', error);
            throw error;
        }
    },

    /**
     * Formatea las notificaciones para mostrar
     */
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

    /**
     * Obtiene notificaciones no leídas
     */
    async obtenerNoLeidas(token) {
        try {
            const resultado = await this.obtenerMisNotificaciones(token, {
                estado: 'no_leida',
                limit: 50
            });

            return this.formatearNotificaciones(resultado.notificaciones);
        } catch (error) {
            console.error('💥 Error en obtenerNoLeidas:', error);
            throw error;
        }
    },

    /**
     * Obtiene el conteo de notificaciones no leídas
     */
    async obtenerConteoNoLeidas(token) {
        try {
            const resultado = await this.obtenerMisNotificaciones(token, {
                estado: 'no_leida',
                limit: 1
            });

            return resultado.total;
        } catch (error) {
            console.error('💥 Error en obtenerConteoNoLeidas:', error);
            return 0;
        }
    }
};

export default notificacionService;