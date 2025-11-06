import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, MapPin, Users, FileImage, X } from 'lucide-react';
import styles from './eventos.module.css';
import Header from '../../layouts/Header/header';
import GerenteSidebar from '../gerente/GerenteSidebar';

const Eventos = () => {
    const [eventos, setEventos] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [filterTipo, setFilterTipo] = useState('todos');
    const [showCancelados, setShowCancelados] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [formData, setFormData] = useState({
        empresaId: '',
        titulo: '',
        descripcion: '',
        modalidad: 'presencial',
        hora: '',
        cupos: '',
        fecha_inicio: '',
        fecha_fin: '',
        imagen: null
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
            setLoading(true);
            const token = getToken();
            await Promise.all([
                fetchEmpresas(token),
                fetchEventos(token)
            ]);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEventos = async (token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:3000/api/eventos', {
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setEventos(result.data);
            } else {
                setEventos([]);
            }
        } catch (error) {
            console.error('Error al obtener eventos:', error);
            setEventos([]);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            
            // Crear FormData para enviar archivos
            const formDataToSend = new FormData();
            formDataToSend.append('empresaId', formData.empresaId);
            formDataToSend.append('titulo', formData.titulo);
            formDataToSend.append('descripcion', formData.descripcion);
            formDataToSend.append('modalidad', formData.modalidad);
            formDataToSend.append('hora', formData.hora);
            formDataToSend.append('cupos', formData.cupos);
            formDataToSend.append('fecha_inicio', formData.fecha_inicio);
            formDataToSend.append('fecha_fin', formData.fecha_fin);
            
            if (formData.imagen) {
                formDataToSend.append('imagen', formData.imagen);
            }

            const response = await fetch('http://localhost:3000/api/eventos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const result = await response.json();

            if (result.success) {
                alert('Evento creado exitosamente');
                setShowModal(false);
                resetForm();
                await fetchEventos(token);
            } else {
                alert('Error al crear evento: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear evento');
        }
    };

    const resetForm = () => {
        setFormData({
            empresaId: '',
            titulo: '',
            descripcion: '',
            modalidad: 'presencial',
            hora: '',
            cupos: '',
            fecha_inicio: '',
            fecha_fin: '',
            imagen: null
        });
        setImagenPreview(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                imagen: file
            }));

            // Crear preview de la imagen
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagenPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            imagen: null
        }));
        setImagenPreview(null);
    };

    const handleSidebarToggle = (collapsed) => {
        setSidebarCollapsed(collapsed);
    };

    const filteredEventos = eventos.filter(evento => {
        const matchesSearch = evento.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            evento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesEstado = filterEstado === 'todos' || 
                            (filterEstado === 'activo' && evento.estado === 1) ||
                            (filterEstado === 'inactivo' && evento.estado === 0);
        
        const matchesTipo = filterTipo === 'todos' || 
                           evento.modalidad?.toLowerCase().includes(filterTipo.toLowerCase());
        
        const matchesCancelados = showCancelados || evento.estado !== 2; // 2 = cancelado

        return matchesSearch && matchesEstado && matchesTipo && matchesCancelados;
    });

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 1: return styles.estadoActivo;
            case 0: return styles.estadoInactivo;
            case 2: return styles.estadoCancelado;
            default: return styles.estadoInactivo;
        }
    };

    const getEstadoText = (estado) => {
        switch (estado) {
            case 1: return 'Activo';
            case 0: return 'Inactivo';
            case 2: return 'Cancelado';
            default: return 'Inactivo';
        }
    };

    return (
        <div className={styles.appContainer}>
            <Header />
            <div className={styles.mainLayout}>
                <GerenteSidebar onToggle={handleSidebarToggle} />
                <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
                    <div className={styles.eventosContainer}>
                        <div className={styles.eventosHeader}>
                            <div className={styles.headerInfo}>
                                <h1>Catálogo de Eventos</h1>
                                <p>Explore todos los eventos disponibles y activos. Utilice los filtros para encontrar eventos según fecha, tipo o estado.</p>
                            </div>
                            <button className={styles.btnCreate} onClick={() => setShowModal(true)}>
                                <Plus size={20} />
                                Crear Evento
                            </button>
                        </div>

                        <div className={styles.eventosContent}>
                            <h2>Filtros de Búsqueda</h2>

                            <div className={styles.filtersRow}>
                                <div className={styles.searchBox}>
                                    <Search size={20} className={styles.searchIcon} />
                                    <input
                                        type="text"
                                        placeholder="Buscar evento..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className={styles.filterGroup}>
                                    <label>Estado</label>
                                    <select
                                        value={filterEstado}
                                        onChange={(e) => setFilterEstado(e.target.value)}
                                    >
                                        <option value="todos">Todos los estados</option>
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>

                                <div className={styles.filterGroup}>
                                    <label>Tipo</label>
                                    <select
                                        value={filterTipo}
                                        onChange={(e) => setFilterTipo(e.target.value)}
                                    >
                                        <option value="todos">Todos los tipos</option>
                                        <option value="presencial">Presencial</option>
                                        <option value="virtual">Virtual</option>
                                        <option value="hibrido">Híbrido</option>
                                    </select>
                                </div>

                                <div className={styles.checkboxGroup}>
                                    <input
                                        type="checkbox"
                                        id="showCancelados"
                                        checked={showCancelados}
                                        onChange={(e) => setShowCancelados(e.target.checked)}
                                    />
                                    <label htmlFor="showCancelados">Mostrar eventos cancelados</label>
                                </div>
                            </div>

                            <div className={styles.eventosGrid}>
                                {filteredEventos.length === 0 ? (
                                    <div className={styles.noEvents}>
                                        <p>No se encontraron eventos que coincidan con los filtros seleccionados.</p>
                                    </div>
                                ) : (
                                    filteredEventos.map((evento) => (
                                        <div key={evento.id} className={styles.eventoCard}>
                                            <div className={styles.eventoHeader}>
                                                <h3 className={styles.eventoTitulo}>{evento.titulo}</h3>
                                                <span className={`${styles.estadoBadge} ${getEstadoColor(evento.estado)}`}>
                                                    {getEstadoText(evento.estado)}
                                                </span>
                                            </div>
                                            
                                            <div className={styles.eventoInfo}>
                                                <div className={styles.infoItem}>
                                                    <Calendar size={16} />
                                                    <span>{formatDate(evento.fecha_inicio)}</span>
                                                </div>
                                                
                                                {evento.modalidad === 'presencial' && evento.ubicacion && (
                                                    <div className={styles.infoItem}>
                                                        <MapPin size={16} />
                                                        <span>{evento.ubicacion}</span>
                                                    </div>
                                                )}
                                                
                                                <div className={styles.infoItem}>
                                                    <Users size={16} />
                                                    <span>{evento.modalidad === 'presencial' ? 'Presencial' : 'Virtual'}</span>
                                                </div>
                                            </div>

                                            <p className={styles.eventoDescripcion}>
                                                {evento.descripcion}
                                            </p>

                                            <div className={styles.eventoFooter}>
                                                <div className={styles.cuposInfo}>
                                                    <span>{evento.cupos} cupos disponibles</span>
                                                </div>
                                                <button className={styles.btnVerDetalles}>
                                                    Ver detalles
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Crear Nuevo Evento</h2>
                            <button className={styles.btnClose} onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.eventoForm}>
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
                                <label htmlFor="titulo">Título del Evento *</label>
                                <input
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Conferencia Anual de Tecnología 2025"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="descripcion">Descripción *</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    placeholder="Descripción detallada del evento..."
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="modalidad">Modalidad *</label>
                                    <select
                                        id="modalidad"
                                        name="modalidad"
                                        value={formData.modalidad}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="presencial">Presencial</option>
                                        <option value="virtual">Virtual</option>
                                        <option value="hibrido">Híbrido</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="cupos">Cupos *</label>
                                    <input
                                        type="number"
                                        id="cupos"
                                        name="cupos"
                                        value={formData.cupos}
                                        onChange={handleInputChange}
                                        placeholder="Número de cupos"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="fecha_inicio">Fecha Inicio *</label>
                                    <input
                                        type="date"
                                        id="fecha_inicio"
                                        name="fecha_inicio"
                                        value={formData.fecha_inicio}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="fecha_fin">Fecha Fin *</label>
                                    <input
                                        type="date"
                                        id="fecha_fin"
                                        name="fecha_fin"
                                        value={formData.fecha_fin}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="hora">Hora *</label>
                                <input
                                    type="time"
                                    id="hora"
                                    name="hora"
                                    value={formData.hora}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="imagen">Imagen del Evento</label>
                                <div className={styles.imageUpload}>
                                    <input
                                        type="file"
                                        id="imagen"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handleImageChange}
                                        className={styles.fileInput}
                                    />
                                    <label htmlFor="imagen" className={styles.uploadButton}>
                                        <FileImage size={20} />
                                        <span>Adjuntar imagen (JPG/PNG)</span>
                                    </label>
                                    
                                    {imagenPreview && (
                                        <div className={styles.imagePreview}>
                                            <img src={imagenPreview} alt="Preview" />
                                            <button 
                                                type="button" 
                                                className={styles.removeImage}
                                                onClick={removeImage}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.btnSubmit}>
                                    Crear Evento
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Eventos;