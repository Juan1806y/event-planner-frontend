import { useState, useRef, useEffect } from 'react';
import { useNotificaciones } from '../hooks/useNotificationsPages';
import styles from './NotificacionesDropdown.module.css';

const NotificacionesDropdown = ({ notificationsIcon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const {
        notificaciones,
        noLeidasCount,
        loading,
        error,
        cargarNotificaciones,
        marcarComoLeida,
        eliminarNotificacion,
        marcarTodasComoLeidas
    } = useNotificaciones();

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = async () => {
        if (!isOpen) {
            // Si vamos a abrir, cargamos las notificaciones
            try {
                await cargarNotificaciones();
            } catch (err) {
                console.error('Error cargando notificaciones:', err);
            }
        }
        setIsOpen(!isOpen);
    };

    const handleMarcarComoLeida = async (notificacionId, event) => {
        event?.stopPropagation();
        try {
            await marcarComoLeida(notificacionId);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleEliminar = async (notificacionId, event) => {
        event?.stopPropagation();
        try {
            await eliminarNotificacion(notificacionId);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            await marcarTodasComoLeidas();
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const getPrioridadClass = (prioridad) => {
        switch (prioridad) {
            case 'alta': return styles.prioridadAlta;
            case 'media': return styles.prioridadMedia;
            case 'baja': return styles.prioridadBaja;
            default: return styles.prioridadMedia;
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            {/* Botón del ícono de notificaciones */}
            <button
                className={styles.notificationButton}
                onClick={toggleDropdown}
                title="Notificaciones"
            >
                <img
                    src={notificationsIcon}
                    alt="Notificaciones"
                    className={styles.notificationIcon}
                />
                {noLeidasCount > 0 && (
                    <span className={styles.notificationBadge}>
                        {noLeidasCount > 99 ? '99+' : noLeidasCount}
                    </span>
                )}
            </button>

            {/* Dropdown de notificaciones */}
            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <h3>Notificaciones</h3>
                        {noLeidasCount > 0 && (
                            <button
                                className={styles.marcarTodasButton}
                                onClick={handleMarcarTodasLeidas}
                                disabled={loading}
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    <div className={styles.notificationsList}>
                        {loading && (
                            <div className={styles.loading}>Cargando notificaciones...</div>
                        )}

                        {error && (
                            <div className={styles.error}>
                                Error al cargar notificaciones
                                <button
                                    onClick={cargarNotificaciones}
                                    className={styles.retryButton}
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {!loading && !error && notificaciones.length === 0 && (
                            <div className={styles.emptyState}>
                                No hay notificaciones
                            </div>
                        )}

                        {!loading && !error && notificaciones.map((notificacion) => (
                            <div
                                key={notificacion.id}
                                className={`${styles.notificationItem} ${notificacion.estado === 'no_leida' ? styles.noLeida : ''
                                    }`}
                                onClick={() => handleMarcarComoLeida(notificacion.id)}
                            >
                                <div className={styles.notificationHeader}>
                                    <span className={styles.notificationTitle}>
                                        {notificacion.titulo}
                                    </span>
                                    <span className={`${styles.prioridad} ${getPrioridadClass(notificacion.prioridad)}`}>
                                        {notificacion.prioridad}
                                    </span>
                                </div>

                                <div className={styles.notificationContent}>
                                    {notificacion.contenido}
                                </div>

                                {notificacion.datosAdicionales && (
                                    <div className={styles.datosAdicionales}>
                                        <small>
                                            Evento: {notificacion.datosAdicionales.nombre_evento} •
                                            Actividad: {notificacion.datosAdicionales.nombre_actividad}
                                        </small>
                                    </div>
                                )}

                                <div className={styles.notificationFooter}>
                                    <span className={styles.notificationDate}>
                                        {formatFecha(notificacion.fechaCreacion)}
                                    </span>
                                    <div className={styles.notificationActions}>
                                        {notificacion.estado === 'no_leida' && (
                                            <button
                                                className={styles.actionButton}
                                                onClick={(e) => handleMarcarComoLeida(notificacion.id, e)}
                                                title="Marcar como leída"
                                            >
                                                ✓
                                            </button>
                                        )}
                                        <button
                                            className={`${styles.actionButton} ${styles.eliminarButton}`}
                                            onClick={(e) => handleEliminar(notificacion.id, e)}
                                            title="Eliminar"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.dropdownFooter}>
                        <span className={styles.totalNotificaciones}>
                            {notificaciones.length} notificaciones
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificacionesDropdown;