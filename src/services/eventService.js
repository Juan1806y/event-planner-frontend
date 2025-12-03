import { API_PREFIX } from '../config/apiConfig';
const API_BASE = API_PREFIX;

export const eventService = {
    async getAvailableEvents(token) {
        try {
            const response = await fetch(`${API_BASE}/inscripciones/eventos-disponibles`, {
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

            if (!result.success || !result.data) {
                throw new Error(result.message || 'Respuesta del servidor en formato inesperado');
            }

            const eventosFormateados = result.data.map(evento => this.formatEventData(evento));
            return eventosFormateados;
        } catch (error) {
            throw error;
        }
    },

    async getEventDetails(eventId, token) {
        try {
            const response = await fetch(`${API_BASE}/eventos/${eventId}`, {
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

            if (!result.success || !result.data) {
                throw new Error(result.message || 'Error al obtener detalles del evento');
            }

            return this.formatEventDetails(result.data);
        } catch (error) {
            throw error;
        }
    },

    formatEventData(evento) {
        return {
            id: evento.id,
            titulo: evento.titulo,
            descripcion: evento.descripcion || 'Sin descripción disponible',
            modalidad: evento.modalidad,
            hora: evento.hora,
            fecha_inicio: evento.fecha_inicio,
            fecha_fin: evento.fecha_fin,
            lugar: evento.lugar,
            cupo_total: evento.cupo_total,
            cupos_disponibles: evento.cupos_disponibles,
            estado_evento: evento.estado_evento || 'Disponible',
            empresa: evento.empresa,
            estado: 1,
            actividades: evento.actividades || [],
            creador: evento.creador || {},
            fecha_creacion: evento.fecha_creacion,
            fecha_actualizacion: evento.fecha_actualizacion
        };
    },

    formatEventDetails(evento) {
        let cuposDisponibles = evento.cupos_disponibles;

        if (cuposDisponibles === undefined || cuposDisponibles === null) {
            if (evento.inscritos_count !== undefined && evento.cupos !== undefined) {
                cuposDisponibles = Math.max(0, evento.cupos - evento.inscritos_count);
            } else {
                cuposDisponibles = 'No disponible';
            }
        }

        return {
            id: evento.id,
            titulo: evento.titulo,
            descripcion: evento.descripcion || 'Sin descripción disponible',
            modalidad: evento.modalidad,
            hora: evento.hora,
            fecha_inicio: evento.fecha_inicio,
            fecha_fin: evento.fecha_fin,
            lugar: evento.lugar,
            cupo_total: evento.cupos,
            cupos_disponibles: cuposDisponibles,
            estado_evento: evento.estado === 1 ? 'Disponible' : 'No disponible',
            empresa: evento.empresa?.nombre || evento.empresa || 'No especificada',
            estado: evento.estado,
            actividades: evento.actividades || [],
            creador: evento.creador || {},
            fecha_creacion: evento.fecha_creacion,
            fecha_actualizacion: evento.fecha_actualizacion,
            id_empresa: evento.id_empresa,
            id_creador: evento.id_creador,
            organizador: evento.creador?.nombre || 'No especificado',
            correo_organizador: evento.creador?.correo || 'No especificado',
            inscritos_count: evento.inscritos_count || 0
        };
    }
};

export default eventService;