import { useEffect, useState } from 'react';
import styles from '../styles/EventModal.module.css';

const ActividadDetallesModal = ({ actividadId, eventoId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detalle, setDetalle] = useState(null);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('access_token');
                const API_BASE = (window.__env && window.__env.REACT_APP_API_URL) || 'http://localhost:3000';

                // Usar la ruta correcta que incluye lugares
                const res = await fetch(`${API_BASE}/api/eventos/${eventoId}/actividades`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `Error ${res.status}`);
                }

                const json = await res.json();

                if (json.success && json.data) {
                    // Buscar la actividad específica dentro del array de actividades
                    const actividadEncontrada = json.data.find(actividad =>
                        actividad.id_actividad === parseInt(actividadId)
                    );

                    if (actividadEncontrada) {
                        setDetalle(actividadEncontrada);
                    } else {
                        throw new Error('No se encontró la actividad especificada');
                    }
                } else {
                    throw new Error('No se pudo obtener la información de las actividades');
                }
            } catch (err) {
                console.error('Error cargando detalle de actividad:', err);
                setError(err.message || 'Error cargando detalle');
            } finally {
                setLoading(false);
            }
        };

        if (actividadId && eventoId) {
            fetchDetalle();
        }
    }, [actividadId, eventoId]);

    // Función para formatear la fecha
    const formatFecha = (fechaString) => {
        if (!fechaString) return 'No definida';
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Función para formatear hora
    const formatHora = (horaString) => {
        if (!horaString) return '';
        return horaString.substring(0, 5);
    };

    // Calcular duración
    const calcularDuracion = (horaInicio, horaFin) => {
        if (!horaInicio || !horaFin) return 'No disponible';

        const inicio = new Date(`2000-01-01T${horaInicio}`);
        const fin = new Date(`2000-01-01T${horaFin}`);
        const diffMs = fin - inicio;
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;

        if (hours > 0) {
            return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
        }
        return `${minutes} minutos`;
    };

    return (
        <div className={styles.modalOverlay} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div className={styles.modal} style={{
                background: 'white',
                borderRadius: '16px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
                <div className={styles.modalHeader}>
                    <div>
                        <h2>Detalles de la Actividad</h2>
                        <p className={styles.eventSubtitle}>Información completa de la actividad</p>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: 'white',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            transition: 'background 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {loading && (
                        <div style={{
                            padding: '60px 20px',
                            textAlign: 'center',
                            color: '#64748b'
                        }}>
                            <p>Cargando detalles de la actividad...</p>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '40px 20px',
                            textAlign: 'center',
                            background: '#fef2f2',
                            margin: '20px',
                            borderRadius: '8px',
                            border: '1px solid #fecaca'
                        }}>
                            <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error</h3>
                            <p style={{ color: '#991b1b' }}>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    marginTop: '12px',
                                    padding: '8px 16px',
                                    background: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {detalle && (
                        <div className={styles.eventInfoGrid}>
                            {/* Información Principal */}
                            <div className={styles.infoSection}>
                                <h4>Información Principal</h4>
                                <div className={styles.infoItem}>
                                    <label>ID de Actividad</label>
                                    <span style={{
                                        background: '#f0f7ff',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontFamily: 'monospace',
                                        color: '#2C5F7C',
                                        fontWeight: '600'
                                    }}>
                                        #{detalle.id_actividad}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Título</label>
                                    <p className={styles.eventTitle}>
                                        {detalle.titulo || 'Sin título'}
                                    </p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Descripción</label>
                                    <p className={styles.eventDescription}>
                                        {detalle.descripcion || 'No hay descripción disponible'}
                                    </p>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>ID del Evento</label>
                                    <span style={{
                                        background: '#f0f9ff',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontFamily: 'monospace',
                                        fontWeight: '600'
                                    }}>
                                        #{detalle.id_evento}
                                    </span>
                                </div>
                            </div>

                            {/* Fechas y Horarios */}
                            <div className={styles.infoSection}>
                                <h4>Fechas y Horarios</h4>
                                <div className={styles.infoItem}>
                                    <label>Fecha</label>
                                    <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                        {formatFecha(detalle.fecha_actividad)}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Horario</label>
                                    <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                        {detalle.hora_inicio && detalle.hora_fin
                                            ? `${formatHora(detalle.hora_inicio)} - ${formatHora(detalle.hora_fin)}`
                                            : 'No definido'
                                        }
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Duración</label>
                                    <span style={{
                                        fontWeight: '500',
                                        color: '#4b5563',
                                        background: '#f0fdf4',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid #bbf7d0'
                                    }}>
                                        {calcularDuracion(detalle.hora_inicio, detalle.hora_fin)}
                                    </span>
                                </div>
                            </div>

                            {/* Lugares */}
                            <div className={styles.infoSection}>
                                <h4>Ubicaciones</h4>
                                {detalle.lugares && detalle.lugares.length > 0 ? (
                                    detalle.lugares.map((lugar, index) => (
                                        <div key={lugar.id || index} className={styles.infoItem}>
                                            <label>Lugar {detalle.lugares.length > 1 ? index + 1 : ''}</label>
                                            <div style={{
                                                background: '#f8fafc',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#1e293b',
                                                    marginBottom: '4px'
                                                }}>
                                                    {lugar.nombre}
                                                </div>
                                                {lugar.descripcion && (
                                                    <div style={{
                                                        color: '#64748b',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {lugar.descripcion}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.infoItem}>
                                        <label>Ubicación</label>
                                        <span style={{
                                            color: '#9ca3af',
                                            fontStyle: 'italic',
                                            background: '#f8fafc',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            display: 'inline-block'
                                        }}>
                                            No hay lugares asignados
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Información Adicional */}
                            <div className={styles.infoSection}>
                                <h4>Información Adicional</h4>
                                <div className={styles.infoItem}>
                                    <label>URL de Recursos</label>
                                    <span>
                                        {detalle.url ? (
                                            <a
                                                href={detalle.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#2C5F7C',
                                                    textDecoration: 'underline',
                                                    wordBreak: 'break-all',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {detalle.url}
                                            </a>
                                        ) : (
                                            <span style={{
                                                color: '#9ca3af',
                                                fontStyle: 'italic',
                                                background: '#f8fafc',
                                                padding: '6px 10px',
                                                borderRadius: '4px',
                                                display: 'inline-block'
                                            }}>
                                                No hay URL disponible
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Estado</label>
                                    <span className={`${styles.statusBadge} ${styles.statusAvailable}`}>
                                        Activa
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Fecha Técnica</label>
                                    <span style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        background: '#f8fafc',
                                        padding: '4px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        {detalle.fecha_actividad}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.modalActions}>
                    <button
                        className={styles.btnClose}
                        onClick={onClose}
                    >
                        Cerrar Detalles
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActividadDetallesModal;