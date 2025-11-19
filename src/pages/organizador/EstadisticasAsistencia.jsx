import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, UserCheck, UserX, XCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from './Sidebar';
import asistenciaService from '../../components/asistenciaService';
import './estadisticas.css';

export default function EstadisticasAsistencia() {
    const [eventos, setEventos] = useState([]);
    const [selectedEventoId, setSelectedEventoId] = useState(null);
    const [estadisticas, setEstadisticas] = useState({
        totalInscritos: 0,
        confirmados: 0,
        cancelaciones: 0,
        porcentajeAsistencia: 0,
        distribucion: [],
        asistenciaPorActividad: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => { cargarEventos(); }, []);
    useEffect(() => { if (selectedEventoId) cargarEstadisticas(selectedEventoId); }, [selectedEventoId]);

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
        } catch {
            setError('No se pudo cargar la lista de eventos.');
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async (idEvento) => {
        setLoading(true);
        setError(null);

        try {
            const response = await asistenciaService.obtenerAsistenciasEvento(idEvento);
            const info = response.data || {};
            const lista = info.inscripciones || [];

            const totalInscritos = lista.length;
            const confirmados = lista.filter(i =>
                i.estado?.toLowerCase() === 'confirmado' ||
                i.estado?.toLowerCase() === 'confirmada'
            ).length;

            const cancelaciones = lista.filter(i =>
                i.estado?.toLowerCase() === 'cancelado' ||
                i.estado?.toLowerCase() === 'ausente'
            ).length;

            const porcentajeAsistencia = totalInscritos > 0
                ? ((confirmados / totalInscritos) * 100).toFixed(1)
                : 0;

            const distribucion = [
                { name: 'Asistentes', value: confirmados, color: '#10b981' },
                { name: 'Cancelaciones', value: cancelaciones, color: '#ef4444' }
            ];

            const asistenciaPorActividad = [
                { nombre: 'Conferencia Principal', asistentes: confirmados, inscritos: totalInscritos },
                { nombre: 'Taller Sesión 1', asistentes: Math.floor(confirmados * 0.8), inscritos: Math.floor(totalInscritos * 0.85) },
                { nombre: 'Workshop Avanzado', asistentes: Math.floor(confirmados * 0.6), inscritos: Math.floor(totalInscritos * 0.7) },
                { nombre: 'Networking', asistentes: Math.floor(confirmados * 0.9), inscritos: Math.floor(totalInscritos * 0.95) }
            ];

            setEstadisticas({
                totalInscritos,
                confirmados,
                cancelaciones,
                porcentajeAsistencia,
                distribucion,
                asistenciaPorActividad
            });

        } catch {
            setError('Error al cargar estadísticas.');
        } finally {
            setLoading(false);
        }
    };

    const eventoSeleccionado = eventos.find(e =>
        String(e.id || e._id || e.codigo) === String(selectedEventoId)
    );

    if (loading) {
        return (
            <div className="layout-container">
                <Sidebar />
                <div className="main-content">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Cargando estadísticas...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">

                <div className="page-header-stats">
                    <h1 className="page-title-stats">📊 Reportes y Estadísticas</h1>
                    <p className="page-subtitle-stats">Visualiza métricas y análisis de asistencia</p>
                </div>

                <div className="evento-selector-stats">
                    <label className="evento-label">Seleccionar evento para análisis:</label>
                    <select
                        className="evento-select-stats"
                        value={selectedEventoId || ''}
                        onChange={(e) => setSelectedEventoId(e.target.value)}
                    >
                        <option value="">-- Seleccione un evento --</option>
                        {eventos.map(ev => (
                            <option
                                key={ev.id || ev._id || ev.codigo}
                                value={String(ev.id || ev._id || ev.codigo)}
                            >
                                {ev.titulo || ev.nombre || `Evento ${ev.id || ev._id}`}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="error-banner">
                        <XCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {selectedEventoId && eventoSeleccionado && (
                    <div className="evento-header">
                        <div className="evento-header-content">
                            <h2 className="evento-titulo">
                                {eventoSeleccionado.titulo || eventoSeleccionado.nombre}
                            </h2>

                            <div className="evento-meta">
                                <span className="evento-fecha">
                                    📅 {eventoSeleccionado.fecha_inicio || 'Fecha no disponible'}
                                </span>

                                {eventoSeleccionado.modalidad && (
                                    <span className="evento-modalidad badge badge-presencial">
                                        {eventoSeleccionado.modalidad}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button className="btn-export-report">📄 Exportar Reporte PDF</button>
                    </div>
                )}

                <div className="stats-cards-grid">
                    <div className="stat-card-large stat-blue">
                        <div className="stat-icon"><Users size={24} /></div>
                        <div className="stat-content">
                            <p className="stat-label-large">TOTAL INSCRITOS</p>
                            <p className="stat-value-large">{estadisticas.totalInscritos}</p>
                        </div>
                    </div>

                    <div className="stat-card-large stat-green">
                        <div className="stat-icon"><UserCheck size={24} /></div>
                        <div className="stat-content">
                            <p className="stat-label-large">ASISTENTES CONFIRMADOS</p>
                            <p className="stat-value-large">{estadisticas.confirmados}</p>
                        </div>
                    </div>

                    <div className="stat-card-large stat-red">
                        <div className="stat-icon"><UserX size={24} /></div>
                        <div className="stat-content">
                            <p className="stat-label-large">CANCELACIONES</p>
                            <p className="stat-value-large">{estadisticas.cancelaciones}</p>
                        </div>
                    </div>

                    <div className="stat-card-large stat-purple">
                        <div className="stat-icon"><TrendingUp size={24} /></div>
                        <div className="stat-content">
                            <p className="stat-label-large">% ASISTENCIA</p>
                            <p className="stat-value-large">{estadisticas.porcentajeAsistencia}%</p>
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="chart-card">
                        <h3 className="chart-title">📊 Asistencia por Actividad</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={estadisticas.asistenciaPorActividad}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="asistentes" fill="#10b981" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="inscritos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3 className="chart-title">🥧 Distribución General</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={estadisticas.distribucion}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    outerRadius={100}
                                    dataKey="value"
                                >
                                    {estadisticas.distribucion.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {estadisticas.totalInscritos === 0 && !loading && (
                    <div className="empty-state-stats">
                        <TrendingUp size={64} color="#9ca3af" />
                        <h3>No hay datos disponibles</h3>
                        <p>Selecciona un evento con inscripciones para ver las estadísticas</p>
                    </div>
                )}
            </div>
        </div>
    );
}
