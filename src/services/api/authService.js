import { BaseService } from './baseService';

const ROLE_MAPPING = {
  'asistente': ['asistente'],
  'gerente': ['gerente'],
  'ponente': ['ponente'],
  'organizador': ['organizador','organization'],
  'admin': ['admin', 'administrador']
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export class AuthService extends BaseService {
  // Intenta parsear la respuesta: JSON cuando corresponda, si no retorna texto crudo
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
  async login(email, password, selectedRole) {
    try {
      const payload = { correo: email, contraseña: password};
      
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await this.parseResponse(response);

      if (!response.ok) {
        const message = this.getErrorMessage(data);
        throw new Error(message);
      }

      const token = data.data?.accessToken;
      const refreshToken = data.data?.refreshToken;
      const usuario = data.data?.usuario;

      if (!token) {
        throw new Error('No se recibió el token de acceso');
      }

      const userRole = usuario?.rol?.toLowerCase();
      const validRoles = ROLE_MAPPING[selectedRole] || [selectedRole];

      if (!validRoles.includes(userRole)) {
        throw new Error(`El rol ${selectedRole} no corresponde a tu cuenta. Por favor, elige el rol correcto para continuar.`);
      }

      localStorage.setItem('access_token', token);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(usuario));

      return {
        success: true,
        user: usuario,
        token
      };

    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await this.parseResponse(response);

      if (!response.ok) {
        // Si la respuesta no es JSON, parseResponse devuelve { __rawText }
        const message = this.getErrorMessage(data);
        throw new Error(message);
      }

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error('Error durante el registro:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('selected_role');
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
}

export const authService = new AuthService();