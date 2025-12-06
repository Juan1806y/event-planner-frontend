import axios from "axios";

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3000/api')
  .replace(/\/$/, ""); // elimina slash final

// instancia axios con baseURL y headers por defecto
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// interceptor para agregar token automáticamente a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

/**
 * Devuelve un objeto { headers } compatible con llamadas axios que
 * esperan el segundo parámetro con esa forma.
 * Mantiene compatibilidad con módulos que importan getHeaders.
 */
export const getHeaders = () => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { headers };
};

// =========================
//     MÉTODOS DEL API
// =========================

/**
 * Obtener lista de eventos (acepta filtros como objetos que se enviarán en params)
 */
export const obtenerEventos = async (filtros = {}) => {
  const res = await api.get("/eventos", { params: filtros });
  return res.data;
};

/**
 * Obtener un evento por id
 */
export const obtenerEventoPorId = async (eventoId) => {
  const res = await api.get(`/eventos/${eventoId}`);
  return res.data;
};

/**
 * Crear una actividad para un evento
 * @param {number|string} eventoId
 * @param {object} actividadData
 */
export const crearActividad = async (eventoId, actividadData) => {
  const res = await api.post(`/eventos/${eventoId}/actividades`, actividadData);
  return res.data;
};

/**
 * Obtener perfil del usuario autenticado
 */
export const obtenerPerfil = async () => {
  // endpoint común para perfil; ajustar si en tu API es otro path
  const res = await api.get(`/auth/profile`);
  return res.data;
};

/**
 * Obtener ubicaciones
 */
export const obtenerUbicaciones = async () => {
  const res = await api.get(`/ubicaciones`);
  return res.data;
};

/**
 * Obtener lugares. Si se pasa ubicacionId se usa ruta por ubicación; si no, devuelve todos los lugares.
 * @param {number|string} [ubicacionId]
 */
export const obtenerLugares = async (ubicacionId) => {
  if (ubicacionId) {
    const res = await api.get(`/ubicaciones/${ubicacionId}/lugares`);
    return res.data;
  } else {
    const res = await api.get(`/lugares`);
    return res.data;
  }
};

/**
 * Obtener ponentes disponibles
 */
export const obtenerPonentes = async () => {
  const res = await api.get(`/ponente-actividad/ponentes`);
  return res.data;
};

/**
 * Obtener ponente asignado a una actividad
 * @param {number|string} actividadId
 */
export const obtenerPonenteAsignado = async (actividadId) => {
  const res = await api.get(`/ponente-actividad/actividad/${actividadId}`);
  return res.data;
};

/**
 * Ejemplo de función extra: obtener asistencias de un evento (mantengo forma similar al repo)
 */
export const obtenerAsistenciasEvento = async (idEvento) => {
  const res = await api.get(`/asistencias/evento/${idEvento}`);
  return res.data;
};
/**
 * Obtener actividades de un evento
 * @param {number|string} eventoId
 */
export const obtenerActividadesEvento = async (eventoId) => {
  const res = await api.get(`/eventos/${eventoId}/actividades`);
  return res.data;
};

/**
 * Crear un nuevo evento
 * @param {object} eventoData
 */
export const crearEvento = async (eventoData) => {
  const res = await api.post("/eventos", eventoData);
  return res.data;
};

/**
 * Actualizar un evento existente
 * @param {number|string} eventoId
 * @param {object} eventoData
 */
export const actualizarEvento = async (eventoId, eventoData) => {
  const res = await api.put(`/eventos/${eventoId}`, eventoData);
  return res.data;
};

/**
 * Actualizar una actividad
 * @param {number|string} actividadId
 * @param {object} actividadData
 */
export const actualizarActividad = async (actividadId, actividadData) => {
  const res = await api.put(`/actividades/${actividadId}`, actividadData);
  return res.data;
};

/**
 * Eliminar una actividad
 * @param {number|string} actividadId
 */
export const eliminarActividad = async (actividadId) => {
  const res = await api.delete(`/actividades/${actividadId}`);
  return res.data;
};

/**
 * Eliminar un evento
 * @param {number|string} eventoId
 */
export const eliminarEvento = async (eventoId) => {
  const res = await api.delete(`/eventos/${eventoId}`);
  return res.data;
};

export default {
  getHeaders,
  obtenerEventos,
  obtenerEventoPorId,
  obtenerActividadesEvento, 
  crearEvento,             
  actualizarEvento,    
  eliminarEvento,
  crearActividad,
  actualizarActividad,   
  eliminarActividad,
  obtenerPerfil,
  obtenerUbicaciones,
  obtenerLugares,
  obtenerPonentes,
  obtenerPonenteAsignado,
  obtenerAsistenciasEvento
};
