export class BaseService {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    
    // Bind de métodos para mantener el contexto
    this.fetch = this.fetch.bind(this);
    this.getToken = this.getToken.bind(this);
    this.handleUnauthorized = this.handleUnauthorized.bind(this);
    this.getErrorMessage = this.getErrorMessage.bind(this);
  }

  // Usar arrow function para mantener el contexto
  fetch = async (endpoint, options = {}) => {
    const token = this.getToken();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.handleUnauthorized();
          throw new Error('Token inválido o expirado');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en fetch:', error);
      throw error;
    }
  }

  getToken = () => {
    const tokenNames = ['access_token', 'token', 'auth_token'];
    for (const name of tokenNames) {
      const token = localStorage.getItem(name);
      if (token) {
        return token;
      }
    }
    return null;
  }

  handleUnauthorized = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getErrorMessage = (data) => {
    if (data.message) return data.message;
    if (data.error) return typeof data.error === 'string' ? data.error : data.error.message;
    if (Array.isArray(data.errors)) return data.errors.join(', ');
    
    const errorMessages = [];
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'data' || key === 'status' || key === 'statusCode') return;
      if (Array.isArray(value)) errorMessages.push(...value);
      else if (typeof value === 'string') errorMessages.push(value);
      else if (typeof value === 'object' && value.message) errorMessages.push(value.message);
    });

    return errorMessages.length > 0 ? errorMessages.join(', ') : 'Error durante la operación';
  }
}