import { BaseService } from './baseService';

class EventsAPI extends BaseService {
    constructor() {
        super();
        this.obtenerEventos = this.obtenerEventos.bind(this);
        this.getEventsByEmpresa = this.getEventsByEmpresa.bind(this);
        this.obtenerEventosDisponibles = this.obtenerEventosDisponibles.bind(this);
    }

    obtenerEventos = async () => {
        try {
            const response = await this.fetch('/eventos');

            if (!response.success) {
                throw new Error(response.message || 'Error al obtener eventos');
            }

            return response;
        } catch (error) {
            console.error('Error en obtenerEventos:', error);
            throw new Error(error.message || 'Error al cargar los eventos');
        }
    }

    obtenerEventosDisponibles = async () => {
        try {
            console.log('🌐 Obteniendo eventos disponibles desde API...');
            const response = await this.fetch('/inscripciones/eventos-disponibles');

            console.log('📊 Respuesta completa de eventos disponibles:', response);

            if (!response.success) {
                console.warn('⚠️ La API no devolvié success=true para eventos disponibles:', response.message);
                // No lanzar error, devolver estructura vacía
                return { success: true, data: [] };
            }

            console.log(`✅ Encontrados ${response.data?.length || 0} eventos disponibles`);
            return response;
        } catch (error) {
            console.error('❌ Error en obtenerEventosDisponibles:', error);
            // En caso de error, devolver estructura vacía para no romper el flujo
            return { success: true, data: [] };
        }
    }

    getEventsByEmpresa = async (empresaId) => {
        try {
            const response = await this.fetch(`/empresas/${empresaId}/eventos`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching events by empresa:', error);
            return [];
        }
    }
}

export const eventsAPI = new EventsAPI();