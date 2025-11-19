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

      const parsed = await this.parseResponse(response);

      if (!response.ok) {
        if (response.status === 401) {
          this.handleUnauthorized();
          throw new Error('Token inválido o expirado');
        }

        const message = this.getErrorMessage(parsed) || `HTTP ${response.status}: ${response.statusText}`;
        const err = new Error(message);
        err.status = response.status;
        throw err;
      }

      return parsed;
    } catch (error) {
      console.error('Error en fetch:', error);
      throw error;
    }
  }

  // Intenta parsear la respuesta: JSON cuando corresponda, si no retorna texto crudo
  parseResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (e) {
        const txt = await response.text();
        return { __rawText: txt };
      }
    }

    const text = await response.text();
    return { __rawText: text };
  }

  // Alias histórico: request -> fetch
  request = async (endpoint, options = {}) => {
    return this.fetch(endpoint, options);
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
    if (!data) return 'Error durante la operación';
    if (typeof data === 'string') return data;
    if (data.__rawText) return data.__rawText;
    if (data.message) return data.message;
    if (data.error) return typeof data.error === 'string' ? data.error : data.error.message;
    if (Array.isArray(data.errors)) return data.errors.join(', ');
    
    const errorMessages = [];
    if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'data' || key === 'status' || key === 'statusCode') return;
        if (Array.isArray(value)) errorMessages.push(...value);
        else if (typeof value === 'string') errorMessages.push(value);
        else if (typeof value === 'object' && value.message) errorMessages.push(value.message);
      });
    }

    return errorMessages.length > 0 ? errorMessages.join(', ') : 'Error durante la operación';
  }
}