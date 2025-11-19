import React from 'react';
import styles from '../../styles/eventosPage.module.css';

const EventDetailsModal = ({
    evento,
    onClose,
    formatFecha,
    formatHora,
    getEstadoEvento
}) => {
    const estado = getEstadoEvento(evento);
    const fechaInicio = formatFecha(evento.fecha_inicio || evento.fecha);
    const hora = formatHora(evento.hora);

    const getNombreCreador = () => {
        if (!evento.creador) return 'No especificado';

        if (typeof evento.creador === 'string') {
            return evento.creador;
        }

        if (typeof evento.creador === 'object' && evento.creador !== null) {
            return evento.creador.nombre || 'No especificado';
        }

        return 'No especificado';
    };

    const getNombreEmpresa = () => {
        if (!evento.empresa) return 'No especificada';

        if (typeof evento.empresa === 'string') {
            return evento.empresa;
        }

        if (typeof evento.empresa === 'object' && evento.empresa !== null) {
            return evento.empresa.nombre || 'No especificada';
        }

        return 'No especificada';
    };

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
                                <label>Organizador:</label>
                                <span>{getNombreCreador()}</span>
                            </div>
                        </div>

                        <div className={styles.infoSection}>
                            <h4>Fecha y Horario</h4>
                            <div className={styles.infoItem}>
                                <label>Fecha de inicio:</label>
                                <span>{fechaInicio}</span>
                            </div>
                            {evento.fecha_fin && (
                                <div className={styles.infoItem}>
                                    <label>Fecha de fin:</label>
                                    <span>{formatFecha(evento.fecha_fin)}</span>
                                </div>
                            )}
                            <div className={styles.infoItem}>
                                <label>Hora:</label>
                                <span>{hora || 'Por definir'}</span>
                            </div>
                        </div>

                        <div className={styles.infoSection}>
                            <h4>Capacidad y Ocupación</h4>
                            <div className={styles.infoItem}>
                                <label>Cupos totales:</label>
                                <span>{estado.cuposTotales > 0 ? estado.cuposTotales : 'Sin límite'}</span>
                            </div>
                            {estado.cuposDisponibles !== null && (
                                <div className={styles.infoItem}>
                                    <label>Cupos disponibles:</label>
                                    <span>{estado.cuposDisponibles}</span>
                                </div>
                            )}
                            {estado.cuposOcupados !== null && (
                                <div className={styles.infoItem}>
                                    <label>Cupos ocupados:</label>
                                    <span>{estado.cuposOcupados}</span>
                                </div>
                            )}
                            {estado.porcentaje > 0 && (
                                <div className={styles.infoItem}>
                                    <label>Porcentaje de ocupación:</label>
                                    <span>{estado.porcentaje}%</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.infoSection}>
                            <h4>Información Adicional</h4>
                            <div className={styles.infoItem}>
                                <label>Empresa:</label>
                                <span>{getNombreEmpresa()}</span>
                            </div>
                            {evento.fecha_creacion && (
                                <div className={styles.infoItem}>
                                    <label>Fecha de creación:</label>
                                    <span>{formatFecha(evento.fecha_creacion)}</span>
                                </div>
                            )}
                            {evento.fecha_actualizacion && (
                                <div className={styles.infoItem}>
                                    <label>Última actualización:</label>
                                    <span>{formatFecha(evento.fecha_actualizacion)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {evento.descripcion && evento.descripcion !== 'null' && evento.descripcion !== 'Sin descripción disponible' && (
                        <div className={styles.infoSection}>
                            <h4>Descripción</h4>
                            <div className={styles.infoItem}>
                                <p>{evento.descripcion}</p>
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