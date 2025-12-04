import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Pencil, X, Trash2, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import styles from './lugares.module.css';
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

const Lugares = () => {
    const [lugares, setLugares] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEmpresa, setFilterEmpresa] = useState('');
    const [selectedEmpresaId, setSelectedEmpresaId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        empresaId: '',
        nombre: '',
        descripcion: '',
        id_ubicacion: ''
    });
    const [notifications, setNotifications] = useState([]);
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
    const [editingLugar, setEditingLugar] = useState(null);
    const [deletingLugar, setDeletingLugar] = useState(null);

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

    useEffect(() => {
        const loadEmpresas = async () => {
            try {
                setLoading(true);
                const token = getToken();
                await fetchEmpresas(token);
            } catch (error) {
                console.error('Error cargando datos:', error);
                showNotification('error', 'Error', 'Error al cargar los datos. Por favor, recargue la página.');
            } finally {
                setLoading(false);
            }
        };
        loadEmpresas();
    }, []);

    useEffect(() => {
        if (empresas.length > 0 && !filterEmpresa) {
            const primeraEmpresa = empresas[0];
            setFilterEmpresa(primeraEmpresa.nombre);
            setSelectedEmpresaId(primeraEmpresa.id);
            setEmpresaSeleccionada(primeraEmpresa);

            const token = getToken();
            fetchLugaresByEmpresa(primeraEmpresa.id, token);
        }
    }, [empresas]);

    const fetchLugaresByEmpresa = async (empresaId, token = null) => {
        try {
            console.log('Buscando lugares para empresa:', empresaId);
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/empresas/${empresaId}/lugares`, {
                headers: headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('No se encontraron lugares para esta empresa');
                    setLugares([]);
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('Lugares obtenidos:', result);

            if (result.success && result.data) {
                const ubicacionesEmpresa = await fetchUbicacionesByEmpresa(empresaId, token);
                console.log('Ubicaciones para enriquecer:', ubicacionesEmpresa);

                const lugaresConUbicaciones = result.data.map(lugar => {
                    const ubicacion = Array.isArray(ubicacionesEmpresa)
                        ? ubicacionesEmpresa.find(u => u.id === lugar.id_ubicacion)
                        : null;
                    return {
                        ...lugar,
                        ubicacion_nombre: ubicacion ? `${ubicacion.lugar} - ${ubicacion.direccion}` : 'Sin ubicación',
                        ubicacion_data: ubicacion
                    };
                });
                setLugares(lugaresConUbicaciones);
            } else {
                console.log('No hay datos de lugares en la respuesta');
                setLugares([]);
            }
        } catch (error) {
            console.error('Error al obtener lugares:', error);
            setLugares([]);
            showNotification('error', 'Error', 'Error al cargar los lugares de la empresa.');
        }
    };

    const fetchEmpresas = async (token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/empresas`, {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('Empresas obtenidas:', result);

            if (result.success && result.data && result.data.length > 0) {
                setEmpresas(result.data);
                console.log('Empresas guardadas en estado:', result.data);
            } else {
                console.log('No se encontraron empresas');
                setEmpresas([]);
                showNotification('warning', 'Advertencia', 'No se encontraron empresas disponibles.');
            }
        } catch (error) {
            console.error('Error al obtener empresas:', error);
            setEmpresas([]);
            showNotification('error', 'Error', 'Error al cargar las empresas.');
        }
    };

    const fetchUbicacionesByEmpresa = async (empresaId, token = null) => {
        try {
            console.log('Buscando ubicaciones para empresa:', empresaId);
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/empresas/${empresaId}/ubicaciones`, {
                headers: headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('No se encontraron ubicaciones para esta empresa');
                    return [];
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('Ubicaciones obtenidas:', result);

            return result.success && result.data ? result.data : [];
        } catch (error) {
            console.error('Error al obtener ubicaciones por empresa:', error);
            showNotification('error', 'Error', 'Error al cargar las ubicaciones de la empresa.');
            return [];
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

            console.log('Enviando datos del lugar:', formData);

            const response = await fetch(`${API_URL}/empresas/${empresaSeleccionada.id}/lugares`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    empresaId: parseInt(formData.empresaId),
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    id_ubicacion: parseInt(formData.id_ubicacion)
                })
            });

            const result = await response.json();
            console.log('Respuesta crear lugar:', result);

            if (result.success) {
                showNotification('success', 'Éxito', 'Lugar creado exitosamente');
                closeAllModals();

                if (selectedEmpresaId) {
                    await fetchLugaresByEmpresa(selectedEmpresaId, token);
                }
            } else {
                showNotification('error', 'Error', `Error al crear lugar: ${result.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'Error', 'Error al crear lugar. Por favor, intente nuevamente.');
        }
    };

    const handleEdit = async (lugar) => {
        try {
            setEditingLugar(lugar);

            const token = getToken();
            const ubicacionesEmpresa = await fetchUbicacionesByEmpresa(lugar.empresaId || selectedEmpresaId, token);
            setUbicaciones(Array.isArray(ubicacionesEmpresa) ? ubicacionesEmpresa : []);

            setFormData({
                empresaId: lugar.empresaId || selectedEmpresaId,
                nombre: lugar.nombre || '',
                descripcion: lugar.descripcion || '',
                id_ubicacion: lugar.id_ubicacion || ''
            });

            setShowEditModal(true);
        } catch (error) {
            console.error('Error al preparar edición:', error);
            showNotification('error', 'Error', 'Error al cargar datos para editar.');
        }
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

            if (!editingLugar || !empresaSeleccionada) {
                showNotification('error', 'Error', 'No hay lugar seleccionado para editar o no se encontró la empresa');
                return;
            }

            console.log('Actualizando lugar:', formData);

            const response = await fetch(`${API_URL}/lugares/${editingLugar.id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    id_ubicacion: parseInt(formData.id_ubicacion)
                })
            });

            const result = await response.json();
            console.log('Respuesta actualizar lugar:', result);

            if (result.success) {
                showNotification('success', 'Éxito', 'Lugar actualizado exitosamente');
                closeAllModals();

                if (selectedEmpresaId) {
                    await fetchLugaresByEmpresa(selectedEmpresaId, token);
                }
            } else {
                showNotification('error', 'Error', `Error al actualizar lugar: ${result.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'Error', 'Error al actualizar lugar. Por favor, intente nuevamente.');
        }
    };

    const handleDeleteClick = (lugar) => {
        setDeletingLugar(lugar);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingLugar || !empresaSeleccionada) return;

        try {
            const token = getToken();
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('Eliminando lugar:', deletingLugar.id);

            const response = await fetch(`${API_URL}/lugares/${deletingLugar.id}`, {
                method: 'DELETE',
                headers: headers
            });

            const result = await response.json();
            console.log('Respuesta eliminar lugar:', result);

            if (result.success) {
                showNotification('success', 'Éxito', 'Lugar eliminado exitosamente');
                closeAllModals();

                if (selectedEmpresaId) {
                    await fetchLugaresByEmpresa(selectedEmpresaId, token);
                }
            } else {
                showNotification('error', 'Error', `Error al eliminar lugar: ${result.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'Error', 'Error al eliminar lugar. Por favor, intente nuevamente.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmpresaSeleccionada = (empresa) => {
        setEmpresaSeleccionada(empresa);
        setFormData(prev => ({
            ...prev,
            empresaId: empresa.id,
            id_ubicacion: ''
        }));

        const token = getToken();
        fetchUbicacionesByEmpresa(parseInt(empresa.id), token).then(ubicacionesEmpresa => {
            setUbicaciones(Array.isArray(ubicacionesEmpresa) ? ubicacionesEmpresa : []);
        });
    };

    const handleFilterChange = async (e) => {
        const selectedEmpresaNombre = e.target.value;
        setFilterEmpresa(selectedEmpresaNombre);

        if (selectedEmpresaNombre) {
            const empresaSeleccionada = empresas.find(emp => emp.nombre === selectedEmpresaNombre);
            if (empresaSeleccionada) {
                setSelectedEmpresaId(empresaSeleccionada.id);
                setEmpresaSeleccionada(empresaSeleccionada);
                const token = getToken();
                await fetchLugaresByEmpresa(empresaSeleccionada.id, token);
            }
        } else {
            setLugares([]);
            setSelectedEmpresaId('');
            setEmpresaSeleccionada(null);
        }
    };

    const closeAllModals = () => {
        setShowModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setEditingLugar(null);
        setDeletingLugar(null);
        setFormData({
            empresaId: '',
            nombre: '',
            descripcion: '',
            id_ubicacion: ''
        });
        setUbicaciones([]);
    };

    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
    };

    const filteredLugares = lugares.filter(lugar => {
        const matchesSearch = searchTerm === '' ||
            (lugar.nombre && lugar.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (lugar.descripcion && lugar.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className={styles.appContainer}>
                <Header />
                <div className={styles.mainLayout}>
                    <GerenteSidebar onToggle={handleSidebarToggle} />
                    <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingSpinner}></div>
                            <p>Cargando lugares...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                    <div className={styles.lugaresContainer}>
                        <div className={styles.lugaresHeader}>
                            <div className={styles.headerInfo}>
                                <h1>Lugares</h1>
                            </div>
                            <button
                                className={styles.btnCreate}
                                onClick={() => {
                                    if (empresas.length === 0) {
                                        showNotification('warning', 'Advertencia', 'No hay empresas disponibles para crear lugares.');
                                        return;
                                    }
                                    if (!empresaSeleccionada) {
                                        showNotification('warning', 'Seleccione empresa', 'Primero seleccione una empresa del filtro.');
                                        return;
                                    }
                                    handleEmpresaSeleccionada(empresaSeleccionada);
                                    setShowModal(true);
                                }}
                                disabled={empresas.length === 0 || !empresaSeleccionada}
                            >
                                <Plus size={20} />
                                Crear Lugar
                            </button>
                        </div>

                        <div className={styles.lugaresContent}>
                            <h2>Listado de Lugares</h2>

                            <div className={styles.filtersRow}>
                                <div className={styles.searchBox}>
                                    <Search size={20} className={styles.searchIcon} />
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
                                <table className={styles.lugaresTable}>
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Descripción</th>
                                            <th>Ubicación</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLugares.length === 0 ? (
                                            <tr>
                                            </tr>
                                        ) : (
                                            filteredLugares.map((lugar) => (
                                                <tr key={lugar.id}>
                                                    <td>{lugar.nombre || 'Sin nombre'}</td>
                                                    <td>{lugar.descripcion || 'Sin descripción'}</td>
                                                    <td>{lugar.ubicacion_nombre || 'Sin ubicación'}</td>
                                                    <td className={styles.actionsCell}>
                                                        <button
                                                            className={styles.btnIcon}
                                                            title="Editar"
                                                            onClick={() => handleEdit(lugar)}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            className={`${styles.btnIcon} ${styles.btnDelete}`}
                                                            title="Eliminar"
                                                            onClick={() => handleDeleteClick(lugar)}
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

            {/* Modal para crear lugar */}
            {showModal && empresaSeleccionada && (
                <div className={styles.modalOverlay} onClick={closeAllModals}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Crear Nuevo Lugar</h2>
                            <button className={styles.btnClose} onClick={closeAllModals}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.lugarForm}>
                            <div className={styles.formGroup}>
                                <label>Empresa</label>
                                <div className={styles.empresaDisplay}>
                                    <strong>{empresaSeleccionada.nombre}</strong>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="id_ubicacion">Ubicación *</label>
                                <select
                                    id="id_ubicacion"
                                    name="id_ubicacion"
                                    value={formData.id_ubicacion}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.formSelect}
                                >
                                    <option value="">
                                        {Array.isArray(ubicaciones) && ubicaciones.length > 0
                                            ? 'Seleccione una ubicación'
                                            : 'Cargando ubicaciones...'
                                        }
                                    </option>
                                    {Array.isArray(ubicaciones) && ubicaciones.map((ubicacion) => (
                                        <option key={ubicacion.id} value={ubicacion.id}>
                                            {ubicacion.lugar} - {ubicacion.direccion} {ubicacion.ciudad_nombre ? `(${ubicacion.ciudad_nombre})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className={styles.helpText}>
                                    Seleccione una de las ubicaciones disponibles para {empresaSeleccionada.nombre}
                                </p>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="nombre">Nombre del Lugar *</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.formInput}
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label htmlFor="descripcion">Descripción *</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    rows="4"
                                    required
                                    className={styles.formTextarea}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.btnCancel}
                                    onClick={closeAllModals}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnSubmit}
                                    disabled={!formData.id_ubicacion || !formData.nombre || !formData.descripcion}
                                >
                                    Crear Lugar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para editar lugar */}
            {showEditModal && editingLugar && empresaSeleccionada && (
                <div className={styles.modalOverlay} onClick={closeAllModals}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Editar Lugar</h2>
                            <button className={styles.btnClose} onClick={closeAllModals}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className={styles.lugarForm}>
                            <div className={styles.formGroup}>
                                <label>Empresa</label>
                                <div className={styles.empresaDisplay}>
                                    <strong>{empresaSeleccionada.nombre}</strong>
                                </div>
                                <p className={styles.helpText}>
                                    La empresa no se puede modificar al editar un lugar
                                </p>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="edit_id_ubicacion">Ubicación *</label>
                                <select
                                    id="edit_id_ubicacion"
                                    name="id_ubicacion"
                                    value={formData.id_ubicacion}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.formSelect}
                                >
                                    <option value="">Seleccione una ubicación</option>
                                    {Array.isArray(ubicaciones) && ubicaciones.map((ubicacion) => (
                                        <option key={ubicacion.id} value={ubicacion.id}>
                                            {ubicacion.lugar} - {ubicacion.direccion} {ubicacion.ciudad_nombre ? `(${ubicacion.ciudad_nombre})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="edit_nombre">Nombre del Lugar *</label>
                                <input
                                    type="text"
                                    id="edit_nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                    className={styles.formInput}
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label htmlFor="edit_descripcion">Descripción *</label>
                                <textarea
                                    id="edit_descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    rows="4"
                                    required
                                    className={styles.formTextarea}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.btnCancel}
                                    onClick={closeAllModals}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnSubmit}
                                    disabled={!formData.id_ubicacion || !formData.nombre || !formData.descripcion}
                                >
                                    Actualizar Lugar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {showDeleteModal && deletingLugar && (
                <div className={styles.modalOverlay} onClick={closeAllModals}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Confirmar Eliminación</h2>
                            <button className={styles.btnClose} onClick={closeAllModals}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.confirmDeleteContent}>
                            <div className={styles.warningIcon}>
                                <Trash2 size={48} className={styles.warningIcon} />
                            </div>
                            <p>
                                ¿Está seguro de que desea eliminar el lugar <strong>"{deletingLugar.nombre}"</strong>?
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
                                    Eliminar Lugar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lugares;