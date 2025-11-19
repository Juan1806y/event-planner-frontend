import { BaseService } from '../services/api/baseService';
import { organizersAPI } from '../services/api/organizersAPI';
import { locationsAPI } from '../services/api/locationsAPI';
import { placesAPI } from '../services/api/placesAPI';
import { eventsAPI } from '../services/api/eventsAPI';

class GerenteService extends BaseService {
  constructor() {
    super();
    this.getTeam = this.getTeam.bind(this);
    this.getDashboardStats = this.getDashboardStats.bind(this);
  }

  getTeam = async (empresaId) => {
    try {
      console.log(`Obteniendo equipo para empresa ID: ${empresaId}`);
      const response = await this.fetch(`/api/empresas/${empresaId}/equipo`);

      if (response.success && response.data) {
        return response.data;
      } else {
        console.warn('No se pudo cargar el equipo o no hay datos:', response);
        return [];
      }
    } catch (error) {
      console.error(' Error fetching team:', error);
      return [];
    }
  }

  getDashboardStats = async (empresaId) => {
    try {
      const [team, events] = await Promise.all([
        this.getTeam(empresaId),
        eventsAPI.getEventsByEmpresa(empresaId)
      ]);

      return {
        totalEmpleados: team.length,
        totalEventos: events.length
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalEmpleados: 0,
        totalEventos: 0
      };
    }
  }
}

export { organizersAPI, locationsAPI, placesAPI, eventsAPI };
export const gerenteService = new GerenteService();