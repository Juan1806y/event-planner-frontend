import React from 'react';
import EventCard from './EventCard';
import styles from '../../styles/eventosPage.module.css';

const EventsList = ({
    eventos,
    onVerDetalles,
    formatFecha,
    formatHora,
    getLugarTexto,
    getEstadoEvento,
    sidebarCollapsed
}) => {
    if (eventos.length === 0) {
        return (
            <div className={styles.noEventsCard}>
                <div className={styles.noEventsIcon}>📅</div>
                <h3>No hay eventos disponibles</h3>
                <p>No se encontraron eventos con los filtros aplicados.</p>
            </div>
        );
    }

    const gridClass = sidebarCollapsed ? styles.eventsGridCollapsed : styles.eventsGridExpanded;

    return (
        <div className={`${styles.eventsGrid} ${gridClass}`}>
            {eventos.map((evento) => (
                <EventCard
                    key={evento.id}
                    evento={evento}
                    onVerDetalles={onVerDetalles}
                    formatFecha={formatFecha}
                    formatHora={formatHora}
                    getLugarTexto={getLugarTexto}
                    getEstadoEvento={getEstadoEvento}
                />
            ))}
        </div>
    );
};

export default EventsList;