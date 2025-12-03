// File: services/encuestaService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Crear una instancia de axios con configuración global
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Interceptor para agregar el token automáticamente
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const encuestaService = {
    // Método para enviar encuesta a todos los asistentes de un evento
    enviarEncuestaMasiva: async (encuestaId) => {
        try {
            const response = await axiosInstance.post(`/encuestas/${encuestaId}/enviar`);
            return response.data;
        } catch (error) {
            console.error('Error en enviarEncuestaMasiva:', error);

            // Mensajes de error más específicos
            if (error.response?.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (error.response?.status === 403) {
                throw new Error('No tienes permisos para realizar esta acción.');
            } else {
                throw new Error(error.response?.data?.message || 'Error al enviar las encuestas');
            }
        }
    },

    // Actualiza TODOS los otros métodos para usar axiosInstance también:
    obtenerEncuestas: async () => {
        try {
            const response = await axiosInstance.get('/encuestas');
            return response.data;
        } catch (error) {
            console.error('Error al obtener encuestas:', error);
            throw error;
        }
    },

    obtenerEncuestaPorId: async (id) => {
        try {
            const response = await axiosInstance.get(`/encuestas/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener encuesta:', error);
            throw error;
        }
    },

    crearEncuesta: async (encuestaData) => {
        try {
            const response = await axiosInstance.post('/encuestas', encuestaData);
            return response.data;
        } catch (error) {
            console.error('Error al crear encuesta:', error);
            throw error;
        }
    },

    actualizarEncuesta: async (id, encuestaData) => {
        try {
            const response = await axiosInstance.put(`/encuestas/${id}`, encuestaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar encuesta:', error);
            throw error;
        }
    },

    // Agregar este método al objeto encuestaService
    obtenerEstadisticas: async (encuestaId) => {
        try {
            const response = await axiosInstance.get(`/encuestas/${encuestaId}/estadisticas`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            if (error.response?.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (error.response?.status === 404) {
                throw new Error('Encuesta no encontrada.');
            } else {
                throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
            }
        }
    },

    eliminarEncuesta: async (id) => {
        try {
            const response = await axiosInstance.delete(`/encuestas/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar encuesta:', error);
            throw error;
        }
    }
};

export default encuestaService;