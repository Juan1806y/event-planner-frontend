// src/pages/ponente/services/ponenteEventosService.js
const API_BASE = 'http://localhost:3000/api';

export const ponenteEventosService = {
    /**
     * Obtiene eventos disponibles para que el ponente los vea
     */
    async obtenerEventosDisponibles(token) {
        try {
            console.log('🎤 Obteniendo eventos disponibles para ponente...');

            const response = await fetch(`${API_BASE}/inscripciones/eventos-disponibles`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status eventos disponibles:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response eventos disponibles:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📦 Eventos disponibles:', result);

            if (!result.success) {
                throw new Error(result.message || 'Error al obtener eventos disponibles');
            }

            return this.formatearEventosLista(result.data || []);
        } catch (error) {
            console.error('💥 Error en obtenerEventosDisponibles:', error);
            throw error;
        }
    },

    /**
     * Obtiene detalles completos de un evento específico
     */
    async obtenerDetallesEvento(eventoId, token) {
        try {
            console.log(`🔍 Obteniendo detalles del evento: ${eventoId}`);

            const response = await fetch(`${API_BASE}/eventos/${eventoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status detalles evento:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response detalles evento:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📦 Detalles COMPLETOS del evento:', result);

            if (!result.success || !result.data) {
                throw new Error(result.message || 'Error al obtener detalles del evento');
            }

            return this.formatearDetallesEvento(result.data);
        } catch (error) {
            console.error('💥 Error en obtenerDetallesEvento:', error);
            throw error;
        }
    },

    /**
     * Formatea los eventos para la lista (más simple)
     */
    formatearEventosLista(eventos) {
        return eventos.map(evento => ({
            id: evento.id,
            titulo: evento.titulo || evento.nombre,
            descripcion: evento.descripcion,
            fecha_inicio: evento.fecha_inicio,
            fecha_fin: evento.fecha_fin,
            hora: evento.hora,
            modalidad: evento.modalidad,
            estado_evento: evento.estado || evento.estado_evento,
            cupo_total: evento.cupo_total,
            cupos_disponibles: evento.cupos_disponibles,
            empresa: evento.empresa,
            organizador: evento.organizador,
            correo_organizador: evento.correo_organizador,
            fecha_creacion: evento.fecha_creacion,
            fecha_actualizacion: evento.fecha_actualizacion,
            actividades: evento.actividades || []
        }));
    },

    /**
     * Formatea los detalles del evento (más robusto para objetos anidados)
     */
    formatearDetallesEvento(evento) {
        console.log('📋 Formateando detalles completos para ponente:', evento);

        // Función para extraer valores de objetos anidados de forma segura
        const extraerValorSeguro = (obj, posiblesClaves, defaultValue = 'No disponible') => {
            if (!obj) return defaultValue;

            // Si es string, número o booleano, devolverlo directamente
            if (typeof obj !== 'object') return obj;

            // Buscar en las posibles claves
            for (let clave of posiblesClaves) {
                if (obj[clave] !== undefined && obj[clave] !== null) {
                    return obj[clave];
                }
            }

            return defaultValue;
        };

        // Procesar organizador/creador
        const organizadorObj = evento.organizador || evento.creador || {};
        const organizador = extraerValorSeguro(organizadorObj, ['nombre', 'nombre_completo', 'name'], 'No especificado');
        const correoOrganizador = extraerValorSeguro(organizadorObj, ['correo', 'email']);

        // Procesar empresa
        const empresa = extraerValorSeguro(evento.empresa, ['nombre', 'razon_social', 'name'], 'No especificada');

        // Calcular cupos disponibles
        let cuposDisponibles = evento.cupos_disponibles;
        if (cuposDisponibles === undefined || cuposDisponibles === null) {
            const inscritosCount = evento.inscritos_count || 0;
            const cupoTotal = evento.cupos || evento.cupo_total || 0;
            cuposDisponibles = Math.max(0, cupoTotal - inscritosCount);
        }

        return {
            id: evento.id,
            titulo: evento.titulo || evento.nombre || 'Sin título',
            descripcion: evento.descripcion || 'Sin descripción disponible',
            modalidad: evento.modalidad || 'No especificado',
            hora: evento.hora || '',
            fecha_inicio: evento.fecha_inicio,
            fecha_fin: evento.fecha_fin,
            lugar: evento.lugar || '',
            cupo_total: evento.cupos || evento.cupo_total || 0,
            cupos_disponibles: cuposDisponibles,
            estado_evento: evento.estado === 1 ? 'Disponible' : 'No disponible',
            empresa: empresa,
            estado: evento.estado,
            actividades: evento.actividades || [],
            creador: organizadorObj, // Mantener el objeto completo por si acaso
            fecha_creacion: evento.fecha_creacion,
            fecha_actualizacion: evento.fecha_actualizacion,
            // Campos procesados específicamente
            organizador: organizador,
            correo_organizador: correoOrganizador,
            // Información adicional
            id_empresa: evento.id_empresa,
            id_creador: evento.id_creador,
            inscritos_count: evento.inscritos_count || 0
        };
    }
};

export default ponenteEventosService;