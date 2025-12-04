import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import styles from './usuarios.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const ROLES_DEFAULT = [
    { id: 2, nombre: 'Gerente', tipo: 'gerente' },
    { id: 3, nombre: 'Organizador', tipo: 'organizador' },
    { id: 4, nombre: 'Ponente', tipo: 'ponente' },
    { id: 5, nombre: 'Asistente', tipo: 'asistente' }
];

const UsuariosSection = () => {
    const { user } = useAuth();

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('todas');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [empresas, setEmpresas] = useState([]);
    const [credencialesUsuario, setCredencialesUsuario] = useState(null);
    const [selectedUsuario, setSelectedUsuario] = useState(null);

    const [loadingEmpresas, setLoadingEmpresas] = useState(false);
    const [loadingView, setLoadingView] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const [notification, setNotification] = useState(null);
    const [showPassword, setShowPassword] = useState({
        contraseña: false,
        confirmarContraseña: false
    });

    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        numeroDocumento: '',
        telefono: '',
        email: '',
        rol: '',
        empresa: '',
        especialidad: '',
        contraseña: '',
        confirmarContraseña: ''
    });

    useEffect(() => {
        fetchUsuarios();
    }, []);

    useEffect(() => {
        if (showCreateModal || showEditModal) {
            fetchEmpresas();
        }
    }, [showCreateModal, showEditModal]);

    useEffect(() => {
        if (selectedUsuario && usuarios.length > 0) {
            const usuarioActualizado = usuarios.find(u => u.id === selectedUsuario.id);
            if (usuarioActualizado) {
                const estadoActualNormalizado = estaActivo(selectedUsuario);
                const estadoNuevoNormalizado = estaActivo(usuarioActualizado);

                if (estadoActualNormalizado !== estadoNuevoNormalizado) {
                    setSelectedUsuario(usuarioActualizado);
                }
            }
        }
    }, [usuarios, selectedUsuario]);

    const showNotification = (type, message, duration = 4000) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), duration);
    };

    const getToken = () => localStorage.getItem('access_token');

    const handleApiError = (error, defaultMessage = 'Error de conexión') => {
        showNotification('error', error.message || defaultMessage);
    };

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/gestion-usuarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setUsuarios(result.data || []);
                    syncSelectedUsuario(result.data);
                } else {
                    setError(result.message || 'Error al cargar usuarios');
                }
            } else {
                setError('Error al cargar usuarios');
            }
        } catch (error) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpresas = async () => {
        setLoadingEmpresas(true);
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/empresas?incluir_pendientes=true`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const empresasAprobadas = result.data.filter(e => e.estado === 1);
                    setEmpresas(empresasAprobadas);
                }
            }
        } catch (error) {
            handleApiError(error, 'Error al cargar empresas');
        } finally {
            setLoadingEmpresas(false);
        }
    };

    const syncSelectedUsuario = (usuariosData) => {
        if (selectedUsuario && usuariosData) {
            const usuarioActualizado = usuariosData.find(u => u.id === selectedUsuario.id);
            if (usuarioActualizado) {
                setSelectedUsuario(usuarioActualizado);
            }
        }
    };

    const obtenerNombreEmpresa = (usuario) => {
        if (usuario.rol_data?.empresa_nombre) {
            return usuario.rol_data.empresa_nombre;
        }
        if (usuario.empresa && usuario.empresa !== 'N/A') {
            return usuario.empresa;
        }
        return 'N/A';
    };

    const estaActivo = (usuario) => {
        return usuario.activo === 1;
    };

    const getFilteredUsers = () => {
        let filtered = usuarios.filter(user =>
            user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.cedula?.includes(searchTerm)
        );

        if (filterBy !== 'todas') {
            filtered = filtered.filter(user => user.rol?.toLowerCase() === filterBy.toLowerCase());
        }

        return filtered;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            especialidad: '',
            contraseña: '',
            confirmarContraseña: ''
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleViewUser = async (usuario) => {
        setLoadingView(true);
        try {
            const token = getToken();
            if (!token) {
                showNotification('error', 'No hay sesión activa');
                return;
            }

            const response = await fetch(`${API_URL}/gestion-usuarios/${usuario.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                showNotification('error', 'Sesión expirada');
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
            handleApiError(error, 'Error al cargar información del usuario');
        } finally {
            setLoadingView(false);
        }
    };

    const handleEditUser = async (usuario) => {
        setLoadingEdit(true);
        try {
            const token = getToken();
            if (!token) {
                showNotification('error', 'No hay sesión activa');
                return;
            }

            const response = await fetch(`${API_URL}/gestion-usuarios/${usuario.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar información del usuario');
            }

            const result = await response.json();
            if (result.success && result.data) {
                const userData = result.data;

                if (!userData.rol) {
                    showNotification('warning', 'Este usuario no tiene un rol asignado. Contacta al administrador.');
                    return;
                }

                const nombreCompleto = userData.nombre || '';
                const partesNombre = nombreCompleto.trim().split(' ');

                setFormData({
                    nombre: partesNombre[0] || '',
                    apellidos: partesNombre.slice(1).join(' ') || '',
                    numeroDocumento: userData.cedula || '',
                    telefono: userData.telefono || '',
                    email: userData.correo || '',
                    rol: userData.rol || '',
                    empresa: userData.rol_data?.empresa_id?.toString() || '',
                    especialidad: userData.rol_data?.especialidad || ''
                });

                setSelectedUsuario(userData);
                setShowEditModal(true);
            } else {
                showNotification('error', 'Error al cargar información del usuario');
            }
        } catch (error) {
            handleApiError(error, 'Error al cargar información del usuario');
        } finally {
            setLoadingEdit(false);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!validarFormularioEdicion()) return;
        setLoadingUpdate(true);

        try {
            const token = getToken();
            if (!token) {
                showNotification('error', 'No hay sesión activa');
                return;
            }

            const updateData = {
                nombre: `${formData.nombre} ${formData.apellidos}`.trim(),
                telefono: formData.telefono,
                correo: formData.email
            };

            const responseProfile = await fetch(`${API_URL}/gestion-usuarios/${selectedUsuario.id}/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!responseProfile.ok) {
                const errorData = await responseProfile.json();
                throw new Error(errorData.message || 'Error al actualizar perfil del usuario');
            }

            const roleData = {};

            if ((formData.rol === 'gerente' || formData.rol === 'organizador') && formData.empresa) {
                roleData.empresa_id = parseInt(formData.empresa);
            }

            if (formData.rol === 'ponente' && formData.especialidad) {
                roleData.especialidad = formData.especialidad;
            }

            if (Object.keys(roleData).length > 0 || formData.rol !== selectedUsuario.rol) {
                const responseRole = await fetch(`${API_URL}/gestion-usuarios/${selectedUsuario.id}/role-data`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        rol: formData.rol,
                        roleData: roleData
                    })
                });

                if (!responseRole.ok) {
                    const errorData = await responseRole.json();
                    if (errorData.message?.includes('no encontrado') || responseRole.status === 404) {
                        throw new Error(`El usuario no tiene un registro de rol ${formData.rol}. Es posible que necesites contactar al administrador.`);
                    }
                    throw new Error(errorData.message || 'Error al actualizar rol del usuario');
                }
            }

            showNotification('success', 'Usuario actualizado exitosamente');

            updateUsuarioEnLista(selectedUsuario.id, {
                nombre: `${formData.nombre} ${formData.apellidos}`.trim(),
                telefono: formData.telefono,
                correo: formData.email,
                rol: formData.rol,
                rol_data: {
                    empresa_id: formData.empresa ? parseInt(formData.empresa) : null,
                    empresa_nombre: empresas.find(e => e.id === parseInt(formData.empresa))?.nombre || null,
                    especialidad: formData.especialidad || null
                }
            });

            setShowEditModal(false);
            resetForm();
            setTimeout(fetchUsuarios, 1000);

        } catch (error) {
            handleApiError(error, 'Error al actualizar usuario');
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            if (!token) {
                showNotification('error', 'No hay sesión activa');
                return;
            }

            if (!validarFormularioCreacion()) return;

            const requestBody = construirRequestBodyCreacion();
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
                manejarCreacionExitosa(result);
            } else {
                showNotification('error', result.message || 'Error al crear usuario');
            }
        } catch (error) {
            handleApiError(error, 'Error de conexión con el servidor');
        }
    };

    const handleToggleStatus = async (id, nombre, estadoActual) => {
        const estadoActualNormalizado = Number(estadoActual);
        const nuevoEstado = estadoActualNormalizado === 1 ? 0 : 1;

        const accion = nuevoEstado === 1 ? 'activar' : 'desactivar';
        const mensaje = nuevoEstado === 1
            ? `¿Estás seguro de activar al usuario ${nombre}?`
            : `¿Estás seguro de desactivar al usuario ${nombre}?`;

        if (mensaje) {
            setLoadingStatus(true);
            try {
                const token = getToken();
                if (!token) {
                    showNotification('error', 'No hay sesión activa');
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
                    showNotification('error', 'Sesión expirada');
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error al ${accion} usuario`);
                }

                const result = await response.json();
                if (result.success) {
                    const estadoFinal = result.data.activo;
                    showNotification('success', result.message, 5000);
                    actualizarEstadoUsuario(id, estadoFinal);
                } else {
                    showNotification('error', result.message || `Error al ${accion} usuario`);
                }
            } catch (error) {
                handleApiError(error, `Error al ${accion} usuario`);
            } finally {
                setLoadingStatus(false);
            }
        }
    };

    const validarFormularioCreacion = () => {
        if (formData.contraseña !== formData.confirmarContraseña) {
            showNotification('error', 'Las contraseñas no coinciden');
            return false;
        }

        if (formData.contraseña.length < 6) {
            showNotification('error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (!formData.nombre || !formData.apellidos || !formData.numeroDocumento ||
            !formData.telefono || !formData.email || !formData.rol) {
            showNotification('error', 'Por favor completa todos los campos obligatorios');
            return false;
        }

        if ((formData.rol === 'gerente' || formData.rol === 'organizador') && !formData.empresa) {
            showNotification('error', 'Para los roles de Gerente u Organizador se requiere seleccionar una empresa');
            return false;
        }

        return true;
    };

    const validarFormularioEdicion = () => {
        if (!formData.nombre || !formData.apellidos || !formData.telefono || !formData.email || !formData.rol) {
            showNotification('error', 'Por favor completa todos los campos obligatorios');
            return false;
        }

        if ((formData.rol === 'gerente' || formData.rol === 'organizador') && !formData.empresa) {
            showNotification('error', 'Para los roles de Gerente u Organizador se requiere seleccionar una empresa');
            return false;
        }

        return true;
    };

    const construirRequestBodyCreacion = () => {
        const requestBody = {
            nombre: `${formData.nombre} ${formData.apellidos}`.trim(),
            cedula: formData.numeroDocumento,
            correo: formData.email,
            telefono: formData.telefono,
            rol: formData.rol,
            contraseña: formData.contraseña
        };

        if (formData.empresa && !isNaN(parseInt(formData.empresa))) {
            requestBody.id_empresa = parseInt(formData.empresa);
        }

        if (formData.rol === 'ponente' && formData.especialidad) {
            requestBody.especialidad = formData.especialidad;
        }

        return requestBody;
    };

    const manejarCreacionExitosa = (result) => {
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
    };

    const updateUsuarioEnLista = (id, datos) => {
        setUsuarios(prevUsuarios =>
            prevUsuarios.map(usuario =>
                usuario.id === id ? { ...usuario, ...datos } : usuario
            )
        );
    };

    const actualizarEstadoUsuario = (id, nuevoEstado) => {
        setUsuarios(prevUsuarios =>
            prevUsuarios.map(usuario =>
                usuario.id === id ? { ...usuario, activo: nuevoEstado } : usuario
            )
        );

        if (selectedUsuario && selectedUsuario.id === id) {
            setSelectedUsuario(prev => ({
                ...prev,
                activo: nuevoEstado
            }));
        }
    };

    const rolesDelSistema = (() => {
        try {
            const savedRoles = localStorage.getItem('rolesState');
            const roles = savedRoles ? JSON.parse(savedRoles) : [
                { id: 1, nombre: 'Administrador', tipo: 'administrador', activo: true, editable: false },
                ...ROLES_DEFAULT
            ];

            return roles
                .filter(rol => rol.activo && rol.editable && rol.tipo !== 'administrador')
                .map(rol => ({
                    id: rol.id,
                    nombre: rol.nombre,
                    tipo: rol.tipo
                }));
        } catch (error) {
            return ROLES_DEFAULT;
        }
    })();

    const filteredUsers = getFilteredUsers();

    const renderTableRows = () => {
        if (filteredUsers.length === 0) {
            return (
                <tr>
                    <td colSpan="7" className={styles.noResults}>
                        No se encontraron usuarios
                    </td>
                </tr>
            );
        }

        return filteredUsers.map((usuario) => (
            <tr key={usuario.id}>
                <td>
                    <div className={styles.userInfo}>
                        <span>{usuario.nombre || 'N/A'}</span>
                    </div>
                </td>
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
                                disabled={loadingView || loadingEdit}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 3C4.5 3 1.7 5.6 1 8c.7 2.4 3.5 5 7 5s6.3-2.6 7-5c-.7-2.4-3.5-5-7-5zm0 8a3 3 0 110-6 3 3 0 010 6z" />
                                </svg>
                            </button>
                            <button
                                className={styles.iconBtn}
                                title="Editar"
                                onClick={() => handleEditUser(usuario)}
                                disabled={loadingView || loadingEdit}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9zm1.4-.4a1 1 0 011.4 0l1.6 1.6a1 1 0 010 1.4l-1.1 1-3-3 1.1-1z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        ));
    };

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
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                            {renderTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>

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
                            <div className={`${styles.statusBadge} ${estaActivo(selectedUsuario) ? styles.active : styles.inactive}`}>
                                <span className={`${styles.statusIndicator} ${estaActivo(selectedUsuario) ? styles.active : styles.inactive}`} />
                                <span>
                                    Estado: {estaActivo(selectedUsuario) ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

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

                            <div className={styles.infoSection}>
                                <h4 className={styles.sectionTitle}>Información del Sistema</h4>

                                <div className={styles.formGroup}>
                                    <label>Rol Asignado *</label>
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

                            <div className={styles.formActions}>
                                <button
                                    onClick={() => handleToggleStatus(selectedUsuario.id, selectedUsuario.nombre, selectedUsuario.activo)}
                                    disabled={loadingStatus}
                                    className={estaActivo(selectedUsuario) ? styles.btnDeactivate : styles.btnActivate}
                                >
                                    {estaActivo(selectedUsuario) ? (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M6 2V1h4v1h4v2h-1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4H2V2h4zm1 3v7h2V5H7zm-2 0v7h2V5H5zm6 0v7h-2V5h2z" />
                                            </svg>
                                            {loadingStatus ? 'Desactivando...' : 'Desactivar Usuario'}
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M13.5 2L6 9.5 2.5 6 1 7.5l5 5 9-9z" />
                                            </svg>
                                            {loadingStatus ? 'Activando...' : 'Activar Usuario'}
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setShowViewModal(false)}
                                    disabled={loadingStatus}
                                    className={styles.btnSubmit}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

                            <div className={styles.infoSection}>
                                <h4 className={styles.sectionTitle}>Información del Rol</h4>

                                <div className={styles.formGroup}>
                                    <label>Rol Asignado *</label>
                                    <input
                                        type="text"
                                        value={selectedUsuario.rol ? selectedUsuario.rol.charAt(0).toUpperCase() + selectedUsuario.rol.slice(1) : 'N/A'}
                                        disabled
                                        readOnly
                                        className={styles.textCapitalize}
                                    />
                                    <small className={styles.helperText}>
                                        No se puede cambiar el rol asignado al usuario
                                    </small>
                                </div>

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
                                        <small className={styles.helperText}>Especialidad del ponente</small>
                                    </div>
                                )}

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
                                        <small className={styles.helperText}>Empresa asignada al usuario</small>
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
                                    disabled={loadingUpdate}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={`${styles.btnSubmit} ${styles.btnSubmitOrange}`}
                                    disabled={loadingUpdate}
                                >
                                    {loadingUpdate ? (
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

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Contraseña *</label>
                                    <div className={styles.passwordInputContainer}>
                                        <input
                                            type={showPassword.contraseña ? "text" : "password"}
                                            name="contraseña"
                                            placeholder="Ingrese contraseña temporal"
                                            value={formData.contraseña}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.passwordInput}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => togglePasswordVisibility('contraseña')}
                                        >
                                            {showPassword.contraseña ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <small className={styles.helperText}>
                                        Contraseña temporal para el usuario
                                    </small>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Confirmar Contraseña *</label>
                                    <div className={styles.passwordInputContainer}>
                                        <input
                                            type={showPassword.confirmarContraseña ? "text" : "password"}
                                            name="confirmarContraseña"
                                            placeholder="Confirme la contraseña"
                                            value={formData.confirmarContraseña}
                                            onChange={handleInputChange}
                                            required
                                            className={styles.passwordInput}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => togglePasswordVisibility('confirmarContraseña')}
                                        >
                                            {showPassword.confirmarContraseña ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

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

export default UsuariosSection;