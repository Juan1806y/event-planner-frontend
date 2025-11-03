import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Pencil, X } from 'lucide-react';
import styles from './ubicaciones.module.css';
import Header from '../../layouts/Header/header';
import GerenteSidebar from '../gerente/GerenteSidebar';

const Ubicaciones = () => {
    const [ubicaciones, setUbicaciones] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEmpresa, setFilterEmpresa] = useState('Mostrar todas');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        empresaId: '',
        lugar: '',
        direccion: '',
        capacidad: '',
        descripcion: '',
        id_ciudad: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

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
            await Promise.all([
                fetchEmpresas(token),
                fetchCiudades(token)
            ]);

            if (empresas.length > 0) {
                await fetchUbicacionesByEmpresa(empresas[0].id, token);
                setFilterEmpresa(empresas[0].nombre);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUbicacionesByEmpresa = async (empresaId, token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`http://localhost:3000/api/ubicaciones/${empresaId}`, {
                headers: headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setUbicaciones([]);
                    return;
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                const ubicacionesConCiudades = result.data.map(ubicacion => {
                    let ciudadNombre = 'Sin ciudad';

                   if (Array.isArray(ubicacion.ciudad) && ubicacion.ciudad.length > 0) {
                        ciudadNombre = ubicacion.ciudad[0].nombre;
                    } else if (ubicacion.ciudad && typeof ubicacion.ciudad === 'object' && ubicacion.ciudad.nombre) {
                        ciudadNombre = ubicacion.ciudad.nombre;
                    }else if (ubicacion.ciudad_nombre) {
                        ciudadNombre = ubicacion.ciudad_nombre;
                    }

                    return {
                        ...ubicacion,
                        ciudad_nombre: ciudadNombre
                    };
                });

                setUbicaciones(ubicacionesConCiudades);
            }
        } catch (error) {
            console.error('Error al obtener ubicaciones:', error);
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

                const response = await fetch('http://localhost:3000/api/empresas', {
                    headers: headers
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    setEmpresas(result.data);
                }
            } catch (error) {
                console.error('Error al obtener empresas:', error);
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

                const response = await fetch('http://localhost:3000/api/ciudades', {
                    headers: headers
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();
                if (result.success) {
                    setCiudades(result.data);
                }
            } catch (error) {
                console.error('Error al obtener ciudades:', error);
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

                const response = await fetch('http://localhost:3000/api/ubicaciones', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        empresaId: parseInt(formData.empresaId),
                        lugar: formData.lugar,
                        direccion: formData.direccion,
                        capacidad: parseInt(formData.capacidad),
                        descripcion: formData.descripcion,
                        id_ciudad: parseInt(formData.id_ciudad)
                    })
                });

                const result = await response.json();

                if (result.success) {
                    alert('Ubicación creada exitosamente');
                    setShowModal(false);
                    setFormData({
                        empresaId: '',
                        lugar: '',
                        direccion: '',
                        capacidad: '',
                        descripcion: '',
                        id_ciudad: ''
                    });

                    if (formData.empresaId) {
                        await fetchUbicacionesByEmpresa(parseInt(formData.empresaId), token);
                    }
                } else {
                    alert('Error al crear ubicación: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al crear ubicación');
            }
        };

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const handleFilterChange = async (e) => {
            const selectedEmpresa = e.target.value;
            setFilterEmpresa(selectedEmpresa);

            if (selectedEmpresa !== 'Mostrar todas') {
                const empresaSeleccionada = empresas.find(emp => emp.nombre === selectedEmpresa);
                if (empresaSeleccionada) {
                    const token = getToken();
                    await fetchUbicacionesByEmpresa(empresaSeleccionada.id, token);
                }
            }
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
                <div className={styles.mainLayout}>
                    <GerenteSidebar onToggle={handleSidebarToggle} />
                    <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
                        <div className={styles.ubicacionesContainer}>
                            <div className={styles.ubicacionesHeader}>
                                <h1>Ubicaciones</h1>
                                <button className={styles.btnCreate} onClick={() => setShowModal(true)}>
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

                                    <div className={styles.filterGroup}>
                                        <label>Filtrar por empresa:</label>
                                        <select
                                            value={filterEmpresa}
                                            onChange={handleFilterChange}
                                        >
                                            <option value="Mostrar todas">Seleccione una empresa</option>
                                            {empresas.map((empresa) => (
                                                <option key={empresa.id} value={empresa.nombre}>
                                                    {empresa.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.tableContainer}>
                                    <table className={styles.ubicacionesTable}>
                                        <thead>
                                            <tr>
                                                <th>Lugar</th>
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
                                                    <td colSpan="6" className={styles.noData}>
                                                        {filterEmpresa === 'Mostrar todas' ?
                                                            'Seleccione una empresa para ver sus ubicaciones' :
                                                            `No hay ubicaciones disponibles para ${filterEmpresa}`}
                                                    </td>
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
                                                            <button className={styles.btnIcon} title="Ver detalles">
                                                                <Eye size={18} />
                                                            </button>
                                                            <button className={styles.btnIcon} title="Editar">
                                                                <Pencil size={18} />
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

                {showModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Crear Nueva Ubicación</h2>
                                <button className={styles.btnClose} onClick={() => setShowModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.ubicacionForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="empresaId">Empresa *</label>
                                    <select
                                        id="empresaId"
                                        name="empresaId"
                                        value={formData.empresaId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Seleccione una empresa</option>
                                        {empresas.map((empresa) => (
                                            <option key={empresa.id} value={empresa.id}>
                                                {empresa.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="lugar">Lugar *</label>
                                    <input
                                        type="text"
                                        id="lugar"
                                        name="lugar"
                                        value={formData.lugar}
                                        onChange={handleInputChange}
                                        placeholder="Nombre del lugar"
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
                                    <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
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
            </div>
        );
    };

    export default Ubicaciones;