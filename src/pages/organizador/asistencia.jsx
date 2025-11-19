import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Calendar, MapPin, Users, AlertCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import './asistencia.css';

// Simulación del servicio
const asistenciaService = {
    async obtenerAsistenciasEvento(idEvento) {
        // Aquí iría la llamada real al API
        const response = await fetch(`http://localhost:3000/api/asistencias/evento/${idEvento}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        if (!response.ok) throw new Error('Error al cargar asistentes');
        return response.json();
    }
};

export default function GestionAsistentes() {
    const [asistentes, setAsistentes] = useState([]);
    const [filteredAsistentes, setFilteredAsistentes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [idEvento, setIdEvento] = useState('1'); // Obtener del contexto o props

    useEffect(() => {
        cargarAsistentes();
    }, [idEvento]);

    const cargarAsistentes = async () => {
        try {
            setLoading(true);
            setError(null);

            // Simulación temporal - reemplaza con la llamada real
            const mockData = [
                {
                    id: '001',
                    nombre: 'Juan Martínez',
                    email: 'juan.martinez@email.com',
                    tipo: 'Presencial',
                    fechaRegistro: '10/01/2025',
                    estado: 'Confirmado',
                    iniciales: 'JM',
                    color: '#3b82f6'
                },
                {
                    id: '002',
                    nombre: 'María Rodríguez',
                    email: 'maria.rodriguez@email.com',
                    tipo: 'Virtual',
                    fechaRegistro: '12/01/2025',
                    estado: 'Confirmado',
                    iniciales: 'MR',
                    color: '#10b981'
                },
                {
                    id: '003',
                    nombre: 'Carlos García',
                    email: 'carlos.garcia@email.com',
                    tipo: 'Presencial',
                    fechaRegistro: '15/01/2025',
                    estado: 'Pendiente',
                    iniciales: 'CG',
                    color: '#f59e0b'
                },
                {
                    id: '004',
                    nombre: 'Ana López',
                    email: 'ana.lopez@email.com',
                    tipo: 'Presencial',
                    fechaRegistro: '18/01/2025',
                    estado: 'Confirmado',
                    iniciales: 'AL',
                    color: '#8b5cf6'
                }
            ];

            setTimeout(() => {
                setAsistentes(mockData);
                setFilteredAsistentes(mockData);
                setLoading(false);
            }, 500);

        } catch (err) {
            setError('Error al cargar los asistentes. Por favor, intenta nuevamente.');
            console.error('Error:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = asistentes;

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.id.includes(searchTerm)
            );
        }

        if (filtroEstado !== 'todos') {
            filtered = filtered.filter(a => a.estado.toLowerCase() === filtroEstado);
        }

        setFilteredAsistentes(filtered);
    }, [searchTerm, filtroEstado, asistentes]);

    const totalInscritos = asistentes.length;
    const confirmados = asistentes.filter(a => a.estado === 'Confirmado').length;
    const pendientes = asistentes.filter(a => a.estado === 'Pendiente').length;
    const ausentes = asistentes.filter(a => a.estado === 'Ausente').length;
    const capacidad = 500;

    const getEstadoBadgeClass = (estado) => {
        switch (estado.toLowerCase()) {
            case 'confirmado':
                return 'badge-confirmado';
            case 'pendiente':
                return 'badge-pendiente';
            case 'ausente':
                return 'badge-ausente';
            default:
                return 'badge-default';
        }
    };

    const exportarExcel = () => {
        const csv = [
            ['ID', 'Nombre', 'Email', 'Tipo', 'Fecha Registro', 'Estado'].join(','),
            ...filteredAsistentes.map(a =>
                [a.id, a.nombre, a.email, a.tipo, a.fechaRegistro, a.estado].join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistentes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="layout-container">
                <Sidebar />
                <div className="main-content">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Cargando asistentes...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="layout-container">
                <Sidebar />
                <div className="main-content">
                    <div className="error-container">
                        <AlertCircle size={48} />
                        <h3>Error al cargar datos</h3>
                        <p>{error}</p>
                        <button onClick={cargarAsistentes} className="btn-primary">
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Gestión de Inscritos</h1>
                </div>

                {/* Información del Evento */}
                <div className="evento-info">
                    <h2>Conferencia Anual de Tecnología 2025</h2>
                    <div className="evento-details">
                        <div className="detail-item">
                            <Calendar size={16} />
                            <span>Fecha: 15-17 de Marzo, 2025</span>
                        </div>
                        <div className="detail-item">
                            <MapPin size={16} />
                            <span>Lugar: Centro de Convenciones Norte</span>
                        </div>
                        <div className="detail-item">
                            <Users size={16} />
                            <span>Capacidad: {capacidad} personas</span>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="stats-grid">
                    <div className="stat-card stat-blue">
                        <p className="stat-label">Total Inscritos</p>
                        <p className="stat-value">{totalInscritos}</p>
                        <p className="stat-subtitle">de {capacidad} capacidad</p>
                    </div>
                    <div className="stat-card stat-green">
                        <p className="stat-label">Confirmados</p>
                        <p className="stat-value">{confirmados}</p>
                        <p className="stat-subtitle">
                            {totalInscritos > 0 ? ((confirmados / totalInscritos) * 100).toFixed(1) : 0}% del total
                        </p>
                    </div>
                    <div className="stat-card stat-yellow">
                        <p className="stat-label">Pendientes</p>
                        <p className="stat-value">{pendientes}</p>
                        <p className="stat-subtitle">
                            {totalInscritos > 0 ? ((pendientes / totalInscritos) * 100).toFixed(1) : 0}% del total
                        </p>
                    </div>
                    <div className="stat-card stat-red">
                        <p className="stat-label">Ausentes</p>
                        <p className="stat-value">{ausentes}</p>
                        <p className="stat-subtitle">
                            {totalInscritos > 0 ? ((ausentes / totalInscritos) * 100).toFixed(1) : 0}% del total
                        </p>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="filters-container">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="filter-select"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="ausente">Ausente</option>
                    </select>
                    <button onClick={exportarExcel} className="btn-export">
                        <Download size={16} />
                        Exportar Excel
                    </button>
                </div>

                {/* Tabla de asistentes */}
                <div className="table-container">
                    <table className="asistentes-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Participante</th>
                                <th>Tipo Inscripción</th>
                                <th>Fecha Registro</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAsistentes.map((asistente) => (
                                <tr key={asistente.id}>
                                    <td>#{asistente.id}</td>
                                    <td>
                                        <div className="participante-cell">
                                            <div
                                                className="avatar"
                                                style={{ backgroundColor: asistente.color }}
                                            >
                                                {asistente.iniciales}
                                            </div>
                                            <div className="participante-info">
                                                <p className="participante-nombre">{asistente.nombre}</p>
                                                <p className="participante-email">{asistente.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{asistente.tipo}</td>
                                    <td>{asistente.fechaRegistro}</td>
                                    <td>
                                        <span className={`badge ${getEstadoBadgeClass(asistente.estado)}`}>
                                            {asistente.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-icon">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAsistentes.length === 0 && (
                    <div className="empty-state">
                        <Users size={48} />
                        <p>No se encontraron asistentes con los filtros aplicados</p>
                    </div>
                )}
            </div>
        </div>
    );
}