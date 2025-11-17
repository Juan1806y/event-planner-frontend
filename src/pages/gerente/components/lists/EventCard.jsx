import React from 'react';
import Calendar from '../../../../assets/calendar.png';
import Cupos from '../../../../assets/cupos.png';
import Edificio from '../../../../assets/edificio.png';
import Lugar from '../../../../assets/lugar.png';
import styles from '../../styles/eventosPage.module.css';

const EventCard = ({
    evento,
    onVerDetalles,
    formatFecha,
    formatHora,
    getLugarTexto,
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
                            {evento.titulo || evento.nombre || 'Evento sin título'}
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
                {estado.porcentaje !== undefined && (
                    <div className={styles.cuposProgress}>
                        <div className={styles.progressHeader}>
                            <span className={styles.progressLabel}>Cupos disponibles</span>
                            <span className={styles.progressPercentage}>{estado.porcentaje}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={`${styles.progressFill} ${styles['progressFill' + estado.clase.charAt(0).toUpperCase() + estado.clase.slice(1)]}`}
                                style={{ width: `${estado.porcentaje}%` }}
                            />
                        </div>
                        <span className={styles.progressText}>
                            {evento.cupos_disponibles || evento.cupo_disponible || 0} de {evento.cupos || 'N/A'} cupos disponibles
                        </span>
                    </div>
                )}

                {evento.descripcion && evento.descripcion !== 'null' && (
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
                    <DetailItem
                        icon={Lugar}
                        label="Ubicación"
                        value={getLugarTexto(evento)}
                    />
                    <DetailItem
                        icon={Cupos}
                        label="Capacidad total"
                        value={`${evento.cupos || evento.cupos_disponibles || evento.cupo_disponible || 'N/A'} cupos`}
                    />
                    {evento.creador && (
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