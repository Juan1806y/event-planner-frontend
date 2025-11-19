import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const request = async (method, url, data = null, params = null) => {
    const config = { method, url, params };

    if (data !== null && method.toLowerCase() !== 'delete') {
        config.data = data;
    }

    const response = await api(config);
    return response.data;
};

export const obtenerEventos = (filtros = {}) =>
    request("get", "/eventos", null, filtros);

export const obtenerEventoPorId = (id) =>
    request("get", `/eventos/${id}`);

export const crearEvento = (nuevoEvento) =>
    request("post", "/eventos", nuevoEvento);

export const actualizarEvento = (id, datos) =>
    request("put", `/eventos/${id}`, datos);

export const eliminarEvento = (id) =>
    request("delete", `/eventos/${id}`);

export const obtenerPerfil = () =>
    request("get", "/auth/profile");

export const obtenerUbicaciones = (idEmpresa) =>
    request("get", `/empresas/${idEmpresa}/ubicaciones`);

export const obtenerLugares = (idEmpresa, idUbicacion = null) =>
    request("get", `/empresas/${idEmpresa}/lugares`, null, idUbicacion ? { id_ubicacion: idUbicacion } : null);

export const obtenerActividadesEvento = (eventoId) =>
    request("get", `/eventos/${eventoId}/actividades`);

export const crearActividad = (eventoId, actividadData) =>
    request("post", `/eventos/${eventoId}/actividades`, actividadData);

export const actualizarActividad = (id_actividad, datos) =>
    request("put", `/actividades/${id_actividad}`, datos);

export const eliminarActividad = (id_actividad) =>
    request("delete", `/actividades/${id_actividad}`);