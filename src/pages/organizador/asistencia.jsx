// File: GestionAsistentes.jsx
import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Users, AlertCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import asistenciaService from '../../components/asistenciaService';
import './asistencia.css';

export default function GestionAsistentes() {
    const [eventos, setEventos] = useState([]);
    const [selectedEventoId, setSelectedEventoId] = useState(null);
    const [asistentes, setAsistentes] = useState([]);
    const [filteredAsistentes, setFilteredAsistentes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarEventos = async () => {
            setLoading(true);
            try {
                const ev = await asistenciaService.obtenerEventos();
                const lista = Array.isArray(ev) ? ev : (ev.data || []);
                setEventos(lista);

                if (lista.length > 0) {
                    setSelectedEventoId(String(lista[0].id || lista[0]._id || lista[0].id_evento));
                }
                setError(null);
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar la lista de eventos.');
            } finally {
                setLoading(false);
            }
        };

        cargarEventos();
    }, []);

    useEffect(() => {
        if (!selectedEventoId) return;
        cargarAsistentes(selectedEventoId);
    }, [selectedEventoId]);

    const cargarAsistentes = async (idEvento) => {
        setLoading(true);
        setError(null);
        try {
            const response = await asistenciaService.obtenerAsistenciasEvento(idEvento);

            const info = response.data || {};
            const lista = info.inscripciones || [];

            const normalizados = lista.map((inscripcion, idx) => {
                // Extraer datos del usuario anidado
                const usuario = inscripcion.asistente?.usuario || {};
                const nombre = usuario.nombre ||
                    inscripcion.nombre ||
                    `${inscripcion.nombres || ''} ${inscripcion.apellidos || ''}`.trim() ||
                    'Sin nombre';

                const email = usuario.correo ||
                    usuario.email ||
                    inscripcion.email ||
                    inscripcion.correo ||
                    '—';

                // Generar iniciales desde el nombre
                const iniciales = nombre.split(' ')
                    .filter(n => n.length > 0)
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || '—';

                return {
                    id: String(inscripcion.id || inscripcion._id || inscripcion.codigo || idx + 1),
                    codigo: inscripcion.codigo || '—',
                    nombre: nombre,
                    email: email,
                    cedula: usuario.cedula || '—',
                    fechaRegistro: inscripcion.fecha || inscripcion.fecha_registro || inscripcion.createdAt || '—',
                    estado: inscripcion.estado || 'Pendiente',
                    iniciales: iniciales,
                    color: inscripcion.color || generarColorAleatorio()
                };
            });

            setAsistentes(normalizados);
            setFilteredAsistentes(normalizados);

        } catch (err) {
            console.error('Error cargando asistentes:', err);
            setError('Error al cargar asistentes.');
            setAsistentes([]);
            setFilteredAsistentes([]);
        } finally {
            setLoading(false);
        }
    };

    // Función auxiliar para generar colores aleatorios para avatares
    const generarColorAleatorio = () => {
        const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
        return colores[Math.floor(Math.random() * colores.length)];
    };

    useEffect(() => {
        let filtered = asistentes;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(a =>
                a.nombre.toLowerCase().includes(term) ||
                (a.email || '').toLowerCase().includes(term) ||
                a.id.toLowerCase().includes(term) ||
                (a.cedula || '').toLowerCase().includes(term)
            );
        }

        if (filtroEstado !== 'todos') {
            filtered = filtered.filter(a => a.estado.toLowerCase() === filtroEstado.toLowerCase());
        }

        setFilteredAsistentes(filtered);
    }, [searchTerm, filtroEstado, asistentes]);

    const totalInscritos = asistentes.length;
    const confirmados = asistentes.filter(a => a.estado.toLowerCase() === 'confirmado' || a.estado.toLowerCase() === 'confirmada').length;
    const pendientes = asistentes.filter(a => a.estado.toLowerCase() === 'pendiente').length;
    const ausentes = asistentes.filter(a => a.estado.toLowerCase() === 'ausente').length;

    const getEstadoBadgeClass = (estado) => {
        const estadoNorm = estado.toLowerCase();
        if (estadoNorm === 'confirmado' || estadoNorm === 'confirmada') return 'badge-confirmado';
        if (estadoNorm === 'pendiente') return 'badge-pendiente';
        if (estadoNorm === 'ausente') return 'badge-ausente';
        return 'badge-default';
    };

    if (loading) {
        return (
            <div className="layout-container">
                <Sidebar />
                <div className="main-content">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Cargando...</p>
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

                <div className="evento-selector-card">
                    <div className="selector-header">
                        <h3 className="selector-title">Seleccionar evento</h3>
                        <p className="selector-subtitle">Elige el evento para ver los inscritos</p>
                    </div>
                    <select
                        className="evento-select"
                        value={selectedEventoId || ''}
                        onChange={(e) => setSelectedEventoId(e.target.value)}
                    >
                        <option value="">-- Seleccione un evento --</option>
                        {eventos.map(ev => (
                            <option
                                key={ev.id || ev._id || ev.codigo}
                                value={String(ev.id || ev._id || ev.codigo)}
                            >
                                {ev.titulo || ev.nombre || ev.title || `Evento ${ev.id || ev._id}`}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="error-container-inline">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {selectedEventoId && (
                    <div className="evento-info">
                        <h2>
                            {(() => {
                                const ev = eventos.find(e =>
                                    String(e.id || e._id || e.codigo) === String(selectedEventoId)
                                );
                                return ev ? (ev.titulo || ev.nombre || ev.title) : 'Evento seleccionado';
                            })()}
                        </h2>
                    </div>
                )}

                <div className="stats-grid">
                    <div className="stat-card stat-blue">
                        <p className="stat-label">Total Inscritos</p>
                        <p className="stat-value">{totalInscritos}</p>
                    </div>
                    <div className="stat-card stat-green">
                        <p className="stat-label">Confirmados</p>
                        <p className="stat-value">{confirmados}</p>
                    </div>
                    <div className="stat-card stat-yellow">
                        <p className="stat-label">Pendientes</p>
                        <p className="stat-value">{pendientes}</p>
                    </div>
                    <div className="stat-card stat-red">
                        <p className="stat-label">Ausentes</p>
                        <p className="stat-value">{ausentes}</p>
                    </div>
                </div>

                <div className="filters-container">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, cédula o ID..."
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
                        <option value="confirmada">Confirmada</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="ausente">Ausente</option>
                    </select>

                </div>

                <div className="table-container">
                    <table className="asistentes-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Participante</th>
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
                                            <div className="avatar" style={{ backgroundColor: asistente.color }}>
                                                {asistente.iniciales}
                                            </div>
                                            <div className="participante-info">
                                                <p className="participante-nombre">{asistente.nombre}</p>
                                                <p className="participante-email">{asistente.email}</p>
                                            </div>
                                        </div>
                                    </td>
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