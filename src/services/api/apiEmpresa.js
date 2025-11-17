import empresaService from '../../components/empresaService';

export const empresaAPI = {
    obtenerEmpresaGerente: () => empresaService.obtenerEmpresaGerente(),
    obtenerCiudadPorId: (id) => empresaService.obtenerCiudadPorId(id),
    obtenerPaisPorId: (id) => empresaService.obtenerPaisPorId(id),
    obtenerTodasCiudades: () => empresaService.obtenerTodasCiudades(),
    actualizarEmpresa: (id, datos) => empresaService.actualizarEmpresa(id, datos)
};