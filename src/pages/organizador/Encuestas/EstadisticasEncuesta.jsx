import React, { useState, useEffect } from 'react';
import './EstadisticasEncuesta.css';

const BASE_URL = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3000/api';

const EstadisticasEncuesta = ({ encuestaId, onCerrar }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAuthToken = () => {
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    };

    const getHeaders = () => ({
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        cargarEstadisticas();
    }, [encuestaId]);

    const cargarEstadisticas = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/encuestas/${encuestaId}/estadisticas`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error al obtener estadísticas: ${response.status}`);
            }

            const result = await response.json();
            setData(result.data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenerBadgeEstado = (estado) => {
        const badges = {
            'completada': { color: '#22c55e', texto: 'Completada' },
            'pendiente': { color: '#f59e0b', texto: 'Pendiente' },
            'enviada': { color: '#3b82f6', texto: 'Enviada' }
        };
        const badge = badges[estado] || { color: '#6b7280', texto: estado };
        return <span className="badge-estado" style={{ backgroundColor: badge.color }}>{badge.texto}</span>;
    };

    if (loading) {
        return (
            <div className="estadisticas-modal-overlay">
                <div className="estadisticas-modal">
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Cargando estadísticas...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="estadisticas-modal-overlay">
                <div className="estadisticas-modal">
                    <div className="modal-header">
                        <h2>⚠️ Error</h2>
                        <button onClick={onCerrar} className="btn-cerrar-modal">✕</button>
                    </div>
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={onCerrar} className="btn-volver-estadisticas">
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { encuesta, estadisticas, respuestas } = data;

    return (
        <div className="estadisticas-modal-overlay">
            <div className="estadisticas-modal">
                <div className="modal-header">
                    <h2>📊 Estadísticas Detalladas</h2>
                    <button onClick={onCerrar} className="btn-cerrar-modal">✕</button>
                </div>

                <div className="modal-content">
                    {/* Información de la encuesta */}
                    <div className="card-estadisticas info-encuesta">
                        <h3>{encuesta.titulo}</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <strong>Tipo:</strong>
                                <span>{encuesta.tipo_encuesta.replace('_', ' ')}</span>
                            </div>
                            <div className="info-item">
                                <strong>Momento:</strong>
                                <span>{encuesta.momento}</span>
                            </div>
                            <div className="info-item">
                                <strong>Estado:</strong>
                                {obtenerBadgeEstado(encuesta.estado)}
                            </div>
                            <div className="info-item">
                                <strong>Obligatoria:</strong>
                                <span>{encuesta.obligatoria ? 'Sí' : 'No'}</span>
                            </div>
                            <div className="info-item">
                                <strong>Fecha inicio:</strong>
                                <span>{formatearFecha(encuesta.fecha_inicio)}</span>
                            </div>
                            <div className="info-item">
                                <strong>Fecha fin:</strong>
                                <span>{formatearFecha(encuesta.fecha_fin)}</span>
                            </div>
                        </div>
                        {encuesta.descripcion && (
                            <div className="descripcion">
                                <strong>Descripción:</strong>
                                <p>{encuesta.descripcion}</p>
                            </div>
                        )}
                        {encuesta.evento && (
                            <div className="evento-info-estadisticas">
                                <strong>Evento:</strong> {encuesta.evento.titulo}
                            </div>
                        )}
                    </div>

                    {/* Estadísticas generales */}
                    <div className="estadisticas-grid-modal">
                        <div className="stat-card-modal">
                            <div className="stat-icon-modal">📊</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.total_enviadas}</h3>
                                <p>Total Enviadas</p>
                            </div>
                        </div>
                        <div className="stat-card-modal completadas">
                            <div className="stat-icon-modal">✅</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.total_completadas}</h3>
                                <p>Completadas</p>
                            </div>
                        </div>
                        <div className="stat-card-modal pendientes">
                            <div className="stat-icon-modal">⏳</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.total_pendientes}</h3>
                                <p>Pendientes</p>
                            </div>
                        </div>
                        <div className="stat-card-modal tasa">
                            <div className="stat-icon-modal">📈</div>
                            <div className="stat-content-modal">
                                <h3>{estadisticas.tasa_respuesta}</h3>
                                <p>Tasa de Respuesta</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de respuestas */}
                    <div className="card-estadisticas tabla-respuestas">
                        <h3>Detalle de Respuestas ({respuestas.length})</h3>
                        {respuestas.length === 0 ? (
                            <p className="sin-datos">No hay respuestas registradas</p>
                        ) : (
                            <div className="tabla-container-estadisticas">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Asistente</th>
                                            <th>Correo</th>
                                            <th>Estado</th>
                                            <th>Fecha Envío</th>
                                            <th>Fecha Completado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {respuestas.map((respuesta) => (
                                            <tr key={respuesta.id}>
                                                <td>{respuesta.id}</td>
                                                <td>{respuesta.asistente.nombre}</td>
                                                <td>{respuesta.asistente.correo}</td>
                                                <td>{obtenerBadgeEstado(respuesta.estado)}</td>
                                                <td>{formatearFecha(respuesta.fecha_envio)}</td>
                                                <td>{formatearFecha(respuesta.fecha_completado)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Enlaces a Google Forms */}
                    <div className="card-estadisticas enlaces-forms">
                        <h3>Enlaces</h3>
                        <div className="enlaces-grid-estadisticas">
                            <a
                                href={encuesta.url_google_form}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-link-estadisticas"
                            >
                                📝 Ver Formulario
                            </a>
                            <a
                                href={encuesta.url_respuestas || encuesta.url_google_form}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-link-estadisticas"
                            >
                                📊 Ver Respuestas en Google
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstadisticasEncuesta;