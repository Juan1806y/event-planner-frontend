import { BaseService } from './baseService';

class EventsAPI extends BaseService {
    constructor() {
        super();
        this.obtenerEventos = this.obtenerEventos.bind(this);
        this.getEventsByEmpresa = this.getEventsByEmpresa.bind(this);
    }

    obtenerEventos = async () => {
        try {
            const response = await this.fetch('/api/eventos');

            if (!response.success) {
                throw new Error(response.message || 'Error al obtener eventos');
            }

            return response;
        } catch (error) {
            console.error('Error en obtenerEventos:', error);
            throw new Error(error.message || 'Error al cargar los eventos');
        }
    }

    getEventsByEmpresa = async (empresaId) => {
        try {
            const response = await this.fetch(`/api/empresas/${empresaId}/eventos`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching events by empresa:', error);
            return [];
        }
    }
}

export const eventsAPI = new EventsAPI();