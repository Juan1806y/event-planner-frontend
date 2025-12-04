const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const getToken = () => {
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
};

const getHeaders = (customHeaders = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }

    try {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.detail || `Error ${response.status}`);
    } catch (e) {
      if (e.message.includes('Sesión expirada')) {
        throw e;
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    headers: getHeaders(options.headers),
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error en ${options.method || 'GET'} ${endpoint}:`, error);
    throw error;
  }
};

export const usuariosService = {
  getAll: async () => {
    return await apiRequest('/api/gestion-usuarios/users', {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return await apiRequest(`/api/gestion-usuarios/users/${id}`, {
      method: 'GET',
    });
  },

  create: async (data) => {
    return await apiRequest('/api/gestion-usuarios/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return await apiRequest(`/api/gestion-usuarios/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id, data) => {
    return await apiRequest(`/api/gestion-usuarios/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/api/gestion-usuarios/users/${id}`, {
      method: 'DELETE',
    });
  },

  search: async (query) => {
    return await apiRequest(`/api/gestion-usuarios/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  },
};

export const authService = {
  // Login
  login: async (credentials) => {
    return await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  loginFormData: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    return await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    }).then(handleResponse);
  },

  logout: async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Limpiar tokens localmente
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
    }
  },

  verifyToken: async () => {
    return await apiRequest('/api/auth/verify', {
      method: 'GET',
    });
  },

  refreshToken: async () => {
    return await apiRequest('/api/auth/refresh', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return await apiRequest('/api/auth/me', {
      method: 'GET',
    });
  },
};

// Servicios de Eventos (ejemplo para futuras implementaciones)
export const eventosService = {
  // Obtener todos los eventos
  getAll: async () => {
    return await apiRequest('/api/eventos', {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return await apiRequest(`/api/eventos/${id}`, {
      method: 'GET',
    });
  },

  create: async (data) => {
    return await apiRequest('/api/eventos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return await apiRequest(`/api/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/api/eventos/${id}`, {
      method: 'DELETE',
    });
  },
};

export const ponentesService = {
  getAll: async () => {
    return await apiRequest('/api/ponentes', { method: 'GET' });
  },

  getById: async (id) => {
    return await apiRequest(`/api/ponentes/${id}`, { method: 'GET' });
  },

  create: async (data) => {
    return await apiRequest('/api/ponentes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return await apiRequest(`/api/ponentes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/api/ponentes/${id}`, { method: 'DELETE' });
  },
};

export const apiUtils = {
  getToken,
  getHeaders,
  API_URL,
};

export default {
  usuarios: usuariosService,
  auth: authService,
  eventos: eventosService,
  ponentes: ponentesService,
  utils: apiUtils,
};