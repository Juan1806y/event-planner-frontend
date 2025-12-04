const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const createApiClient = () => {
  const token = localStorage.getItem('access_token');

  return {
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
};

export const apiRequest = async (endpoint, options = {}) => {
  const config = createApiClient();

  try {
    const response = await fetch(`${config.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...config.headers,
        ...options.headers
      }
    });

    if (response.status === 401) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        const newConfig = createApiClient();
        const retryResponse = await fetch(`${config.baseURL}${endpoint}`, {
          ...options,
          headers: {
            ...newConfig.headers,
            ...options.headers
          }
        });
        return retryResponse;
      } else {
        logout();
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }
    }

    return response;
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    return false;
  }
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo: email, contraseña: password })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error durante el inicio de sesión');
    }

    // Los tokens están en result.data según la estructura del backend
    const token = result.data?.accessToken;
    const refreshToken = result.data?.refreshToken;
    const usuario = result.data?.usuario;

    if (token) {
      localStorage.setItem('access_token', token);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      if (usuario) {
        localStorage.setItem('user', JSON.stringify(usuario));
      }
      return { success: true, data: result.data };
    } else {
      throw new Error('No se recibió el token de acceso');
    }
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

export default {
  login,
  logout,
  isAuthenticated,
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  apiRequest
};