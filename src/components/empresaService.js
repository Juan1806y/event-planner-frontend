const API_BASE_URL = 'http://localhost:3000/api';

const getAuthToken = () => {
    try {
        const accessToken = localStorage.getItem('access_token');
        const parsedUser = JSON.parse(localStorage.getItem('user') || '{}');
        return accessToken || parsedUser.token || parsedUser.access_token || null;
    } catch {
        return null;
    }
};

const getHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || data.error || `Error ${response.status}`);
    }
    return data;
};

const handleRequest = async (url, options = {}) => {
    const response = await fetch(url, { headers: getHeaders(), ...options });
    return handleResponse(response);
};

const empresaService = {
    obtenerEmpresaGerente: () =>
        handleRequest(`${API_BASE_URL}/empresas`),

    obtenerTodasCiudades: () =>
        handleRequest(`${API_BASE_URL}/ciudades`),

    obtenerEmpresaPorId: (id) =>
        handleRequest(`${API_BASE_URL}/empresas/${id}`),

    actualizarEmpresa: (id, datos) =>
        handleRequest(`${API_BASE_URL}/empresas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(datos)
        }),

    obtenerCiudadPorId: (idCiudad) =>
        handleRequest(`${API_BASE_URL}/ciudades/${idCiudad}`),

    obtenerPaisPorId: (idPais) =>
        handleRequest(`${API_BASE_URL}/paises/${idPais}`)
};

export default empresaService;
