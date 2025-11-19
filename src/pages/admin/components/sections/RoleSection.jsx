import React, { useState, useEffect } from 'react';
import styles from './roles.module.css';

const SYSTEM_ROLES = [
  {
    id: 1,
    nombre: 'Administrador',
    tipo: 'administrador',
    descripcion: 'Control total del sistema',
    activo: true,
    editable: false,
    esSistema: true
  },
  {
    id: 2,
    nombre: 'Gerente',
    tipo: 'gerente',
    descripcion: 'Control en la organización',
    activo: true,
    editable: true,
    esSistema: false
  },
  {
    id: 3,
    nombre: 'Organizador',
    tipo: 'organizador',
    descripcion: 'Gestión de eventos empresariales',
    activo: true,
    editable: true,
    esSistema: false
  },
  {
    id: 4,
    nombre: 'Ponente',
    tipo: 'ponente',
    descripcion: 'Experto quien dirige la charla',
    activo: true,
    editable: true,
    esSistema: false
  },
  {
    id: 5,
    nombre: 'Asistente',
    tipo: 'asistente',
    descripcion: 'Participante de eventos',
    activo: true,
    editable: true,
    esSistema: false
  }
];

const useRolesState = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = () => {
      setLoading(true);
      try {
        const savedRoles = localStorage.getItem('rolesState');
        if (savedRoles) {
          setRoles(JSON.parse(savedRoles));
        } else {
          // Primera vez: guardar roles del sistema
          localStorage.setItem('rolesState', JSON.stringify(SYSTEM_ROLES));
          setRoles(SYSTEM_ROLES);
        }
      } catch (error) {
        console.error('Error loading roles:', error);
        setRoles(SYSTEM_ROLES);
      }
      setLoading(false);
    };

    loadRoles();
  }, []);

  const updateRoles = (newRoles) => {
    setRoles(newRoles);
    localStorage.setItem('rolesState', JSON.stringify(newRoles));
  };

  return { roles, loading, updateRoles };
};

const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message, duration = 4000) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  return { notification, showNotification };
};

const Notification = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className={`${styles.notification} ${styles[notification.type]}`}>
      <div className={styles.notificationContent}>
        <div className={styles.notificationIcon}>
          {notification.type === 'success' ? '✓' : '✗'}
        </div>
        <p className={styles.notificationMessage}>{notification.message}</p>
        <button
          className={styles.notificationClose}
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
};

const ActionButton = ({ rol, onToggle, disabled }) => {
  const getButtonTitle = () => {
    if (disabled) return 'Rol del sistema no modificable';
    return rol.activo ? 'Desactivar rol' : 'Activar rol';
  };

  return (
    <button
      className={`${styles.actionBtn} ${disabled ? styles.disabled : ''}`}
      onClick={() => !disabled && onToggle(rol.id)}
      title={getButtonTitle()}
      disabled={disabled}
    >
      <svg viewBox="0 0 24 24" fill="none">
        <path 
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

const RoleTableRow = ({ rol, onToggleStatus }) => {
  return (
    <tr key={rol.id}>
      <td className={styles.rolName}>
        <div className={styles.rolInfo}>
          <span>{rol.nombre}</span>
          {rol.esSistema && (
            <span className={styles.systemBadge}>Sistema</span>
          )}
        </div>
      </td>
      <td>
        <span className={`${styles.badge} ${rol.activo ? styles.badgeActive : styles.badgeInactive}`}>
          {rol.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className={styles.description}>{rol.descripcion}</td>
      <td>
        <div className={styles.actions}>
          <ActionButton 
            rol={rol} 
            onToggle={onToggleStatus}
            disabled={!rol.editable}
          />
        </div>
      </td>
    </tr>
  );
};

const RolesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { roles, loading, updateRoles } = useRolesState();
  const { notification, showNotification } = useNotification();

  const handleToggleStatus = (rolId) => {
    const rol = roles.find(r => r.id === rolId);
    
    if (!rol.editable) {
      showNotification('error', 'Este rol del sistema no puede ser modificado');
      return;
    }

    const newRoles = roles.map(rol =>
      rol.id === rolId ? { ...rol, activo: !rol.activo } : rol
    );
    
    updateRoles(newRoles);
    showNotification(
      'success', 
      `Rol "${rol.nombre}" ${!rol.activo ? 'activado' : 'desactivado'} exitosamente`
    );
  };

  const handleResetRoles = () => {
    updateRoles(SYSTEM_ROLES);
    showNotification('success', 'Roles restablecidos a estado inicial');
  };

  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>Cargando roles...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Notification 
        notification={notification} 
        onClose={() => showNotification(null)} 
      />

      <div className={styles.header}>
        <div className={styles.titule}>Gestión de Roles</div>
        <div className={styles.subtitule}>Listado de Roles del Sistema</div>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <img src={require('../../../../assets/search.png')} alt="Busqueda" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rol</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map(rol => (
              <RoleTableRow 
                key={rol.id} 
                rol={rol} 
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </tbody>
        </table>

        {filteredRoles.length === 0 && (
          <div className={styles.noResults}>
            No se encontraron roles que coincidan con la búsqueda
          </div>
        )}
      </div>

      <div className={styles.infoNote}>
        <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>
          Los roles marcados como "Sistema" no pueden ser modificados. 
          Solo los roles editables pueden activarse o desactivarse.
          Los roles inactivos no estarán disponibles al crear nuevos usuarios.
        </span>
      </div>
    </div>
  );
};

export default RolesSection;