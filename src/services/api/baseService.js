const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export class BaseService {

  constructor() {
    this.baseURL = API_URL;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  async fetch(endpoint, options = {}) {
    let token = this.getToken();
    let retryCount = 0;
    const maxRetries = 1;

    const makeRequest = async (currentToken) => {
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken && { 'Authorization': `Bearer ${currentToken}` }),
          ...options.headers,
        },
      };

      const config = {
        ...defaultOptions,
        ...options,
      };

      const urlCompleta = `${this.baseURL}${endpoint}`;

      try {
        const response = await fetch(urlCompleta, config);

        const responseText = await response.text();

        let parsed;
        try {
          parsed = JSON.parse(responseText);
        } catch (e) {
          parsed = { __rawText: responseText };
        }

        if (!response.ok) {
          if (response.status === 401) {
            const errorMsg = parsed.message || 'Token inválido o expirado';

            if (retryCount < maxRetries) {
              const newToken = await this.refreshAccessToken();

              if (newToken) {
                retryCount++;
                return await makeRequest(newToken);
              }
            }

            this.handleUnauthorized();
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          }

          const message = this.getErrorMessage(parsed) || `HTTP ${response.status}: ${response.statusText}`;
          const err = new Error(message);
          err.status = response.status;
          throw err;
        }

        return parsed;
      } catch (error) {
        throw error;
      }
    };

    return makeRequest(token);
  }

  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newAccessToken = data.data?.accessToken || data.accessToken;

        if (newAccessToken) {
          localStorage.setItem('access_token', newAccessToken);

          if (data.data?.refreshToken) {
            localStorage.setItem('refresh_token', data.data.refreshToken);
          }

          return newAccessToken;
        }
      }
    } catch (error) {
    }

    return null;
  }

  getToken() {
    const tokenNames = ['access_token', 'accessToken', 'token'];

    for (const name of tokenNames) {
      const token = localStorage.getItem(name);
      if (token && token.trim() !== '') {
        const cleanToken = token.trim();

        if (cleanToken.split('.').length === 3) {
          try {
            JSON.parse(atob(cleanToken.split('.')[1]));
            return cleanToken;
          } catch (e) {
          }
        }
      }
    }

    return null;
  }

  handleUnauthorized() {
    const itemsToRemove = [
      'access_token', 'accessToken', 'token', 'auth_token',
      'refresh_token', 'refreshToken',
      'user', 'userData', 'selected_role'
    ];

    itemsToRemove.forEach(item => {
      localStorage.removeItem(item);
    });

    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }

  async parseResponse(response) {
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

  getErrorMessage(data) {
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

  async request(endpoint, options = {}) {
    return this.fetch(endpoint, options);
  }
}