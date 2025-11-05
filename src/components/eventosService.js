// src/services/eventosService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/eventos";

const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token obtenido:', token ? 'Existe' : 'No existe');
    return token;
};

const getHeaders = () => {
    const token = getAuthToken();
    const headers = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    console.log('📤 Headers a enviar:', headers);
    return headers;
};

// 📌 Obtener todos los eventos
export const obtenerEventos = async (filtros = {}) => {
    try {
        console.log('🔍 Intentando obtener eventos...');
        const config = {
            params: filtros,
            ...getHeaders(),
        };
        console.log('⚙️ Config completa:', config);

        const response = await axios.get(API_URL, config);
        console.log('✅ Eventos obtenidos:', response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener eventos:", error);
        console.error("📋 Detalles del error:", {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.config?.headers
        });
        throw error.response?.data || error;
    }
};

// 🔍 Obtener un evento por ID
export const obtenerEventoPorId = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, getHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al obtener evento:", error);
        throw error.response?.data || error;
    }
};

// ➕ Crear un nuevo evento
export const crearEvento = async (nuevoEvento) => {
    try {
        console.log('📝 Creando evento:', nuevoEvento);
        const response = await axios.post(API_URL, nuevoEvento, getHeaders());
        console.log('✅ Evento creado:', response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al crear evento:", error);
        console.error("📋 Detalles:", error.response?.data);
        throw error.response?.data || error;
    }
};

// ✏️ Actualizar un evento
export const actualizarEvento = async (id, datosActualizados) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, datosActualizados, getHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al actualizar evento:", error);
        throw error.response?.data || error;
    }
};

// ❌ Eliminar (cancelar) un evento
export const eliminarEvento = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al eliminar evento:", error);
        throw error.response?.data || error;
    }
};

// 👤 Obtener perfil del usuario (incluye id_empresa)
export const obtenerPerfil = async () => {
    try {
        const token = getAuthToken();

        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        console.log('📡 Solicitando perfil de usuario...');

        const response = await axios.get('http://localhost:3000/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Perfil obtenido:', response.data);

        // Verificar que la respuesta tenga los datos necesarios
        if (!response.data) {
            throw new Error('Respuesta vacía del servidor');
        }

        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener perfil:", error);
        console.error("📋 Detalles:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Si es error 401, el token es inválido
        if (error.response?.status === 401) {
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }

        throw error.response?.data || new Error(error.message || 'Error al obtener perfil');
    }
};

// 👨‍🏫 Obtener ponentes de una empresa
export const obtenerPonentes = async (idEmpresa) => {
    try {
        const response = await axios.get(`http://localhost:3000/api/ponentes`, {
            params: { id_empresa: idEmpresa },
            ...getHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener ponentes:", error);
        throw error.response?.data || error;
    }
};

// 📚 Obtener especialidades
export const obtenerEspecialidades = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/especialidades', getHeaders());
        return response.data;
    } catch (error) {
        console.error("Error al obtener especialidades:", error);
        throw error.response?.data || error;
    }
};

// 📍 Obtener lugares físicos de una empresa
export const obtenerLugares = async (idEmpresa) => {
    try {
        const response = await axios.get(
            `http://localhost:3000/api/lugares/${idEmpresa}`,
            getHeaders() // incluye los headers con el token
        );
        return response.data;
    } catch (error) {
        console.error("Error al obtener lugares:", error);
        throw error.response?.data || error;
    }
};