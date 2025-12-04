
import useUsuarios from '../../components/UsuarioRoute';
import styles from './usuarios.module.css';
import { useState, useEffect } from 'react';

const Usuarios = () => {
  const {
    usuarios,
    loading,
    error,
    searchTerm,
    handleSearch,
    fetchUsuarios
  } = useUsuarios();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  const [filterBy, setFilterBy] = useState('todas');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [credencialesUsuario, setCredencialesUsuario] = useState(null);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [notification, setNotification] = useState(null);


  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    numeroDocumento: '',
    telefono: '',
    email: '',
    rol: '',
    empresa: '',
    especialidad: ''
  });

  const rolesDelSistema = [
    { id: 2, nombre: 'Gerente', tipo: 'gerente' },
    { id: 3, nombre: 'Organizador', tipo: 'organizador' },
    { id: 4, nombre: 'Ponente', tipo: 'ponente' },
    { id: 5, nombre: 'Asistente', tipo: 'asistente' }
  ];

  const showNotification = (type, message, duration = 4000) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, duration);
  };

  useEffect(() => {
    if (showCreateModal || showEditModal) {
      fetchEmpresas();
    }
  }, [showCreateModal, showEditModal]);

  const obtenerNombreEmpresa = (usuario) => {
    if (usuario.rol_data?.empresa_nombre) {
      return usuario.rol_data.empresa_nombre;
    }
    if (usuario.empresa && usuario.empresa !== 'N/A') {
      return usuario.empresa;
    }
    return 'N/A';
  };

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        console.error('No hay token de autenticación');
        setEmpresas([]);
        return;
      }

      const response = await fetch(`${API_URL}/empresas?incluir_pendientes=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.error('Sesión expirada');
        setEmpresas([]);
        return;
      }

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          const empresasAprobadas = result.data.filter(e => e.estado === 1);
          setEmpresas(empresasAprobadas);
        } else {
          setEmpresas([]);
        }
      } else {
        console.error('Error al cargar empresas');
        setEmpresas([]);
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      setEmpresas([]);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellidos: '',
      numeroDocumento: '',
      telefono: '',
      email: '',
      rol: '',
      empresa: '',
      especialidad: ''
    });
  };

  // VER USUARIO - Usando PUT /profile
  const handleViewUser = async (usuario) => {
    setLoadingAction(true);
    setSelectedUsuario(null);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        showNotification('error', 'No hay sesión activa. Por favor inicia sesión nuevamente.');
        setLoadingAction(false);
        return;
      }

      const response = await fetch(`${API_URL}/gestion-usuarios/${usuario.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: usuario.nombre,
          telefono: usuario.telefono || usuario.telefono,
          correo: usuario.correo || usuario.email
        })
      });

      if (response.status === 401) {
        showNotification('error', 'Sesión expirada. Por favor inicia sesión nuevamente.');
        setLoadingAction(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar información del usuario');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setSelectedUsuario(result.data);
        setShowViewModal(true);
      } else {
        showNotification('error', 'No se pudo cargar la información del usuario');
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      showNotification('error', `Error al cargar información del usuario: ${error.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  // EDITAR USUARIO - Cargar datos
  const handleEditUser = async (usuario) => {
    setLoadingAction(true);
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        showNotification('error', 'No hay sesión activa. Por favor inicia sesión nuevamente.');
        setLoadingAction(false);
        return;
      }

      const response = await fetch(`${API_URL}/gestion-usuarios/${usuario.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        showNotification('error', 'Sesión expirada. Por favor inicia sesión nuevamente.');
        setLoadingAction(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar información del usuario');
      }

      const result = await response.json();

      if (result.success && result.data) {
        const userData = result.data;

        const nombreCompleto = userData.nombre || '';
        const partesNombre = nombreCompleto.trim().split(' ');
        const nombre = partesNombre[0] || '';
        const apellidos = partesNombre.slice(1).join(' ') || '';

        setFormData({
          nombre: nombre,
          apellidos: apellidos,
          numeroDocumento: userData.cedula || '',
          telefono: userData.telefono || '',
          email: userData.correo || '',
          rol: userData.rol || '',
          empresa: userData.rol_data?.empresa_id || '',
          especialidad: userData.rol_data?.especialidad || ''
        });

        setSelectedUsuario(userData);
        setShowEditModal(true);
      } else {
        showNotification('error', 'Error al cargar información del usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', `Error al cargar información del usuario: ${error.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  // EDITAR USUARIO - Guardar cambios usando PUT /profile y PUT /role-data
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoadingAction(true);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        showNotification('error', 'No hay sesión activa. Por favor inicia sesión nuevamente.');
        setLoadingAction(false);
        return;
      }

      // 1. Actualizar información de perfil
      const updateData = {
        nombre: `${formData.nombre} ${formData.apellidos}`.trim(),
        telefono: formData.telefono,
        correo: formData.email
      };

      const response = await fetch(`${API_URL}/gestion-usuarios/${selectedUsuario.id}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.status === 401) {
        showNotification('error', 'Sesión expirada. Por favor inicia sesión nuevamente.');
        setLoadingAction(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar usuario');
      }

      const result = await response.json();

      // 2. Actualizar datos del rol si es necesario
      const roleDataChanged =
        (formData.rol === 'ponente' && formData.especialidad !== selectedUsuario.rol_data?.especialidad) ||
        ((formData.rol === 'gerente' || formData.rol === 'organizador') &&
          formData.empresa && formData.empresa !== selectedUsuario.rol_data?.empresa_id);

      if (roleDataChanged) {
        const roleDataPayload = {
          rol: formData.rol,
          roleData: {}
        };

        if (formData.rol === 'ponente') {
          roleDataPayload.roleData.especialidad = formData.especialidad;
        } else if (formData.rol === 'gerente' || formData.rol === 'organizador') {
          roleDataPayload.roleData.empresa_id = parseInt(formData.empresa);
        }

        const roleDataResponse = await fetch(`${API_URL}/gestion-usuarios/${selectedUsuario.id}/role-data`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(roleDataPayload)
        });

        if (!roleDataResponse.ok) {
          const roleDataError = await roleDataResponse.json();
          showNotification('warning', `Usuario actualizado, pero hubo un problema con los datos del rol: ${roleDataError.message}`);
        }
      }

      if (result.success) {
        showNotification('success', 'Usuario actualizado exitosamente');

        if (result.data) {
          setSelectedUsuario(result.data);
        }

        setShowEditModal(false);
        resetForm();
        fetchUsuarios();
      } else {
        showNotification('error', result.message || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', `Error al actualizar usuario: ${error.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  // Crear usuario
  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        showNotification('error', 'No hay sesión activa. Por favor inicia sesión nuevamente.');
        return;
      }

      const requestBody = {
        nombre: `${formData.nombre} ${formData.apellidos}`,
        cedula: formData.numeroDocumento,
        correo: formData.email,
        telefono: formData.telefono,
        rol: formData.rol
      };

      if (formData.empresa && !isNaN(parseInt(formData.empresa))) {
        requestBody.id_empresa = parseInt(formData.empresa);
      }

      if (formData.rol === 'ponente' && formData.especialidad) {
        requestBody.especialidad = formData.especialidad;
      }

      const response = await fetch(`${API_URL}/auth/crear-usuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCredencialesUsuario({
          nombre: result.data.nombre,
          correo: result.data.correo,
          rol: result.data.rol,
          empresa: result.data.empresa?.nombre || 'N/A',
          mensaje: result.message
        });

        setShowCreateModal(false);
        setShowPasswordModal(true);
        resetForm();
        fetchUsuarios();
      } else {
        showNotification('error', result.message || 'Error al crear usuario. Por favor verifica los datos.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      showNotification('error', 'Error de conexión con el servidor.');
    }
  };

  // DESACTIVAR/ACTIVAR usuario (Toggle Status)
  const handleToggleStatus = async (id, nombre, estadoActual) => {
    const estadoActualNumerico = estadoActual === true || estadoActual === 1 ? 1 : 0;
    const nuevoEstado = estadoActualNumerico === 1 ? 0 : 1;
    const accion = estadoActualNumerico === 1 ? 'desactivar' : 'activar';
    const mensaje = estadoActualNumerico === 1
      ? `¿Estás seguro de desactivar al usuario ${nombre}?`
      : `¿Estás seguro de activar al usuario ${nombre}?`;

    if (window.confirm(mensaje)) {
      setLoadingAction(true);

      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          showNotification('error', 'No hay sesión activa. Por favor inicia sesión nuevamente.');
          setLoadingAction(false);
          return;
        }

        const response = await fetch(`${API_URL}/gestion-usuarios/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ activo: nuevoEstado })
        });

        if (response.status === 401) {
          showNotification('error', 'Sesión expirada. Por favor inicia sesión nuevamente.');
          setLoadingAction(false);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error al ${accion} usuario`);
        }

        const result = await response.json();

        if (result.success) {
          showNotification(
            'success',
            `Usuario ${accion === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`,
            5000
          );

          await fetchUsuarios();

          if (selectedUsuario && selectedUsuario.id === id) {
            const profileResponse = await fetch(`${API_URL}/gestion-usuarios/${id}/profile`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                nombre: selectedUsuario.nombre,
                telefono: selectedUsuario.telefono,
                correo: selectedUsuario.correo
              })
            });

            if (profileResponse.ok) {
              const profileResult = await profileResponse.json();
              if (profileResult.success && profileResult.data) {
                setSelectedUsuario(null);
                setTimeout(() => {
                  setSelectedUsuario(profileResult.data);
                }, 0);
              }
            }
          }
        } else {
          showNotification('error', result.message || `Error al ${accion} usuario`);
        }
      } catch (error) {
        console.error(`Error al ${accion} usuario:`, error);
        showNotification('error', `Error al ${accion} usuario: ${error.message}`);
      } finally {
        setLoadingAction(false);
      }
    }
  };

  // Filtrar usuarios según el filtro seleccionado
  const getFilteredUsers = () => {
    const usuariosArray = Array.isArray(usuarios) ? usuarios : [];
    if (filterBy === 'todas') return usuariosArray;
    return usuariosArray.filter(user => user.rol?.toLowerCase() === filterBy.toLowerCase());
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return (
      <div className={styles.usuariosContainer}>
        <div className={styles.loadingSpinner}>Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.usuariosContainer}>
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
          <button onClick={fetchUsuarios} className={styles.btnRetry}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.usuariosContainer}>
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <div className={styles.notificationContent}>
            <div className={styles.notificationIcon}>
              {notification.type === 'success' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className={styles.notificationMessage}>{notification.message}</p>
            <button
              className={styles.notificationClose}
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
          <div className={styles.notificationProgress}></div>
        </div>
      )}

      <div className={styles.usuariosHeader}>
        <h1 className={styles.usuariosTitle}>Usuarios</h1>
        <button
          className={styles.btnCrearUsuario}
          onClick={() => setShowCreateModal(true)}
        >
          + Crear Usuarios
        </button>
      </div>

      <div className={styles.usuariosCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Listado de Usuarios</h2>

          <div className={styles.headerControls}>
            <div className={styles.searchContainer}>
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className={styles.filterContainer}>
              <label htmlFor="filter-select">Filtrar por:</label>
              <select
                id="filter-select"
                className={styles.filterSelect}
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="todas">Mostrar todas</option>
                <option value="gerente">Gerente</option>
                <option value="ponente">Ponente</option>
                <option value="organizador">Organizador</option>
                <option value="asistente">Asistente</option>
              </select>
              <svg className={styles.filterIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.usuariosTable}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Email</th>
                <th>Telefono</th>
                <th>Empresa</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.noResults}>
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre || 'N/A'}</td>
                    <td>{usuario.cedula || 'N/A'}</td>
                    <td>{usuario.email || usuario.correo || 'N/A'}</td>
                    <td>{usuario.telefono || 'N/A'}</td>
                    <td>{obtenerNombreEmpresa(usuario)}</td>
                    <td>
                      <div className={styles.rolCell}>
                        <span className={`${styles.rolBadge} ${usuario.rol ? styles[`rol${usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}`] : ''}`}>
                          {usuario.rol ? usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1) : 'N/A'}
                        </span>
                        <div className={styles.actionIcons}>
                          <button
                            className={styles.iconBtn}
                            title="Ver"
                            onClick={() => handleViewUser(usuario)}
                            disabled={loadingAction}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 3C4.5 3 1.7 5.6 1 8c.7 2.4 3.5 5 7 5s6.3-2.6 7-5c-.7-2.4-3.5-5-7-5zm0 8a3 3 0 110-6 3 3 0 010 6z" />
                            </svg>
                          </button>
                          <button
                            className={styles.iconBtn}
                            title="Editar"
                            onClick={() => handleEditUser(usuario)}
                            disabled={loadingAction}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9zm1.4-.4a1 1 0 011.4 0l1.6 1.6a1 1 0 010 1.4l-1.1 1-3-3 1.1-1z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal VER USUARIO */}
      {showViewModal && selectedUsuario && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={`${styles.userIcon} ${styles.userIconBlue}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className={styles.modalTitle}>Información del Usuario</h3>
              <button className={styles.closeBtn} onClick={() => setShowViewModal(false)}>×</button>
            </div>

            <div className={styles.modalForm}>
              {/* Estado del Usuario */}
              <div className={`${styles.statusBadge} ${selectedUsuario.activo === 1 || selectedUsuario.activo === true ? styles.active : styles.inactive}`}>
                <span className={`${styles.statusIndicator} ${selectedUsuario.activo === 1 || selectedUsuario.activo === true ? styles.active : styles.inactive}`} />
                <span>
                  Estado: {selectedUsuario.activo === 1 || selectedUsuario.activo === true ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Información Personal */}
              <div className={styles.infoSection}>
                <h4 className={styles.sectionTitle}>Información Personal</h4>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      value={selectedUsuario.nombre || 'N/A'}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Número de Documento</label>
                    <input
                      type="text"
                      value={selectedUsuario.cedula || 'N/A'}
                      disabled
                      readOnly
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={selectedUsuario.telefono || 'N/A'}
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    value={selectedUsuario.correo || 'N/A'}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              {/* Información del Sistema */}
              <div className={styles.infoSection}>
                <h4 className={styles.sectionTitle}>Información del Sistema</h4>

                <div className={styles.formGroup}>
                  <label>Rol Asignado</label>
                  <input
                    type="text"
                    value={selectedUsuario.rol ? selectedUsuario.rol.charAt(0).toUpperCase() + selectedUsuario.rol.slice(1) : 'N/A'}
                    disabled
                    readOnly
                    className={styles.textCapitalize}
                  />
                </div>

                {selectedUsuario.rol_data?.empresa_nombre && (
                  <div className={styles.formGroup}>
                    <label>Empresa Asociada</label>
                    <input
                      type="text"
                      value={selectedUsuario.rol_data.empresa_nombre}
                      disabled
                      readOnly
                    />
                  </div>
                )}

                {selectedUsuario.rol_data?.especialidad && (
                  <div className={styles.formGroup}>
                    <label>Especialidad</label>
                    <input
                      type="text"
                      value={selectedUsuario.rol_data.especialidad}
                      disabled
                      readOnly
                    />
                  </div>
                )}
              </div>

              {/* Metadatos */}
              {selectedUsuario.fecha_creacion && (
                <div className={styles.infoSection}>
                  <h4 className={styles.sectionTitle}>Información Adicional</h4>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Fecha de Creación</label>
                      <input
                        type="text"
                        value={new Date(selectedUsuario.fecha_creacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className={styles.formActions}>
                <button
                  onClick={() => handleToggleStatus(selectedUsuario.id, selectedUsuario.nombre, selectedUsuario.activo)}
                  disabled={loadingAction}
                  className={selectedUsuario.activo === 1 || selectedUsuario.activo === true ? styles.btnDeactivate : styles.btnActivate}
                >
                  {selectedUsuario.activo === 1 || selectedUsuario.activo === true ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6 2V1h4v1h4v2h-1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4H2V2h4zm1 3v7h2V5H7zm-2 0v7h2V5H5zm6 0v7h-2V5h2z" />
                      </svg>
                      {loadingAction ? 'Desactivando...' : 'Desactivar Usuario'}
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.5 2L6 9.5 2.5 6 1 7.5l5 5 9-9z" />
                      </svg>
                      {loadingAction ? 'Activando...' : 'Activar Usuario'}
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowViewModal(false)}
                  disabled={loadingAction}
                  className={styles.btnSubmit}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal EDITAR USUARIO */}
      {showEditModal && selectedUsuario && (
        <div className={styles.modalOverlay} onClick={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedUsuario(null);
        }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={`${styles.userIcon} ${styles.userIconOrange}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className={styles.modalTitle}>Editar Usuario</h3>
              <button className={styles.closeBtn} onClick={() => {
                setShowEditModal(false);
                resetForm();
                setSelectedUsuario(null);
              }}>×</button>
            </div>

            <form onSubmit={handleUpdateUser} className={styles.modalForm}>
              {/* Información Personal */}
              <div className={styles.infoSection}>
                <h4 className={styles.sectionTitle}>Información Personal</h4>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombres completos"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Apellidos *</label>
                    <input
                      type="text"
                      name="apellidos"
                      placeholder="Apellidos completos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Número de Documento</label>
                  <input
                    type="text"
                    name="numeroDocumento"
                    value={formData.numeroDocumento}
                    disabled
                  />
                  <small className={styles.helperText}>El documento no puede ser modificado</small>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Teléfono *</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Correo Electrónico *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información del Rol */}
              <div className={styles.infoSection}>
                <h4 className={styles.sectionTitle}>Información del Rol</h4>

                <div className={styles.formGroup}>
                  <label>Rol Asignado</label>
                  <input
                    type="text"
                    value={formData.rol}
                    disabled
                    className={styles.textCapitalize}
                  />
                  <small className={styles.helperText}>El tipo de rol no puede ser modificado</small>
                </div>

                {/* Especialidad para Ponentes */}
                {formData.rol === 'ponente' && (
                  <div className={styles.formGroup}>
                    <label>Especialidad</label>
                    <input
                      type="text"
                      name="especialidad"
                      placeholder="Ej: Tecnología, Negocios, Medicina..."
                      value={formData.especialidad}
                      onChange={handleInputChange}
                    />
                    <small className={styles.helperText}>Puedes actualizar la especialidad del ponente</small>
                  </div>
                )}

                {/* Empresa para Gerentes y Organizadores */}
                {(formData.rol === 'gerente' || formData.rol === 'organizador') && (
                  <div className={styles.formGroup}>
                    <label>Empresa Asociada *</label>
                    <select
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      disabled={loadingEmpresas}
                      required
                    >
                      <option value="">Seleccione una empresa...</option>
                      {loadingEmpresas ? (
                        <option disabled>Cargando empresas...</option>
                      ) : (
                        empresas.map(empresa => (
                          <option key={empresa.id} value={empresa.id}>
                            {empresa.nombre}
                          </option>
                        ))
                      )}
                    </select>
                    <small className={styles.helperText}>Puedes cambiar la empresa asignada al usuario</small>
                  </div>
                )}

                {/* Empresa Opcional para Asistentes */}
                {formData.rol === 'asistente' && (
                  <div className={styles.formGroup}>
                    <label>Empresa (Opcional)</label>
                    <select
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      disabled={loadingEmpresas}
                    >
                      <option value="">Sin empresa asignada</option>
                      {empresas.map(empresa => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.nombre}
                        </option>
                      ))}
                    </select>
                    <small className={styles.helperText}>Los asistentes pueden estar asociados a una empresa</small>
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                    setSelectedUsuario(null);
                  }}
                  disabled={loadingAction}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`${styles.btnSubmit} ${styles.btnSubmitOrange}`}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <>
                      <svg className={styles.spinner} width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de CREAR Usuario */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.userIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className={styles.modalTitle}>Crear Nuevo Usuario</h3>
              <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateUser} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombres completos"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    placeholder="Apellidos completos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Número de Documento *</label>
                <input
                  type="text"
                  name="numeroDocumento"
                  placeholder="Número de identificación"
                  value={formData.numeroDocumento}
                  onChange={handleInputChange}
                  required
                />
                <small className={styles.helperText}>
                  Este documento debe ser único en el sistema
                </small>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Rol Asignado *</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar rol...</option>
                  {rolesDelSistema.map(rol => (
                    <option key={rol.id} value={rol.tipo}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {formData.rol === 'ponente' && (
                <div className={styles.formGroup}>
                  <label>Especialidad</label>
                  <input
                    type="text"
                    name="especialidad"
                    placeholder="Ej: Tecnología, Negocios..."
                    value={formData.especialidad}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {(formData.rol === 'gerente' || formData.rol === 'organizador') && (
                <div className={styles.formGroup}>
                  <label>Empresa *</label>
                  <select
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    disabled={loadingEmpresas}
                    required
                  >
                    <option value="">Seleccione una empresa...</option>
                    {loadingEmpresas ? (
                      <option disabled>Cargando empresas...</option>
                    ) : (
                      empresas.map(empresa => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.nombre}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {formData.rol && formData.rol !== 'gerente' && formData.rol !== 'organizador' && (
                <div className={styles.formGroup}>
                  <label>Empresa (Opcional)</label>
                  <select
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    disabled={loadingEmpresas}
                  >
                    <option value="">Sin empresa asignada</option>
                  </select>
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Creación */}
      {showPasswordModal && credencialesUsuario && (
        <div className={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={`${styles.userIcon} ${styles.userIconGreen}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className={styles.modalTitle}>Usuario Creado Exitosamente</h3>
              <button className={styles.closeBtn} onClick={() => setShowPasswordModal(false)}>×</button>
            </div>

            <div className={styles.modalForm}>
              <div className={`${styles.successBanner} ${styles.mb20}`}>
                <p className={styles.successText}>
                  {credencialesUsuario.mensaje}
                </p>
              </div>

              <div className={`${styles.infoBanner} ${styles.mb16}`}>
                <h4 className={styles.infoBannerTitle}>Información del Usuario:</h4>

                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Nombre:</span>
                    <span className={styles.infoValue}>{credencialesUsuario.nombre}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Correo:</span>
                    <span className={styles.infoValue}>{credencialesUsuario.correo}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Rol:</span>
                    <span className={`${styles.infoValue} ${styles.textCapitalize}`}>
                      {credencialesUsuario.rol}
                    </span>
                  </div>
                  {credencialesUsuario.empresa !== 'N/A' && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Empresa:</span>
                      <span className={styles.infoValue}>{credencialesUsuario.empresa}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${styles.warningBanner} ${styles.mb20}`}>
                <div className={styles.warningContent}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" fill="#f57c00" />
                  </svg>
                  <div>
                    <p className={styles.warningTitle}>
                      Contraseña Temporal Generada
                    </p>
                    <p className={styles.warningText}>
                      Se ha generado una contraseña temporal y se ha enviado al correo electrónico del usuario.
                      El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setCredencialesUsuario(null);
                }}
                className={`${styles.btnSubmit} ${styles.btnSubmitGreen}`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;