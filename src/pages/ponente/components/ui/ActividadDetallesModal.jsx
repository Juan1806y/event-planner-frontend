import { useEffect, useState } from 'react';
import styles from '../styles/EventModal.module.css';

const ActividadDetallesModal = ({ actividadSeleccionada, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detalleEvento, setDetalleEvento] = useState(null);
    const [actividadInfo, setActividadInfo] = useState(null);

    useEffect(() => {
        const cargarDetalles = async () => {
            if (!actividadSeleccionada) return;

            try {
                setLoading(true);
                setError(null);

                // Obtener el token y el ponenteId
                const token = localStorage.getItem('access_token');
                const API_BASE = (window.__env && window.__env.REACT_APP_API_URL) || 'http://localhost:3000';

                // Extraer el ponenteId del usuario
                const userStr = localStorage.getItem('user');
                let ponenteId = null;

                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        ponenteId = user?.rolData?.id_ponente || user?.id_ponente;
                    } catch (e) {
                        console.error('Error parsing user:', e);
                    }
                }

                if (!ponenteId) {
                    throw new Error('No se pudo identificar al ponente');
                }

                console.log('Actividad seleccionada:', actividadSeleccionada);
                console.log('Ponente ID:', ponenteId);

                // OPCIÓN 1: Si la actividad ya tiene datos del evento
                if (actividadSeleccionada.evento) {
                    console.log('Usando datos existentes del evento:', actividadSeleccionada.evento);
                    setDetalleEvento(actividadSeleccionada.evento);
                    setActividadInfo(actividadSeleccionada.actividad || actividadSeleccionada);
                    setLoading(false);
                    return;
                }

                // OPCIÓN 2: Si necesitamos buscar el evento por separado
                // Primero, obtener todas las asignaciones del ponente
                console.log('Buscando detalles del evento para la actividad...');
                const response = await fetch(`${API_BASE}/api/ponente-actividad/ponente/${ponenteId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status} al obtener asignaciones`);
                }

                const result = await response.json();

                if (!result.success || !Array.isArray(result.data)) {
                    throw new Error('Formato de respuesta inválido');
                }

                // Buscar la asignación que corresponde a la actividad seleccionada
                // IMPORTANTE: Dependiendo de cómo se estructura actividadSeleccionada
                const actividadId = actividadSeleccionada.id_actividad || actividadSeleccionada.id;

                console.log('Buscando actividad con ID:', actividadId);
                console.log('Total de asignaciones:', result.data.length);

                const asignacionEncontrada = result.data.find(asignacion => {
                    // Verificar diferentes formas en que podría venir el ID
                    const idActividadAsignacion = asignacion.id_actividad ||
                        asignacion.actividad?.id_actividad ||
                        asignacion.actividad?.id;

                    console.log('Comparando:', {
                        buscado: actividadId,
                        encontrado: idActividadAsignacion,
                        asignacion: asignacion
                    });

                    return idActividadAsignacion && parseInt(idActividadAsignacion) === parseInt(actividadId);
                });

                console.log('Asignación encontrada:', asignacionEncontrada);

                if (asignacionEncontrada) {
                    // Extraer información del evento
                    if (asignacionEncontrada.actividad?.evento) {
                        setDetalleEvento(asignacionEncontrada.actividad.evento);
                        setActividadInfo(asignacionEncontrada.actividad);
                    } else if (asignacionEncontrada.evento) {
                        setDetalleEvento(asignacionEncontrada.evento);
                        setActividadInfo(asignacionEncontrada.actividad || asignacionEncontrada);
                    } else {
                        throw new Error('No se encontró información del evento para esta actividad');
                    }
                } else {
                    throw new Error('No se encontró la asignación para esta actividad');
                }

            } catch (err) {
                console.error('Error cargando detalles del evento:', err);
                setError(err.message || 'Error cargando detalles del evento');
            } finally {
                setLoading(false);
            }
        };

        cargarDetalles();
    }, [actividadSeleccionada]);

    const formatFecha = (fechaString) => {
        if (!fechaString) return 'No definida';
        try {
            const fecha = new Date(fechaString);
            return fecha.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return fechaString || 'Fecha inválida';
        }
    };

    const formatHora = (horaString) => {
        if (!horaString) return '';
        if (horaString.includes(':')) {
            return horaString.substring(0, 5);
        }
        return horaString;
    };

    const handleRetry = () => {
        setError(null);
        // Recargar los datos
        const cargarDetalles = async () => {
            // Misma lógica del useEffect...
        };
    };

    if (!actividadSeleccionada && !loading && !error) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                    <div className={styles.modalHeader}>
                        <h2>Detalles del Evento</h2>
                        <button className={styles.closeButton} onClick={onClose}>×</button>
                    </div>
                    <div className={styles.modalBody}>
                        <p>No hay actividad seleccionada.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <div>
                        <h2>Información del Evento</h2>
                        {actividadInfo && (
                            <p className={styles.subtitulo}>
                                Actividad: <strong>{actividadInfo.titulo || 'Sin título'}</strong>
                            </p>
                        )}
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.modalBody}>
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <p>Cargando información del evento...</p>
                            <div className={styles.loadingSpinner}></div>
                        </div>
                    )}

                    {error && (
                        <div className={styles.errorContainer}>
                            <h3>Error</h3>
                            <p>{error}</p>
                            <div className={styles.errorActions}>
                                <button onClick={handleRetry} className={styles.retryButton}>
                                    Reintentar
                                </button>
                                <button onClick={onClose} className={styles.closeErrorButton}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {detalleEvento && !loading && !error && (
                        <div className={styles.eventInfoGrid}>
                            {/* Información Principal del Evento */}
                            <div className={styles.infoSection}>
                                <h3>{detalleEvento.titulo || 'Evento sin título'}</h3>
                                <div className={styles.infoItem}>
                                    <label>Descripción</label>
                                    <p className={styles.eventoDescripcion}>
                                        {detalleEvento.descripcion || 'No hay descripción disponible'}
                                    </p>
                                </div>
                            </div>

                            {/* Fechas del Evento */}
                            <div className={styles.infoSection}>
                                <h4>Fechas del Evento</h4>
                                <div className={styles.infoItem}>
                                    <label>Inicio</label>
                                    <span className={styles.fechaTexto}>
                                        {formatFecha(detalleEvento.fecha_inicio)}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Fin</label>
                                    <span className={styles.fechaTexto}>
                                        {formatFecha(detalleEvento.fecha_fin)}
                                    </span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Duración Total</label>
                                    <span className={styles.duracionEvento}>
                                        {detalleEvento.fecha_inicio && detalleEvento.fecha_fin ?
                                            calcularDiasDuracion(detalleEvento.fecha_inicio, detalleEvento.fecha_fin) :
                                            'No definida'}
                                    </span>
                                </div>
                            </div>

                            {/* Información de la Actividad */}
                            {actividadInfo && (
                                <div className={styles.infoSection}>
                                    <h4>Información de tu Actividad</h4>
                                    <div className={styles.infoItem}>
                                        <label>Título de la Actividad</label>
                                        <p className={styles.actividadTitulo}>
                                            {actividadInfo.titulo || 'Sin título'}
                                        </p>
                                    </div>
                                    {actividadInfo.descripcion && (
                                        <div className={styles.infoItem}>
                                            <label>Descripción</label>
                                            <p className={styles.actividadDescripcion}>
                                                {actividadInfo.descripcion}
                                            </p>
                                        </div>
                                    )}
                                    {actividadInfo.fecha_actividad && (
                                        <div className={styles.infoItem}>
                                            <label>Fecha de la Actividad</label>
                                            <span>{formatFecha(actividadInfo.fecha_actividad)}</span>
                                        </div>
                                    )}
                                    {actividadInfo.hora_inicio && actividadInfo.hora_fin && (
                                        <div className={styles.infoItem}>
                                            <label>Horario</label>
                                            <span className={styles.horarioTexto}>
                                                {formatHora(actividadInfo.hora_inicio)} - {formatHora(actividadInfo.hora_fin)}
                                            </span>
                                        </div>
                                    )}
                                    {actividadInfo.url && (
                                        <div className={styles.infoItem}>
                                            <label>URL de la Actividad</label>
                                            <a
                                                href={actividadInfo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.urlLink}
                                            >
                                                {actividadInfo.url}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Información Adicional del Evento */}
                            <div className={styles.infoSection}>
                                <h4>Información Adicional</h4>
                                {detalleEvento.modalidad && (
                                    <div className={styles.infoItem}>
                                        <label>Modalidad</label>
                                        <span className={styles.modalidadBadge}>
                                            {detalleEvento.modalidad}
                                        </span>
                                    </div>
                                )}
                                {detalleEvento.estado && (
                                    <div className={styles.infoItem}>
                                        <label>Estado del Evento</label>
                                        <span className={styles.estadoBadge}>
                                            {detalleEvento.estado}
                                        </span>
                                    </div>
                                )}
                                {detalleEvento.ubicacion && (
                                    <div className={styles.infoItem}>
                                        <label>Ubicación</label>
                                        <span>{detalleEvento.ubicacion}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Función auxiliar para calcular duración en días
const calcularDiasDuracion = (fechaInicio, fechaFin) => {
    try {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diffTime = Math.abs(fin - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día de inicio

        return diffDays === 1 ? '1 día' : `${diffDays} días`;
    } catch (e) {
        return 'No disponible';
    }
};

export default ActividadDetallesModal;