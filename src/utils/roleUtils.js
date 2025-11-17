// src/utils/roleUtils.js

/**
 * Verifica si un usuario es administrador
 * @param {Object} user - Objeto usuario del localStorage
 * @returns {boolean} - true si es administrador
 */
export const isAdmin = (user) => {
  if (!user) return false;

  const role = user.rol || user.role;

  const adminRoles = [
    'admin',
    'administrador',
    'administrator',
    'Admin',
    'Administrador',
    'ADMIN',
    'ADMINISTRADOR'
  ];

  if (typeof role === 'string') {
    return adminRoles.includes(role);
  }

  if (typeof role === 'number') {
    return role === 1;
  }

  return false;
};

/**
 * Verifica si un usuario es asistente
 * @param {Object} user - Objeto usuario del localStorage
 * @returns {boolean} - true si es asistente
 */
export const isAsistente = (user) => {
  if (!user) return false;

  const rawRole = user.rol ?? user.role ?? user.tipo ?? user.type ?? '';

  if (Array.isArray(user.roles) && user.roles.length) {
    for (const r of user.roles) {
      const v = (r?.name || r?.role || r?.rol || r || '').toString().toLowerCase();
      if (v.includes('asistente') || v.includes('attend') || v.includes('participant')) return true;
    }
  }

  if (user.asistente) return true;

  if (typeof rawRole === 'string') {
    const role = rawRole.toLowerCase();
    if (role.includes('asistente') || role.includes('attend') || role.includes('participant')) return true;
  }

  if (typeof rawRole === 'number') {
    return rawRole === 3;
  }

  try {
    const dump = JSON.stringify(user).toLowerCase();
    if (dump.includes('asistente') || dump.includes('attendee') || dump.includes('participant')) return true;
  } catch (e) {
    // ignore
  }

  return false;
};

/**
 * Verifica si un usuario es gerente
 * @param {Object} user - Objeto usuario del localStorage
 * @returns {boolean} - true si es gerente
 */
export const isGerente = (user) => {
  if (!user) return false;

  const rawRole = user.rol ?? user.role ?? user.tipo ?? user.type ?? '';

  if (Array.isArray(user.roles) && user.roles.length) {
    for (const r of user.roles) {
      const v = (r?.name || r?.role || r?.rol || r || '').toString().toLowerCase();
      if (v.includes('gerente') || v.includes('manager') || v.includes('supervisor')) return true;
    }
  }

  if (user.gerente) return true;

  if (typeof rawRole === 'string') {
    const role = rawRole.toLowerCase();
    const gerenteRoles = ['gerente', 'manager', 'supervisor', 'jefe'];
    if (gerenteRoles.some(r => role === r)) return true;
  }

  if (typeof rawRole === 'number') {
    return rawRole === 2;
  }

  const email = (user?.email || user?.correo || user?.username || '').toString().toLowerCase();
  if (email.includes('gerente') || email.includes('manager')) return true;

  try {
    const dump = JSON.stringify(user).toLowerCase();
    if (dump.includes('gerente') || dump.includes('manager') || dump.includes('supervisor')) return true;
  } catch (e) {
    // ignore
  }

  return false;
};

/**
 * Verifica si un usuario es organizador
 * @param {Object} user - Objeto usuario del localStorage
 * @returns {boolean} - true si es organizador
 */
export const isOrganizador = (user) => {
  if (!user) return false;

  const rawRole = user.rol ?? user.role ?? user.tipo ?? user.type ?? '';

  if (Array.isArray(user.roles) && user.roles.length) {
    for (const r of user.roles) {
      const v = (r?.name || r?.role || r?.rol || r || '').toString().toLowerCase();
      if (v.includes('organizador') || v.includes('organizer')) return true;
    }
  }

  if (user.organizador) return true;

  if (typeof rawRole === 'string') {
    const role = rawRole.toLowerCase();
    if (role.includes('organizador') || role.includes('organizer')) return true;
  }

  try {
    const dump = JSON.stringify(user).toLowerCase();
    if (dump.includes('organizador') || dump.includes('organizer')) return true;
  } catch (e) {
    // ignore
  }

  return false;
};

/**
 * Obtiene la ruta de redirección según el rol del usuario
 * @param {Object} user - Objeto usuario del localStorage
 * @returns {string} - Ruta de redirección
 */
export const getRedirectPath = (user) => {
  if (isAdmin(user)) return '/admin';
  if (isGerente(user)) return '/gerente';
  if (isAsistente(user)) return '/asistente';
  if (isOrganizador(user)) return '/organizador';

  // También verifica por correo en caso de fallback
  const email = (user?.email || user?.correo || user?.username || '').toString().toLowerCase();
  if (email.includes('gerente') || email.includes('manager')) return '/gerente';
  if (email.includes('asistente')) return '/asistente';
  if (email.includes('organizador') || email.includes('organizer')) return '/organizador';

  return '/dashboard';
};

/**
 * Obtiene el nombre del rol formateado
 * @param {Object} user - Objeto usuario del localStorage
 * @returns {string} - Nombre del rol
 */
export const getRoleName = (user) => {
  if (!user) return 'Sin rol';

  if (isAdmin(user)) return 'Administrador';
  if (isGerente(user)) return 'Gerente';
  if (isAsistente(user)) return 'Asistente';
  if (isOrganizador(user)) return 'Organizador';

  const role = user.rol || user.role;

  if (typeof role === 'string') {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  return `Rol ${role}`;
};