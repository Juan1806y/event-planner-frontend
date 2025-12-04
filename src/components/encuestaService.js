import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

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
    enviarEncuestaMasiva: async (encuestaId) => {
        try {
            const response = await axiosInstance.post(`/encuestas/${encuestaId}/enviar`);
            return response.data;
        } catch (error) {
            console.error('Error en enviarEncuestaMasiva:', error);

            if (error.response?.status === 401) {
                throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (error.response?.status === 403) {
                throw new Error('No tienes permisos para realizar esta acción.');
            } else {
                throw new Error(error.response?.data?.message || 'Error al enviar las encuestas');
            }
        }
    },

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
};

export default encuestaService;