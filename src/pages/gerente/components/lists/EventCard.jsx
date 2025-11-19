import React from 'react';
import Calendar from '../../../../assets/calendar.png';
import Cupos from '../../../../assets/cupos.png';
import Edificio from '../../../../assets/edificio.png';
import styles from '../../styles/eventosPage.module.css';

const EventCard = ({
    evento,
    onVerDetalles,
    formatFecha,
    formatHora,
    getEstadoEvento
}) => {
    const estado = getEstadoEvento(evento);
    const fechaInicio = formatFecha(evento.fecha_inicio || evento.fecha);
    const hora = formatHora(evento.hora);

    const DetailItem = ({ icon, label, value }) => (
        <div className={styles.detailItem}>
            <span className={styles.detailIcon}>
                <img src={icon} alt={label} className={styles.iconImage} />
            </span>
            <div className={styles.detailContent}>
                <span className={styles.detailLabel}>{label}</span>
                <span className={styles.detailValue}>{value}</span>
            </div>
        </div>
    );

    return (
        <div className={styles.eventCard}>
            <div className={styles.eventCardHeader}>
                <div className={styles.eventHeader}>
                    <div className={styles.eventTitleSection}>
                        <h3 className={styles.eventTitle}>
                            {evento.titulo || 'Evento sin título'}
                        </h3>
                        <span className={styles.eventCategory}>
                            {evento.modalidad || 'Presencial'}
                        </span>
                    </div>
                    <span className={`${styles.eventStatus} ${styles[estado.clase]}`}>
                        {estado.texto}
                    </span>
                </div>
            </div>

            <div className={styles.eventCardContent}>
                {estado.tieneProgreso && (
                    <div className={styles.cuposProgress}>
                        <div className={styles.progressHeader}>
                            <span className={styles.progressLabel}>Ocupación del evento</span>
                            <span className={styles.progressPercentage}>{estado.porcentaje}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={`${styles.progressFill} ${styles['progressFill' + estado.clase.charAt(0).toUpperCase() + estado.clase.slice(1)]}`}
                                style={{ width: `${estado.porcentaje}%` }}
                            />
                        </div>
                        <span className={styles.progressText}>
                            {estado.cuposOcupados} de {estado.cuposTotales} cupos ocupados
                            ({estado.cuposDisponibles} disponibles)
                        </span>
                    </div>
                )}


                {evento.descripcion && evento.descripcion !== 'Sin descripción disponible' && (
                    <p className={styles.eventDescription}>
                        {evento.descripcion}
                    </p>
                )}

                <div className={styles.eventDetails}>
                    <DetailItem
                        icon={Calendar}
                        label="Fecha y hora"
                        value={`${fechaInicio}${hora ? ` - ${hora}` : ''}`}
                    />

                    {estado.tieneProgreso ? (
                        <>
                            <DetailItem
                                icon={Cupos}
                                label="Cupos ocupados"
                                value={`${estado.cuposOcupados} de ${estado.cuposTotales}`}
                            />
                            <DetailItem
                                icon={Cupos}
                                label="Cupos disponibles"
                                value={estado.cuposDisponibles}
                            />
                        </>
                    ) : (
                        <DetailItem
                            icon={Cupos}
                            label="Cupos"
                            value={estado.cuposTotales > 0
                                ? `${estado.cuposTotales} cupos totales`
                                : 'Sin límite'
                            }
                        />
                    )}

                    {evento.creador && evento.creador !== 'No especificado' && (
                        <DetailItem
                            icon={Edificio}
                            label="Organizador"
                            value={evento.creador}
                        />
                    )}
                </div>

                <div className={styles.eventActions}>
                    <button
                        className={styles.btnVerDetalles}
                        onClick={() => onVerDetalles(evento)}
                    >
                        Ver Detalles Completos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;