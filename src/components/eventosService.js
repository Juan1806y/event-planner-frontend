import axios from "axios";

const API_URL = "http://localhost:3000/api/eventos";

const getAuthToken = () => localStorage.getItem('access_token') || '';

export const getHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    }
});

export const obtenerEventos = async (filtros = {}) => {
    const response = await axios.get(API_URL, { params: filtros, ...getHeaders() });
    return response.data;
};

export const obtenerEventoPorId = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getHeaders());
    return response.data;
};

export const crearEvento = async (nuevoEvento) => {
    const response = await axios.post(API_URL, nuevoEvento, getHeaders());
    return response.data;
};

export const actualizarEvento = async (id, datosActualizados) => {
    const response = await axios.put(`${API_URL}/${id}`, datosActualizados, getHeaders());
    return response.data;
};

export const eliminarEvento = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
    return response.data;
};

export const obtenerPerfil = async () => {
    const response = await axios.get(`http://localhost:3000/api/auth/profile`, getHeaders());
    console.log("Actuaaaaal", response.data)
    return response.data;
};

export const obtenerUbicaciones = async (idEmpresa) => {
    const response = await axios.get(
        `http://localhost:3000/api/empresas/${idEmpresa}/ubicaciones`,
        getHeaders()
    );
    return response.data;
};

export const obtenerLugares = async (idEmpresa, idUbicacion = null) => {
    let url = `http://localhost:3000/api/empresas/${idEmpresa}/lugares`;

    if (idUbicacion) {
        url += `?id_ubicacion=${idUbicacion}`;
    }

    const response = await axios.get(url, getHeaders());
    return response.data;
};

export const obtenerActividadesEvento = async (eventoId) => {
    const response = await axios.get(`${API_URL}/${eventoId}/actividades`, getHeaders());
    return response.data;
};

export const crearActividad = async (eventoId, actividadData) => {
    const response = await axios.post(`${API_URL}/${eventoId}/actividades`, actividadData, getHeaders());
    return response.data;
};

export const actualizarActividad = async (actividadId, datosActualizados) => {
    const response = await axios.put(`http://localhost:3000/api/actividades/${actividadId}`, datosActualizados, getHeaders());
    return response.data;
};

export const eliminarActividad = async (actividadId) => {
    const response = await axios.delete(`http://localhost:3000/api/actividades/${actividadId}`, getHeaders());
    return response.data;
};

export const obtenerPonentes = async () => {
    const response = await axios.get(
        "http://localhost:3000/api/ponente-actividad/ponentes",
        getHeaders()
    );
    return response.data;
};

export const obtenerPonenteAsignado = async (actividadId) => {
    const response = await axios.get(
        `http://localhost:3000/api/ponente-actividad/actividad/${actividadId}`,
        getHeaders()
    );
    return response.data;
};


