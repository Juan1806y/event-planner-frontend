import axios from "axios";

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3000/api')
    .replace(/\/$/, ""); // elimina slash final

// 🔥 axios instance con token automático
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// 🔥 interceptor para agregar token siempre en headers reales
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


// =========================
//     MÉTODOS DEL API
// =========================

export const obtenerEventos = async (filtros = {}) => {
    const res = await api.get("/eventos", { params: filtros });
    return res.data;
};

export const obtenerEventoPorId = async (eventoId) => {
    const response = await axios.get(`${API_URL}/eventos/${eventoId}`, getHeaders());
    return response.data;
};

export const crearEvento = async (data) => {
    const res = await api.post("/eventos", data);
    return res.data;
};


export const actualizarEvento = async (eventoId) => {
    try {
        const response = await axios.put(`${API_URL}/eventos/${eventoId}`, getHeaders());
        return response.data;
    } catch (error) {
        console.error('Error en actualizarEvento PUT', error.response?.status, error.response?.data);
        const message = error.response?.data?.message || error.message || 'Error al actualizar evento';
        throw new Error(message);
    }
};

export const eliminarEvento = async (eventoId) => {
    const response = await axios.delete(`${API_URL}/eventos/${eventoId}`, getHeaders());
    return response.data;
};

export const obtenerPerfil = async () => {
    const res = await api.get("/auth/profile");
    return res.data;
};

export const obtenerUbicaciones = async (idEmpresa) => {
    const res = await api.get(`/empresas/${idEmpresa}/ubicaciones`);
    return res.data;
};

export const obtenerLugares = async (idEmpresa, idUbicacion = null) => {
    let url = `/empresas/${idEmpresa}/lugares`;
    const res = await api.get(url, {
        params: idUbicacion ? { id_ubicacion: idUbicacion } : {}
    });
    return res.data;
};

export const obtenerActividadesEvento = async (eventoId) => {
    const res = await api.get(`/eventos/${eventoId}/actividades`);
    return res.data;
};

export const crearActividad = async (eventoId, data) => {
    const res = await api.post(`/eventos/${eventoId}/actividades`, data);
    return res.data;
};


export const actualizarActividad = async (actividadId, datosActualizados) => {
    const res = await api.put(`/actividades/${actividadId}`, datosActualizados);
    return res.data;
};

export const eliminarActividad = async (actividadId) => {
    const res = await api.delete(`/actividades/${actividadId}`);
    return res.data;
};

export const obtenerPonentes = async () => {
    const res = await api.get(`/ponente-actividad/ponentes`);
    return res.data;
};

export const obtenerPonenteAsignado = async (actividadId) => {
    const res = await api.get(`/ponente-actividad/actividad/${actividadId}`);
    return res.data;
};
