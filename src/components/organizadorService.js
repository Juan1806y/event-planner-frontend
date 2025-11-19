// src/services/organizadorService.js

const API_URL = 'http://localhost:3000';

const getAuthToken = () => localStorage.getItem('access_token');

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  }
});

export const crearOrganizador = async (organizadorData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/crear-organizador`, {
      method: 'POST',
      headers: getHeaders().headers,
      body: JSON.stringify(organizadorData)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al crear organizador');

    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    throw error;
  }
};

export const obtenerEquipo = async (idEmpresa) => {
  try {
    const response = await fetch(`${API_URL}/api/empresas/${idEmpresa}/equipo`, {
      method: 'GET',
      headers: getHeaders().headers
    });

    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      throw new Error('Sesión expirada');
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener el equipo');

    return { success: true, data: data.data || [] };
  } catch (error) {
    throw error;
  }
};

export const validarDatosOrganizador = (data) => {
  const errors = {};

  if (!data.nombre || data.nombre.trim().length < 3) errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  if (!data.cedula || data.cedula.trim().length < 6) errors.cedula = 'La cédula debe tener al menos 6 caracteres';
  if (!data.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) errors.correo = 'El correo electrónico no es válido';
  if (!data.contraseña || data.contraseña.length < 6) errors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
  if (!data.id_empresa) errors.id_empresa = 'ID de empresa es requerido';

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const actualizarOrganizador = async (id, datosActualizados) => {
  try {
    const response = await fetch(`${API_URL}/api/organizadores/${id}`, {
      method: 'PUT',
      headers: getHeaders().headers,
      body: JSON.stringify(datosActualizados)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al actualizar organizador');

    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    throw error;
  }
};

export const eliminarOrganizador = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/organizadores/${id}`, {
      method: 'DELETE',
      headers: getHeaders().headers
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar organizador');

    return { success: true, message: data.message };
  } catch (error) {
    throw error;
  }
};

export default {
  crearOrganizador,
  obtenerEquipo,
  validarDatosOrganizador,
  actualizarOrganizador,
  eliminarOrganizador
};
