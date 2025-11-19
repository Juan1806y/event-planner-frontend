import React from 'react';
import styles from '../styles/EventoCard.module.css';
import Calendar from '../../../../assets/calendar.png';
import Cupos from '../../../../assets/cupos.png';
import Edificio from '../../../../assets/edificio.png';
import { formatRangoFechas, debugFecha } from '../../../asistente/utils/dateUtils';

const EventCard = ({ evento, estado, onViewDetails, formatFecha, formatHora }) => {

    // Debug para verificar las fechas
    React.useEffect(() => {
        console.log('📅 Debug EventCard Ponente:', evento.titulo);
        debugFecha(evento.fecha_inicio, 'Fecha inicio');
        debugFecha(evento.fecha_fin, 'Fecha fin');
    }, [evento]);

    // Usar la función corregida para mostrar el rango
    const rangoFechas = formatRangoFechas(evento.fecha_inicio, evento.fecha_fin);
    const hora = formatHora(evento.hora);

    const calcularPorcentaje = () => {
        if (!evento.cupo_total || evento.cupo_total === 0) return 0;
        return Math.round((evento.cupos_disponibles / evento.cupo_total) * 100);
    };

    const porcentaje = calcularPorcentaje();
    
    const getProgressBarClass = () => {
        if (porcentaje === 0) return styles.estadoLleno;
        if (porcentaje <= 30) return styles.estadoLleno;
        if (porcentaje <= 70) return styles.estadoAdvertencia;
        return styles.estadoDisponible;
    };

    const getStatusBadgeClass = () => {
        switch (estado.texto) {
            case 'CUPOS AGOTADOS': return styles.estadoLleno;
            case 'FINALIZADO': return styles.estadoCerrado;
            case 'POR COMENZAR': return styles.estadoPorComenzar;
            case 'EN CURSO': return styles.estadoEnCurso;
            default: return styles.estadoDisponible;
        }
    };

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
                    <span className={`${styles.eventStatus} ${getStatusBadgeClass()}`}>
                        {estado.texto}
                    </span>
                </div>
            </div>

            <div className={styles.eventCardContent}>
                {evento.cupo_total > 0 && (
                    <div className={styles.cuposProgress}>
                        <div className={styles.progressHeader}>
                            <span className={styles.progressLabel}>Cupos disponibles</span>
                            <span className={styles.progressPercentage}>
                                {porcentaje}%
                            </span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={`${styles.progressFill} ${getProgressBarClass()}`}
                                style={{ width: `${porcentaje}%` }}
                            />
                        </div>
                        <span className={styles.progressText}>
                            {evento.cupos_disponibles} de {evento.cupo_total} cupos disponibles
                        </span>
                    </div>
                )}

                {evento.descripcion && evento.descripcion !== 'Sin descripción disponible' && (
                    <p className={styles.eventDescription}>
                        {evento.descripcion}
                    </p>
                )}

                <div className={styles.eventDetails}>
                    <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>
                            <img src={Calendar} alt="Fecha" className={styles.iconImage} />
                        </span>
                        <div className={styles.detailContent}>
                            <span className={styles.detailLabel}>Fecha</span>
                            <span className={styles.detailValue}>
                                {rangoFechas}
                                {hora && ` - ${hora}`}
                            </span>
                        </div>
                    </div>

                    {evento.cupo_total > 0 && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailIcon}>
                                <img src={Cupos} alt="Cupos" className={styles.iconImage} />
                            </span>
                            <div className={styles.detailContent}>
                                <span className={styles.detailLabel}>Cupos disponibles</span>
                                <span className={styles.detailValue}>
                                    {evento.cupos_disponibles}
                                </span>
                            </div>
                        </div>
                    )}

                    {evento.empresa && (
                        <div className={styles.detailItem}>
                            <span className={styles.detailIcon}>
                                <img src={Edificio} alt="Empresa" className={styles.iconImage} />
                            </span>
                            <div className={styles.detailContent}>
                                <span className={styles.detailLabel}>Empresa</span>
                                <span className={styles.detailValue}>{evento.empresa}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* SOLO BOTÓN VER DETALLES - SIN INSCRIPCIÓN */}
                <div className={styles.eventActions}>
                    <button
                        className={styles.btnVerDetalles}
                        onClick={() => onViewDetails(evento)}
                    >
                        Ver Detalles Completos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;