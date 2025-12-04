import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Pencil, X, Trash2, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import styles from './ubicaciones.module.css';
import Header from '../../layouts/Header/header';
import GerenteSidebar from '../gerente/GerenteSidebar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Notification = ({ type, title, message, onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} className={styles.notificationIcon} />;
            case 'error':
                return <XCircle size={20} className={styles.notificationIcon} />;
            case 'warning':
                return <AlertCircle size={20} className={styles.notificationIcon} />;
            case 'info':
                return <Info size={20} className={styles.notificationIcon} />;
            default:
                return <Info size={20} className={styles.notificationIcon} />;
        }
    };

    return (
        <div className={`${styles.notification} ${styles[type]}`}>
            {getIcon()}
            <div className={styles.notificationContent}>
                <div className={styles.notificationTitle}>{title}</div>
                <div className={styles.notificationMessage}>{message}</div>
            </div>
            <button className={styles.notificationClose} onClick={onClose}>
                <X size={16} />
            </button>
        </div>
    );
};

const Ubicaciones = () => {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [empresa, setEmpresa] = useState(null);
    const [ciudades, setCiudades] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        lugar: '',
        direccion: '',
        capacidad: '',
        descripcion: '',
        id_ciudad: ''
    });
    const [editingUbicacion, setEditingUbicacion] = useState(null);
    const [deletingUbicacion, setDeletingUbicacion] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (empresa && ciudades.length > 0 && ubicaciones.length > 0) {
            const ubicacionesActualizadas = ubicaciones.map(ubicacion => {
                if (ubicacion.id_ciudad && !ubicacion.ciudad_nombre) {
                    const ciudadEncontrada = ciudades.find(ciudad => ciudad.id === ubicacion.id_ciudad);
                    return {
                        ...ubicacion,
                        ciudad_nombre: ciudadEncontrada ? ciudadEncontrada.nombre : 'Sin ciudad'
                    };
                }
                return ubicacion;
            });
            setUbicaciones(ubicacionesActualizadas);
        }
    }, [ciudades, empresa, ubicaciones]);

    const showNotification = (type, title, message, duration = 5000) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type,
            title,
            message,
            duration
        };

        setNotifications(prev => [...prev, newNotification]);
        return id;
    };

    const closeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const getToken = () => {
        const tokenNames = ['access_token', 'token', 'auth_token'];
        for (const name of tokenNames) {
            const token = localStorage.getItem(name);
            if (token) {
                return token;
            }
        }
        return null;
    };

    const fetchData = async () => {
        try {
            const token = getToken();
            if (!token) {
                console.error('No se encontró token de autenticación');
                return;
            }

            await Promise.all([
                fetchCiudades(token),
                fetchEmpresaUsuario(token)

            ]);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmpresaUsuario = async (token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('🔍 Obteniendo perfil del usuario...');
            const profileResponse = await fetch(`${API_URL}/auth/profile`, {
                headers: headers
            });

            if (!profileResponse.ok) {
                throw new Error(`HTTP ${profileResponse.status}: ${profileResponse.statusText}`);
            }

            const profileResult = await profileResponse.json();
            console.log('👤 Perfil del usuario:', profileResult);

            if (profileResult.success) {
                let empresaId = null;

                if (profileResult.data?.usuario?.roData?.empresa?.id) {
                    empresaId = profileResult.data.usuario.roData.empresa.id;
                }
                else if (profileResult.data?.usuario?.roData?.id_empresa) {
                    empresaId = profileResult.data.usuario.roData.id_empresa;
                }
                else if (profileResult.data?.empresa?.id) {
                    empresaId = profileResult.data.empresa.id;
                }
                else if (profileResult.data?.id_empresa) {
                    empresaId = profileResult.data.id_empresa;
                }
                else if (profileResult.data?.usuario?.id_empresa) {
                    empresaId = profileResult.data.usuario.id_empresa;
                }

                console.log('🏢 ID de empresa encontrado:', empresaId);

                if (empresaId) {
                    await fetchEmpresaDetalles(empresaId, token);
                } else {
                    console.error('❌ No se pudo encontrar el ID de la empresa en el perfil');
                    await fetchPrimeraEmpresa(token);
                }
            } else {
                console.error('❌ Error en respuesta del perfil:', profileResult.message);
                await fetchPrimeraEmpresa(token);
            }
        } catch (error) {
            console.error('❌ Error al obtener empresa del usuario:', error);
            await fetchPrimeraEmpresa(token);
        }
    };

    const fetchEmpresaDetalles = async (empresaId, token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log(`🔍 Obteniendo detalles de la empresa ID: ${empresaId}`);
            const response = await fetch(`${API_URL}/empresas/${empresaId}`, {
                headers: headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('🏢 Empresa no encontrada, intentando obtener lista...');
                    await fetchPrimeraEmpresa(token);
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📊 Detalles de empresa:', result);

            if (result.success && result.data) {
                setEmpresa(result.data);
                await fetchUbicacionesByEmpresa(result.data.id, token);
            } else {
                console.error('❌ Error al obtener detalles de empresa:', result.message);
                await fetchPrimeraEmpresa(token);
            }
        } catch (error) {
            console.error('❌ Error al obtener detalles de la empresa:', error);
            await fetchPrimeraEmpresa(token);
        }
    };

    const fetchPrimeraEmpresa = async (token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('🏢 Obteniendo lista de empresas...');
            const response = await fetch(`${API_URL}/empresas`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📊 Lista de empresas recibida:', result);

            // Validar que result.data sea un array
            if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
                const primeraEmpresa = result.data[0];
                console.log('✅ Primera empresa encontrada:', primeraEmpresa);
                setEmpresa(primeraEmpresa);
                await fetchUbicacionesByEmpresa(primeraEmpresa.id, token);
            } else {
                console.error('❌ No se encontraron empresas disponibles o formato inválido');
                const empresaDefault = {
                    id: 1,
                    nombre: 'Mi Empresa'
                };
                setEmpresa(empresaDefault);
                setUbicaciones([]);
            }
        } catch (error) {
            console.error('❌ Error al obtener lista de empresas:', error);
            const empresaDefault = {
                id: 1,
                nombre: 'Mi Empresa'
            };
            setEmpresa(empresaDefault);
            setUbicaciones([]);
        }
    };

    const fetchUbicacionesByEmpresa = async (empresaId, token = null, ciudadesList = ciudades) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log(`🔍 Buscando ubicaciones para empresa ID: ${empresaId}`);

            const response = await fetch(`${API_URL}/empresas/${empresaId}/ubicaciones`, {
                headers: headers
            });

            console.log('📊 Response status:', response.status);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('📍 No se encontraron ubicaciones para esta empresa');
                    setUbicaciones([]);
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📄 Respuesta completa del servidor:', result);

            if (result.success && result.data) {
                let ubicacionesArray = result.data;

                if (!Array.isArray(ubicacionesArray)) {
                    console.warn('⚠️ result.data no es un array, convirtiendo:', ubicacionesArray);

                    if (ubicacionesArray === null || ubicacionesArray === undefined) {
                        ubicacionesArray = [];
                    } else if (typeof ubicacionesArray === 'object') {
                        ubicacionesArray = [ubicacionesArray];
                    } else {
                        ubicacionesArray = [];
                    }
                }

                console.log(`📍 Total de ubicaciones a procesar: ${ubicacionesArray.length}`);

                const ubicacionesConCiudades = ubicacionesArray.map(ubicacion => {
                    console.log('🔍 Procesando ubicación completa:', ubicacion);

                    let ciudadNombre = 'Sin ciudad';

                    // Múltiples formas de obtener el nombre de la ciudad
                    if (Array.isArray(ubicacion.ciudad) && ubicacion.ciudad.length > 0) {
                        ciudadNombre = ubicacion.ciudad[0].nombre;
                    } else if (ubicacion.ciudad && typeof ubicacion.ciudad === 'object' && ubicacion.ciudad.nombre) {
                        ciudadNombre = ubicacion.ciudad.nombre;
                    } else if (ubicacion.ciudad_nombre) {
                        ciudadNombre = ubicacion.ciudad_nombre;
                    } else if (ubicacion.nombre_ciudad) {
                        ciudadNombre = ubicacion.nombre_ciudad;
                    } else if (ubicacion.id_ciudad && Array.isArray(ciudades) && ciudades.length > 0) {
                        // Buscar en el listado de ciudades si tenemos el id_ciudad
                        const ciudadEncontrada = ciudades.find(ciudad => ciudad.id === ubicacion.id_ciudad);
                        if (ciudadEncontrada) {
                            ciudadNombre = ciudadEncontrada.nombre;
                        }
                    }

                    console.log(`🏙️ Ciudad asignada para ubicación ${ubicacion.id}: ${ciudadNombre}`);

                    return {
                        ...ubicacion,
                        ciudad_nombre: ciudadNombre
                    };
                });

                console.log('✅ Ubicaciones procesadas:', ubicacionesConCiudades);
                setUbicaciones(ubicacionesConCiudades);
            } else {
                console.warn('⚠️ Respuesta sin data o success=false:', result);
                setUbicaciones([]);
            }
        } catch (error) {
            console.error('❌ Error al obtener ubicaciones:', error);
            setUbicaciones([]);
        }
    };

    const fetchCiudades = async (token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('🏙️ Obteniendo lista de ciudades...');
            const response = await fetch(`${API_URL}/ciudades`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('📊 Ciudades recibidas:', result);

            if (result.success && result.data && Array.isArray(result.data)) {
                setCiudades(result.data);
            } else {
                console.warn('⚠️ No se pudieron cargar las ciudades:', result);
                setCiudades([]);
            }
        } catch (error) {
            console.error('❌ Error al obtener ciudades:', error);
            setCiudades([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            if (!empresa || !empresa.id) {
                showNotification('error', 'Error', 'No se pudo determinar la empresa del usuario. Por favor, recargue la página.');
                return;
            }

            console.log('📤 Creando nueva ubicación...', formData);

            const response = await fetch(`${API_URL}/empresas/${empresa.id}/ubicaciones`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    lugar: formData.lugar,
                    direccion: formData.direccion,
                    capacidad: parseInt(formData.capacidad),
                    descripcion: formData.descripcion,
                    id_ciudad: parseInt(formData.id_ciudad)
                })
            });

            const result = await response.json();
            console.log('📥 Respuesta creación:', result);

            if (result.success) {
                showNotification('success', 'Éxito', 'Ubicación creada exitosamente');
                closeAllModals();
                await fetchUbicacionesByEmpresa(empresa.id, token);
            } else {
                showNotification('error', 'Error', `Error al crear ubicación: ${result.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            showNotification('error', 'Error', 'Error al crear ubicación. Por favor, intente nuevamente.');
        }
    };

    const handleEdit = (ubicacion) => {
        setEditingUbicacion(ubicacion);
        setFormData({
            lugar: ubicacion.lugar || '',
            direccion: ubicacion.direccion || '',
            capacidad: ubicacion.capacidad || '',
            descripcion: ubicacion.descripcion || '',
            id_ciudad: ubicacion.id_ciudad || ''
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            if (!editingUbicacion || !empresa) {
                showNotification('error', 'Error', 'No hay ubicación seleccionada para editar o no se encontró la empresa');
                return;
            }

            console.log('📤 Actualizando ubicación...', formData);

            const response = await fetch(`${API_URL}/ubicaciones/${editingUbicacion.id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    lugar: formData.lugar,
                    direccion: formData.direccion,
                    capacidad: parseInt(formData.capacidad),
                    descripcion: formData.descripcion,
                    id_ciudad: parseInt(formData.id_ciudad)
                })
            });

            const result = await response.json();

            if (result.success) {
                showNotification('success', 'Éxito', 'Ubicación actualizada exitosamente');
                closeAllModals();
                await Promise.all([
                    fetchCiudades(token),
                    fetchUbicacionesByEmpresa(empresa.id, token)
                ]);
            } else {
                showNotification('error', 'Error', `Error al actualizar ubicación: ${result.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'Error', 'Error al actualizar ubicación. Por favor, intente nuevamente.');
        }
    };

    const handleDeleteClick = (ubicacion) => {
        setDeletingUbicacion(ubicacion);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingUbicacion || !empresa) return;

        try {
            const token = getToken();
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('🗑️ Eliminando ubicación...', deletingUbicacion.id);

            const response = await fetch(`${API_URL}/ubicaciones/${deletingUbicacion.id}`, {
                method: 'DELETE',
                headers: headers
            });

            const result = await response.json();

            if (result.success) {
                showNotification('success', 'Éxito', 'Ubicación eliminada exitosamente');
                closeAllModals();
                await fetchUbicacionesByEmpresa(empresa.id, token);
            } else {
                showNotification('error', 'Error', `Error al eliminar ubicación: ${result.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'Error', 'Error al eliminar ubicación. Por favor, intente nuevamente.');
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeletingUbicacion(null);
    };

    // Función para cerrar todos los modales y resetear estados
    const closeAllModals = () => {
        setShowModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setEditingUbicacion(null);
        setDeletingUbicacion(null);
        setFormData({
            lugar: '',
            direccion: '',
            capacidad: '',
            descripcion: '',
            id_ciudad: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
    };

    const filteredUbicaciones = ubicaciones.filter(ubicacion => {
        const matchesSearch = ubicacion.lugar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ubicacion.direccion?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className={styles.appContainer}>
            <Header />

            {/* Sistema de notificaciones */}
            <div className={styles.notificationContainer}>
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        type={notification.type}
                        title={notification.title}
                        message={notification.message}
                        duration={notification.duration}
                        onClose={() => closeNotification(notification.id)}
                    />
                ))}
            </div>

            <div className={styles.mainLayout}>
                <GerenteSidebar onToggle={handleSidebarToggle} />
                <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
                    <div className={styles.ubicacionesContainer}>
                        <div className={styles.ubicacionesHeader}>
                            <div className={styles.headerInfo}>
                                <h1>Ubicaciones</h1>
                            </div>
                            <button
                                className={styles.btnCreate}
                                onClick={() => {
                                    if (!empresa) {
                                        showNotification('warning', 'Espera', 'Espere a que cargue la información de la empresa');
                                        return;
                                    }
                                    setShowModal(true);
                                }}
                                disabled={!empresa}
                            >
                                <Plus size={20} />
                                Crear Ubicación
                            </button>
                        </div>

                        <div className={styles.ubicacionesContent}>
                            <h2>Listado de Ubicaciones</h2>

                            <div className={styles.filtersRow}>
                                <div className={styles.searchBox}>
                                    <Search size={20} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o dirección..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.tableContainer}>
                                <table className={styles.ubicacionesTable}>
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Dirección</th>
                                            <th>Capacidad</th>
                                            <th>Descripción</th>
                                            <th>Ciudad</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUbicaciones.length === 0 ? (
                                            <tr>
                                            </tr>
                                        ) : (
                                            filteredUbicaciones.map((ubicacion) => (
                                                <tr key={ubicacion.id}>
                                                    <td>{ubicacion.lugar}</td>
                                                    <td>{ubicacion.direccion}</td>
                                                    <td>{ubicacion.capacidad}</td>
                                                    <td>{ubicacion.descripcion}</td>
                                                    <td>{ubicacion.ciudad_nombre || 'Sin ciudad'}</td>
                                                    <td className={styles.actionsCell}>
                                                        <button
                                                            className={styles.btnIcon}
                                                            title="Editar"
                                                            onClick={() => handleEdit(ubicacion)}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            className={`${styles.btnIcon} ${styles.btnDelete}`}
                                                            title="Eliminar"
                                                            onClick={() => handleDeleteClick(ubicacion)}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para crear ubicación */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeAllModals}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Crear Nueva Ubicación</h2>
                            <button className={styles.btnClose} onClick={closeAllModals}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.ubicacionForm}>
                            <div className={styles.formGroup}>
                                <label>Empresa</label>
                                <div className={styles.empresaDisplay}>
                                    <strong>{empresa?.nombre || 'Cargando...'}</strong>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="lugar">Nombre *</label>
                                <input
                                    type="text"
                                    id="lugar"
                                    name="lugar"
                                    value={formData.lugar}
                                    onChange={handleInputChange}
                                    placeholder="Nombre de la ubicación"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="direccion">Dirección *</label>
                                <input
                                    type="text"
                                    id="direccion"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleInputChange}
                                    placeholder="Dirección completa"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="capacidad">Capacidad *</label>
                                <input
                                    type="number"
                                    id="capacidad"
                                    name="capacidad"
                                    value={formData.capacidad}
                                    onChange={handleInputChange}
                                    placeholder="Capacidad de personas"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="id_ciudad">Ciudad *</label>
                                <select
                                    id="id_ciudad"
                                    name="id_ciudad"
                                    value={formData.id_ciudad}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione una ciudad</option>
                                    {ciudades.map((ciudad) => (
                                        <option key={ciudad.id} value={ciudad.id}>
                                            {ciudad.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label htmlFor="descripcion">Descripción *</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Descripción de la ubicación"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.btnCancel} onClick={closeAllModals}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.btnSubmit}>
                                    Crear Ubicación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para editar ubicación */}
            {showEditModal && editingUbicacion && (
                <div className={styles.modalOverlay} onClick={closeAllModals}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Editar Ubicación</h2>
                            <button className={styles.btnClose} onClick={closeAllModals}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className={styles.ubicacionForm}>
                            <div className={styles.formGroup}>
                                <label>Empresa</label>
                                <div className={styles.empresaDisplay}>
                                    <strong>{empresa?.nombre || 'Cargando...'}</strong>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="edit_lugar">Lugar *</label>
                                <input
                                    type="text"
                                    id="edit_lugar"
                                    name="lugar"
                                    value={formData.lugar}
                                    onChange={handleInputChange}
                                    placeholder="Nombre del lugar"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="edit_direccion">Dirección *</label>
                                <input
                                    type="text"
                                    id="edit_direccion"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleInputChange}
                                    placeholder="Dirección completa"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="edit_capacidad">Capacidad *</label>
                                <input
                                    type="number"
                                    id="edit_capacidad"
                                    name="capacidad"
                                    value={formData.capacidad}
                                    onChange={handleInputChange}
                                    placeholder="Capacidad de personas"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="edit_id_ciudad">Ciudad *</label>
                                <select
                                    id="edit_id_ciudad"
                                    name="id_ciudad"
                                    value={formData.id_ciudad}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione una ciudad</option>
                                    {ciudades.map((ciudad) => (
                                        <option key={ciudad.id} value={ciudad.id}>
                                            {ciudad.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label htmlFor="edit_descripcion">Descripción *</label>
                                <textarea
                                    id="edit_descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Descripción de la ubicación"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.btnCancel} onClick={closeAllModals}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.btnSubmit}>
                                    Actualizar Ubicación
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && deletingUbicacion && (
                <div className={styles.modalOverlay} onClick={closeAllModals}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Confirmar Eliminación</h2>
                            <button className={styles.btnClose} onClick={closeAllModals}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.confirmDeleteContent}>
                            <p>
                                ¿Está seguro de que desea eliminar la ubicación <strong>"{deletingUbicacion.lugar}"</strong>?
                            </p>
                            <p className={styles.warningText}>
                                Esta acción no se puede deshacer.
                            </p>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.btnCancel}
                                    onClick={closeAllModals}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.btnSubmit} ${styles.btnDeleteConfirm}`}
                                    onClick={handleDeleteConfirm}
                                >
                                    Eliminar Ubicación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ubicaciones;