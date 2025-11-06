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
        console.log(`🗑️ Intentando eliminar evento ${id}...`);

        const response = await axios.delete(`${API_URL}/${id}`, getHeaders());

        console.log('✅ Evento eliminado correctamente:', response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al eliminar evento:", error);
        console.error("📋 Detalles del error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
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

// 🎯 Crear una nueva actividad dentro de un evento
export const crearActividad = async (eventoId, actividadData) => {
    try {
        if (!eventoId) throw new Error("Se requiere el ID del evento para crear una actividad.");
        console.log(`📅 Creando actividad para evento ${eventoId}:`, actividadData);

        const response = await axios.post(
            `${API_URL}/${eventoId}/actividades`,
            actividadData,
            getHeaders()
        );

        console.log('✅ Actividad creada:', response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al crear actividad:", error);
        console.error("📋 Detalles:", error.response?.data);
        throw error.response?.data || error;
    }
};

export const obtenerActividadesEvento = async (eventoId) => {
    try {
        console.log(`🔍 Obteniendo actividades del evento ${eventoId}...`);
        const response = await axios.get(
            `${API_URL}/${eventoId}/actividades`,
            getHeaders()
        );
        console.log('✅ Actividades obtenidas:', response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener actividades:", error);
        throw error.response?.data || error;
    }
};

// ✏️ Actualizar una actividad
export const actualizarActividad = async (actividadId, datosActualizados) => {
    try {
        console.log(`✏️ Actualizando actividad ${actividadId}:`, datosActualizados);
        const response = await axios.put(
            `http://localhost:3000/api/actividades/${actividadId}`,
            datosActualizados,
            getHeaders()
        );
        console.log('✅ Actividad actualizada:', response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al actualizar actividad:", error);
        throw error.response?.data || error;
    }
};

// 🗑️ Eliminar una actividad
export const eliminarActividad = async (actividadId) => {
    try {
        console.log(`🗑️ Eliminando actividad ${actividadId}...`);
        const response = await axios.delete(
            `http://localhost:3000/api/actividades/${actividadId}`,
            getHeaders()
        );
        console.log('✅ Actividad eliminada:', response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al eliminar actividad:", error);
        throw error.response?.data || error;
    }
};

