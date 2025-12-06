import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/';

const getAuthToken = () => localStorage.getItem('access_token') || '';

export const getHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    }
});

export const obtenerEventos = async (filtros = {}) => {
    const response = await axios.get(`${API_URL}/eventos`, {
        params: filtros,
        ...getHeaders()
    });
    return response.data;
};

export const obtenerEventoPorId = async (eventoId) => {
    const response = await axios.get(`${API_URL}/eventos/${eventoId}`, getHeaders());
    return response.data;
};

export const crearEvento = async () => {
    const response = await axios.post(`${API_URL}/eventos`, getHeaders());
    return response.data;
};

export const actualizarEvento = async (eventoId) => {
    try {
        const response = await axios.put(`${API_URL}/eventos/${eventoId}`, getHeaders());
        return response.data;
    } catch (error) {
        console.error('Error en actualizarEvento PUT', error.response?.status, error.response?.data);
        // Re-lanzar con más contexto
        const message = error.response?.data?.message || error.message || 'Error al actualizar evento';
        throw new Error(message);
    }
};

export const eliminarEvento = async (eventoId) => {
    const response = await axios.delete(`${API_URL}/eventos/${eventoId}`, getHeaders());
    return response.data;
};

export const obtenerPerfil = async () => {
    const response = await axios.get(`${API_URL}/auth/profile`, getHeaders());
    console.log("Actuaaaaal", response.data)
    return response.data;
};

export const obtenerUbicaciones = async (idEmpresa) => {
    const response = await axios.get(
        `${API_URL}/empresas/${idEmpresa}/ubicaciones`,
        getHeaders()
    );

    return response.data;
};

export const obtenerLugares = async (idEmpresa, idUbicacion = null) => {
    let url = `${API_URL}/empresas/${idEmpresa}/lugares`;

    if (idUbicacion) {
        url += `?id_ubicacion=${idUbicacion}`;
    }

    const response = await axios.get(url, getHeaders());
    return response.data;
};

export const obtenerActividadesEvento = async (eventoId) => {
    const response = await axios.get(`${API_URL}/eventos/${eventoId}/actividades`, getHeaders());
    return response.data;
};

export const crearActividad = async (eventoId) => {
    const response = await axios.post(`${API_URL}/eventos/${eventoId}/actividades`, getHeaders());
    return response.data;
};

export const actualizarActividad = async (actividadId, datosActualizados) => {
    const response = await axios.put(`${API_URL}/actividades/${actividadId}`, datosActualizados, getHeaders());
    return response.data;
};

export const eliminarActividad = async (actividadId) => {
    const response = await axios.delete(`${API_URL}/actividades/${actividadId}`, getHeaders());
    return response.data;
};

export const obtenerPonentes = async () => {
    const response = await axios.get(
        `${API_URL}/ponente-actividad/ponentes`,
        getHeaders()
    );
    return response.data;
};

export const obtenerPonenteAsignado = async (actividadId) => {
    const response = await axios.get(
        `${API_URL}/ponente-actividad/actividad/${actividadId}`,
        getHeaders()
    );
    return response.data;
};


