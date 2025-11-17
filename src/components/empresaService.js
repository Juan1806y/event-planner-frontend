const API_BASE_URL = 'http://localhost:3000/api';


const getAuthToken = () => {
    try {
        const accessToken = localStorage.getItem('access_token');

        const user = localStorage.getItem('user');
        const parsedUser = user ? JSON.parse(user) : null;

        const token = accessToken || parsedUser?.token || parsedUser?.access_token;

        if (!token) {
            console.warn('⚠️ No se encontró ningún token en localStorage.');
            return null;
        }
        return token;
    } catch (error) {
        console.error('❌ Error al obtener token del localStorage:', error);
        return null;
    }
};


const getHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};


const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error en la respuesta:', errorData);
        throw new Error(
            errorData.message ||
            errorData.error ||
            `Error ${response.status}: ${response.statusText}`
        );
    }
    return response.json();
};

const empresaService = {
    obtenerEmpresaGerente: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/empresas`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error al obtener empresa del gerente:', error);
            throw error;
        }
    },

    obtenerTodasCiudades: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/ciudades`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error al obtener todas las ciudades:', error);
            throw error;
        }
    },

    obtenerEmpresaPorId: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error al obtener empresa por ID:', error);
            throw error;
        }
    },

    actualizarEmpresa: async (id, datos) => {
        try {
            const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(datos)
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error al actualizar empresa:', error);
            throw error;
        }
    },

    obtenerCiudadPorId: async (idCiudad) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ciudades/${idCiudad}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error al obtener ciudad por ID:', error);
            throw error;
        }
    },

    obtenerPaisPorId: async (idPais) => {
        try {
            const response = await fetch(`${API_BASE_URL}/paises/${idPais}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error al obtener país por ID:', error);
            throw error;
        }
    }

};

export default empresaService;
