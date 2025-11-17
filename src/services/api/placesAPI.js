import { BaseService } from './baseService';

class PlacesAPI extends BaseService {
  constructor() {
    super();
    this.getEmpresas = this.getEmpresas.bind(this);
    this.getLugaresByEmpresa = this.getLugaresByEmpresa.bind(this);
    this.getUbicacionesByEmpresa = this.getUbicacionesByEmpresa.bind(this);
    this.createLugar = this.createLugar.bind(this);
    this.updateLugar = this.updateLugar.bind(this);
    this.deleteLugar = this.deleteLugar.bind(this);
  }

  getEmpresas = async () => {
    try {
      const response = await this.fetch('/api/empresas');
      if (response.success && response.data && response.data.length > 0) {
        return response.data;
      } else {
        throw new Error('No se encontraron empresas disponibles');
      }
    } catch (error) {
      console.error('Error al obtener empresas:', error);
      throw new Error('Error al cargar las empresas');
    }
  }

  getLugaresByEmpresa = async (empresaId) => {
    try {
      const response = await this.fetch(`/api/empresas/${empresaId}/lugares`);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error al obtener lugares:', error);
      throw new Error('Error al cargar los lugares de la empresa');
    }
  }

  getUbicacionesByEmpresa = async (empresaId) => {
    try {
      const response = await this.fetch(`/api/empresas/${empresaId}/ubicaciones`);
      return response.success && response.data ? response.data : [];
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      return [];
    }
  }

  createLugar = async (empresaId, datos) => {
    try {
      const result = await this.fetch(`/api/empresas/${empresaId}/lugares`, {
        method: 'POST',
        body: JSON.stringify({
          empresaId: parseInt(datos.empresaId),
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          id_ubicacion: parseInt(datos.id_ubicacion),
          capacidad: datos.capacidad ? parseInt(datos.capacidad) : null
        })
      });

      if (!result.success) {
        throw new Error(result.message || 'Error al crear lugar');
      }

      return result;
    } catch (error) {
      console.error('Error al crear lugar:', error);
      throw new Error(error.message || 'Error al crear lugar');
    }
  }

  updateLugar = async (lugarId, datos) => {
    try {
      const result = await this.fetch(`/api/lugares/${lugarId}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          id_ubicacion: parseInt(datos.id_ubicacion),
          capacidad: datos.capacidad ? parseInt(datos.capacidad) : null
        })
      });

      if (!result.success) {
        throw new Error(result.message || 'Error al actualizar lugar');
      }

      return result;
    } catch (error) {
      console.error('Error al actualizar lugar:', error);
      throw new Error(error.message || 'Error al actualizar lugar');
    }
  }

  deleteLugar = async (lugarId) => {
    try {
      const result = await this.fetch(`/api/lugares/${lugarId}`, {
        method: 'DELETE'
      });

      if (!result.success) {
        const errorMessage = result.message || 'Error al eliminar lugar';

        if (errorMessage.includes('eventos') || errorMessage.includes('dependencias')) {
          throw new Error('No se puede eliminar el lugar porque tiene eventos asociados. Elimine primero los eventos relacionados.');
        }

        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Error al eliminar lugar:', error);

      if (error.message.includes('400')) {
        throw new Error('No se puede eliminar el lugar. Puede que tenga eventos asociados.');
      } else if (error.message.includes('404')) {
        throw new Error('El lugar no fue encontrado. Puede que ya haya sido eliminado.');
      } else {
        throw new Error(error.message || 'Error al eliminar lugar');
      }
    }
  }
}

export const placesAPI = new PlacesAPI();