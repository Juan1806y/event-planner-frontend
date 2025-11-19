import { useState } from 'react';
import ActividadCard from '../ui/ActividadCard';
import styles from '../styles/MisActividadesSection.module.css';

const MisActividadesSection = ({ actividades, onSolicitudEnviada }) => {
    const [filter, setFilter] = useState('todas');

    const actividadesFiltradas = actividades.filter(actividad => {
        if (filter === 'pendientes') return actividad.estado === 'pendiente';
        if (filter === 'aceptadas') return actividad.estado === 'aceptado';
        if (filter === 'solicitud_cambio') return actividad.estado === 'solicitud_cambio';
        return true;
    });

    return (
        <div className={styles.actividades}>
            <h2>Mis Actividades</h2>
            <p className={styles.subtitle}>Gestiona tus actividades asignadas</p>

            {/* Filtros */}
            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'todas' ? styles.active : ''}`}
                    onClick={() => setFilter('todas')}
                >
                    Todas
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'pendientes' ? styles.active : ''}`}
                    onClick={() => setFilter('pendientes')}
                >
                    Pendientes
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'aceptadas' ? styles.active : ''}`}
                    onClick={() => setFilter('aceptadas')}
                >
                    Aceptadas
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'solicitud_cambio' ? styles.active : ''}`}
                    onClick={() => setFilter('solicitud_cambio')}
                >
                    Con Solicitud
                </button>
            </div>

            {/* Lista de actividades */}
            <div className={styles.actividadesList}>
                {actividadesFiltradas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No tienes actividades {filter !== 'todas' ? filter : ''}.</p>
                    </div>
                ) : (
                    actividadesFiltradas.map(actividad => (
                        <ActividadCard
                            key={`${actividad.id_ponente}-${actividad.id_actividad}`}
                            actividad={actividad}
                            showActions={true}
                            onSolicitudEnviada={onSolicitudEnviada}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MisActividadesSection;