import React from 'react';
import styles from '../../styles/eventosPage.module.css';

const EventDetailsModal = ({
    evento,
    onClose,
    formatFecha,
    formatHora,
    getLugarTexto,
    getEstadoEvento
}) => {
    const estado = getEstadoEvento(evento);
    const fechaInicio = formatFecha(evento.fecha_inicio || evento.fecha);
    const hora = formatHora(evento.hora);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Detalles del Evento</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.eventHeaderModal}>
                        <h3>{evento.titulo || evento.nombre || 'Evento sin título'}</h3>
                        <span className={`${styles.eventStatus} ${styles[estado.clase]}`}>
                            {estado.texto}
                        </span>
                    </div>

                    <div className={styles.eventInfoGrid}>
                        <div className={styles.infoSection}>
                            <h4>Información General</h4>
                            <div className={styles.infoItem}>
                                <label>Modalidad:</label>
                                <span>{evento.modalidad || 'Presencial'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Categoría:</label>
                                <span>{evento.categoria || 'General'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Estado:</label>
                                <span className={`${styles.eventStatus} ${styles[estado.clase]}`}>
                                    {estado.texto}
                                </span>
                            </div>
                        </div>

                        <div className={styles.infoSection}>
                            <h4>Fecha y Ubicación</h4>
                            <div className={styles.infoItem}>
                                <label>Fecha:</label>
                                <span>{fechaInicio}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Hora:</label>
                                <span>{hora || 'Por definir'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Ubicación:</label>
                                <span>{getLugarTexto(evento)}</span>
                            </div>
                        </div>

                        <div className={styles.infoSection}>
                            <h4>Capacidad</h4>
                            <div className={styles.infoItem}>
                                <label>Cupos disponibles:</label>
                                <span>{evento.cupos_disponibles || evento.cupo_disponible || 0} / {evento.cupos || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Porcentaje de ocupación:</label>
                                <span>{estado.porcentaje}%</span>
                            </div>
                            {evento.creador && (
                                <div className={styles.infoItem}>
                                    <label>Organizador:</label>
                                    <span>{evento.creador}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {evento.descripcion && evento.descripcion !== 'null' && (
                        <div className={styles.infoSection}>
                            <h4>Descripción</h4>
                            <div className={styles.infoItem}>
                                <p>{evento.descripcion}</p>
                            </div>
                        </div>
                    )}

                    {evento.observaciones && evento.observaciones !== 'null' && (
                        <div className={styles.infoSection}>
                            <h4>Observaciones</h4>
                            <div className={styles.infoItem}>
                                <p>{evento.observaciones}</p>
                            </div>
                        </div>
                    )}

                    <div className={styles.modalActions}>
                        <button className={styles.btnCancel} onClick={onClose}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;