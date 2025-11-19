// services/eventoService.js - CORREGIDO
const API_BASE = 'http://localhost:3000/api';

export const eventService = {
    async getAvailableEvents(token) {
        try {
            console.log('🌐 Haciendo request a:', `${API_BASE}/inscripciones/eventos-disponibles`);

            const response = await fetch(`${API_BASE}/inscripciones/eventos-disponibles`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📦 Response data del backend:', result);

            if (!result.success || !result.data) {
                console.error('❌ Respuesta sin éxito:', result);
                throw new Error(result.message || 'Respuesta del servidor en formato inesperado');
            }

            const eventosFormateados = result.data.map(evento => this.formatEventData(evento));
            console.log('✨ Eventos formateados:', eventosFormateados);

            return eventosFormateados;
        } catch (error) {
            console.error('💥 Error en getAvailableEvents:', error);
            throw error;
        }
    },

    async getEventDetails(eventId, token) {
        try {
            console.log('🔍 Obteniendo detalles completos del evento:', eventId);

            const response = await fetch(`${API_BASE}/eventos/${eventId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status para detalles:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response detalles:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📦 Detalles completos del evento:', result);

            if (!result.success || !result.data) {
                console.error('❌ Respuesta sin éxito en detalles:', result);
                throw new Error(result.message || 'Error al obtener detalles del evento');
            }

            return this.formatEventDetails(result.data);
        } catch (error) {
            console.error('💥 Error en getEventDetails:', error);
            throw error;
        }
    },

    formatEventData(evento) {
        console.log('📝 Datos CRUDOS del backend (eventos disponibles):', evento);

        const eventoFormateado = {
            id: evento.id,
            titulo: evento.titulo,
            descripcion: evento.descripcion || 'Sin descripción disponible',
            modalidad: evento.modalidad,
            hora: evento.hora,
            fecha_inicio: evento.fecha_inicio,
            fecha_fin: evento.fecha_fin,
            lugar: evento.lugar,
            cupo_total: evento.cupo_total,
            cupos_disponibles: evento.cupos_disponibles, // ✅ Este viene del endpoint de eventos disponibles
            estado_evento: evento.estado_evento || 'Disponible',
            empresa: evento.empresa,
            estado: 1,
            actividades: evento.actividades || [],
            creador: evento.creador || {},
            fecha_creacion: evento.fecha_creacion,
            fecha_actualizacion: evento.fecha_actualizacion
        };

        return eventoFormateado;
    },

    formatEventDetails(evento) {
        console.log('📋 Formateando detalles completos:', evento);

        // ✅ CALCULAR cupos_disponibles si no viene del endpoint de detalles
        let cuposDisponibles = evento.cupos_disponibles;
        
        if (cuposDisponibles === undefined || cuposDisponibles === null) {
            // Si tenemos información de inscritos, calcular cupos disponibles
            if (evento.inscritos_count !== undefined && evento.cupos !== undefined) {
                cuposDisponibles = Math.max(0, evento.cupos - evento.inscritos_count);
                console.log('🧮 Cupos disponibles calculados:', cuposDisponibles);
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
            cupo_total: evento.cupos, // En el endpoint /eventos viene como "cupos"
            cupos_disponibles: cuposDisponibles, // ✅ Ahora siempre tendrá valor
            estado_evento: evento.estado === 1 ? 'Disponible' : 'No disponible',
            empresa: evento.empresa?.nombre || evento.empresa || 'No especificada',
            estado: evento.estado,
            actividades: evento.actividades || [],
            creador: evento.creador || {},
            fecha_creacion: evento.fecha_creacion,
            fecha_actualizacion: evento.fecha_actualizacion,
            // Campos adicionales del endpoint /eventos
            id_empresa: evento.id_empresa,
            id_creador: evento.id_creador,
            organizador: evento.creador?.nombre || 'No especificado',
            correo_organizador: evento.creador?.correo || 'No especificado',
            // Información para cálculo de cupos
            inscritos_count: evento.inscritos_count || 0
        };
    }
};

export default eventService;