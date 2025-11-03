import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Pencil, X } from 'lucide-react';
import styles from './lugares.module.css';
import Header from '../../layouts/Header/header';
import GerenteSidebar from '../gerente/GerenteSidebar';

const Lugares = () => {
    const [lugares, setLugares] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEmpresa, setFilterEmpresa] = useState('');
    const [selectedEmpresaId, setSelectedEmpresaId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        empresaId: '',
        nombre: '',
        descripcion: '',
        id_ubicacion: ''
    });

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

            const response = await fetch(`http://localhost:3000/api/lugares/${empresaId}`, {
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
                // Enriquecer lugares con nombres de ubicaciones
                const ubicacionesEmpresa = await fetchUbicacionesByEmpresa(empresaId, token);
                console.log('Ubicaciones para enriquecer:', ubicacionesEmpresa);
                
                const lugaresConUbicaciones = result.data.map(lugar => {
                    const ubicacion = ubicacionesEmpresa.find(u => u.id === lugar.id_ubicacion);
                    return {
                        ...lugar,
                        ubicacion_nombre: ubicacion ? `${ubicacion.lugar} - ${ubicacion.direccion}` : 'Sin ubicación'
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
            console.log('Empresas obtenidas:', result);

            if (result.success && result.data && result.data.length > 0) {
                setEmpresas(result.data);
                console.log('Empresas guardadas en estado:', result.data);
            } else {
                console.log('No se encontraron empresas');
                setEmpresas([]);
            }
        } catch (error) {
            console.error('Error al obtener empresas:', error);
            setEmpresas([]);
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

            const response = await fetch(`http://localhost:3000/api/ubicaciones/${empresaId}`, {
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

            const response = await fetch('http://localhost:3000/api/lugares', {
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
                alert('Lugar creado exitosamente');
                setShowModal(false);
                setFormData({
                    empresaId: '',
                    nombre: '',
                    descripcion: '',
                    id_ubicacion: ''
                });

                if (selectedEmpresaId) {
                    await fetchLugaresByEmpresa(selectedEmpresaId, token);
                }
            } else {
                alert('Error al crear lugar: ' + (result.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear lugar: ' + error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmpresaChange = async (e) => {
        const empresaId = e.target.value;
        setFormData(prev => ({
            ...prev,
            empresaId: empresaId,
            id_ubicacion: '' 
        }));

        if (empresaId) {
            const token = getToken();
            const ubicacionesEmpresa = await fetchUbicacionesByEmpresa(parseInt(empresaId), token);
            setUbicaciones(ubicacionesEmpresa);
        }
    };

    const handleFilterChange = async (e) => {
        const selectedEmpresaNombre = e.target.value;
        setFilterEmpresa(selectedEmpresaNombre);

        if (selectedEmpresaNombre) {
            const empresaSeleccionada = empresas.find(emp => emp.nombre === selectedEmpresaNombre);
            if (empresaSeleccionada) {
                setSelectedEmpresaId(empresaSeleccionada.id);
                const token = getToken();
                await fetchLugaresByEmpresa(empresaSeleccionada.id, token);
            }
        } else {
            setLugares([]);
            setSelectedEmpresaId('');
        }
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
            <div className={styles.mainLayout}>
                <GerenteSidebar onToggle={handleSidebarToggle} />
                <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
                    <div className={styles.lugaresContainer}>
                        <div className={styles.lugaresHeader}>
                            <h1>Lugares</h1>
                            <button 
                                className={styles.btnCreate} 
                                onClick={() => setShowModal(true)}
                                disabled={empresas.length === 0}
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

                                <div className={styles.filterGroup}>
                                    <label>Filtrar por empresa:</label>
                                    <select
                                        value={filterEmpresa}
                                        onChange={handleFilterChange}
                                        className={styles.filterSelect}
                                    >
                                        <option value="">Seleccione una empresa</option>
                                        {empresas.map((empresa) => (
                                            <option key={empresa.id} value={empresa.nombre}>
                                                {empresa.nombre}
                                            </option>
                                        ))}
                                    </select>
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
                                                <td colSpan="4" className={styles.noData}>
                                                    {!filterEmpresa 
                                                        ? 'Seleccione una empresa para ver sus lugares' 
                                                        : lugares.length === 0
                                                        ? `No hay lugares disponibles para ${filterEmpresa}`
                                                        : 'No se encontraron lugares que coincidan con la búsqueda'
                                                    }
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLugares.map((lugar) => (
                                                <tr key={lugar.id}>
                                                    <td>{lugar.nombre || 'Sin nombre'}</td>
                                                    <td>{lugar.descripcion || 'Sin descripción'}</td>
                                                    <td>{lugar.ubicacion_nombre || 'Sin ubicación'}</td>
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
                            <h2>Crear Nuevo Lugar</h2>
                            <button className={styles.btnClose} onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.lugarForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="empresaId">Empresa *</label>
                                <select
                                    id="empresaId"
                                    name="empresaId"
                                    value={formData.empresaId}
                                    onChange={handleEmpresaChange}
                                    required
                                    className={styles.formSelect}
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
                                <label htmlFor="id_ubicacion">Ubicación *</label>
                                <select
                                    id="id_ubicacion"
                                    name="id_ubicacion"
                                    value={formData.id_ubicacion}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!formData.empresaId}
                                    className={styles.formSelect}
                                >
                                    <option value="">
                                        {formData.empresaId 
                                            ? 'Seleccione una ubicación' 
                                            : 'Primero seleccione una empresa'
                                        }
                                    </option>
                                    {ubicaciones.map((ubicacion) => (
                                        <option key={ubicacion.id} value={ubicacion.id}>
                                            {ubicacion.lugar} - {ubicacion.direccion}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="nombre">Nombre del Lugar *</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Aula C - Auditorio"
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
                                    placeholder="Ej: Edificio 8003 del secundario"
                                    rows="4"
                                    required
                                    className={styles.formTextarea}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button 
                                    type="button" 
                                    className={styles.btnCancel} 
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.btnSubmit}
                                    disabled={!formData.empresaId || !formData.id_ubicacion || !formData.nombre || !formData.descripcion}
                                >
                                    Crear Lugar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lugares;