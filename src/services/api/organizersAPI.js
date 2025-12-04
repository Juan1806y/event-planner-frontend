import { BaseService } from './baseService';

class OrganizersAPI extends BaseService {
  constructor() {
    super();
    this.getEmpresaGerente = this.getEmpresaGerente.bind(this);
    this.crearOrganizador = this.crearOrganizador.bind(this);
  }

  getEmpresaGerente = async () => {
    try {
      const response = await this.fetch('/empresas');

      let empresaData;

      if (response.success && response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          empresaData = response.data[0];
        }

        else if (typeof response.data === 'object') {
          empresaData = response.data;
        }
      }

      if (!empresaData) {
        console.warn('No se encontraron empresas en la respuesta:', response);
        throw new Error('No se encontraron empresas disponibles para el gerente actual.');
      }

      return {
        id: empresaData.id,
        nombre: empresaData.nombre || 'Mi Empresa'
      };
    } catch (error) {
      console.error('Error al cargar empresa del gerente:', error);

      if (error.message.includes('404')) {
        throw new Error('El endpoint /api/empresas no está disponible. Verifica la configuración del servidor.');
      }

      throw new Error(error.message || 'No se pudieron cargar los datos de la empresa.');
    }
  }

  crearOrganizador = async (datos) => {
    try {
      const response = await this.fetch('/auth/crear-organizador', {
        method: 'POST',
        body: JSON.stringify(datos)
      });

      if (!response.success) {
        throw new Error(response.message || 'Error al crear organizador');
      }

      return {
        success: true,
        message: response.message || '¡Organizador creado exitosamente!'
      };
    } catch (error) {
      console.error('Error en crearOrganizador:', error);
      throw new Error(error.message || 'Error al crear organizador');
    }
  }
}

export const organizersAPI = new OrganizersAPI();