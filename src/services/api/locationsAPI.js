import { BaseService } from './baseService';

class LocationsAPI extends BaseService {
    constructor() {
        super();
        this.getEmpresaUsuario = this.getEmpresaUsuario.bind(this);
        this.getEmpresaDetalles = this.getEmpresaDetalles.bind(this);
        this.getPrimeraEmpresa = this.getPrimeraEmpresa.bind(this);
        this.getUbicacionesByEmpresa = this.getUbicacionesByEmpresa.bind(this);
        this.getCiudades = this.getCiudades.bind(this);
        this.createUbicacion = this.createUbicacion.bind(this);
        this.updateUbicacion = this.updateUbicacion.bind(this);
        this.deleteUbicacion = this.deleteUbicacion.bind(this);
    }

    getEmpresaUsuario = async () => {
        try {
            const profileResult = await this.fetch('/auth/profile');

            if (profileResult.success) {
                let empresaId = null;

                if (profileResult.data?.usuario?.roData?.empresa?.id) {
                    empresaId = profileResult.data.usuario.roData.empresa.id;
                }
                else if (profileResult.data?.usuario?.roData?.id_empresa) {
                    empresaId = profileResult.data.usuario.roData.id_empresa;
                }
                else if (profileResult.data?.empresa?.id) {
                    empresaId = profileResult.data.empresa.id;
                }
                else if (profileResult.data?.id_empresa) {
                    empresaId = profileResult.data.id_empresa;
                }
                else if (profileResult.data?.usuario?.id_empresa) {
                    empresaId = profileResult.data.usuario.id_empresa;
                }

                if (empresaId) {
                    return await this.getEmpresaDetalles(empresaId);
                } else {
                    return await this.getPrimeraEmpresa();
                }
            } else {
                return await this.getPrimeraEmpresa();
            }
        } catch (error) {
            return await this.getPrimeraEmpresa();
        }
    }

    getEmpresaDetalles = async (empresaId) => {
        try {
            const result = await this.fetch(`/empresas/${empresaId}`);

            if (result.success && result.data) {
                return result.data;
            } else {
                return await this.getPrimeraEmpresa();
            }
        } catch (error) {
            return await this.getPrimeraEmpresa();
        }
    }

    getPrimeraEmpresa = async () => {
        try {
            const result = await this.fetch('/empresas');

            if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
                return result.data[0];
            } else {
                return {
                    id: 1,
                    nombre: 'Mi Empresa'
                };
            }
        } catch (error) {
            return {
                id: 1,
                nombre: 'Mi Empresa'
            };
        }
    }

    getUbicacionesByEmpresa = async (empresaId) => {
        try {
            const result = await this.fetch(`/empresas/${empresaId}/ubicaciones`);

            if (result.success && result.data) {
                let ubicacionesArray = result.data;

                if (!Array.isArray(ubicacionesArray)) {
                    if (ubicacionesArray === null || ubicacionesArray === undefined) {
                        ubicacionesArray = [];
                    } else if (typeof ubicacionesArray === 'object') {
                        ubicacionesArray = [ubicacionesArray];
                    } else {
                        ubicacionesArray = [];
                    }
                }

                return ubicacionesArray;
            } else {
                return [];
            }
        } catch (error) {
            return [];
        }
    }

    getCiudades = async () => {
        try {
            const result = await this.fetch('/ciudades');

            if (result.success && result.data && Array.isArray(result.data)) {
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            return [];
        }
    }

    createUbicacion = async (empresaId, datos) => {
        try {
            const result = await this.fetch(`/empresas/${empresaId}/ubicaciones`, {
                method: 'POST',
                body: JSON.stringify({
                    lugar: datos.lugar,
                    direccion: datos.direccion,
                    descripcion: datos.descripcion,
                    id_ciudad: parseInt(datos.id_ciudad)
                })
            });

            if (result.success === false) {
                throw new Error(result.message || 'Error al crear ubicación');
            }

            if (result.data || result.id) {
                return result;
            }

            return result;

        } catch (error) {
            if (error.message && error.message.includes('exitosamente')) {
                return { success: true, message: error.message };
            }

            throw new Error(error.message || 'Error al crear ubicación');
        }
    }

    updateUbicacion = async (ubicacionId, datos) => {
        try {
            const result = await this.fetch(`/ubicaciones/${ubicacionId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    lugar: datos.lugar,
                    direccion: datos.direccion,
                    descripcion: datos.descripcion,
                    id_ciudad: parseInt(datos.id_ciudad)
                })
            });

            if (!result.success) {
                throw new Error(result.message || 'Error al actualizar ubicación');
            }

            return result;
        } catch (error) {
            throw new Error(error.message || 'Error al actualizar ubicación');
        }
    }

    deleteUbicacion = async (ubicacionId) => {
        try {
            const result = await this.fetch(`/ubicaciones/${ubicacionId}`, {
                method: 'DELETE'
            });

            if (!result.success) {
                throw new Error(result.message || 'Error al eliminar ubicación');
            }

            return result;
        } catch (error) {
            throw new Error(error.message || 'Error al eliminar ubicación');
        }
    }
}

export const locationsAPI = new LocationsAPI();