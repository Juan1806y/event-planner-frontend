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

  async promoverGerente(id_usuario, id_empresa) {
    try {
      const token = localStorage.getItem('access_token');
      console.debug('authService.promoverGerente called with', { id_usuario, id_empresa, tokenExists: !!token });

      const response = await fetch(`${this.baseURL}/api/auth/promover-gerente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ id_usuario, id_empresa })
      });

      const data = await this.parseResponse(response);

      if (!response.ok) {
        const message = this.getErrorMessage(data);
        console.warn('promoverGerente response not ok', { status: response.status, message, data });
        return { success: false, status: response.status, message, data };
      }

      console.debug('promoverGerente succeeded', data);
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error promoviendo a gerente:', error);
      return { success: false, status: 500, message: error.message };
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('selected_role');
  }

  getErrorMessage(data) {
    // Delegate to BaseService implementation
    return super.getErrorMessage(data);
  }
}

export const authService = new AuthService();