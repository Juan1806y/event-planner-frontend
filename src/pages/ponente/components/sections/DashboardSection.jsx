import { useState } from 'react';
import ActividadCard from '../ui/ActividadCard';
import styles from '../styles/DashboardSection.module.css';

const DashboardSection = ({ actividades, loading }) => {
    const [filter, setFilter] = useState('todas');

    // Asegurar que actividades siempre sea un array
    const actividadesSeguras = actividades || [];
    
    const actividadesFiltradas = actividadesSeguras.filter(actividad => {
        if (filter === 'pendientes') return actividad.estado === 'pendiente';
        if (filter === 'aceptadas') return actividad.estado === 'aceptado';
        if (filter === 'solicitud_cambio') return actividad.estado === 'solicitud_cambio';
        return true;
    });

    const estadisticas = {
        total: actividadesSeguras.length,
        pendientes: actividadesSeguras.filter(a => a.estado === 'pendiente').length,
        aceptadas: actividadesSeguras.filter(a => a.estado === 'aceptado').length,
        conSolicitud: actividadesSeguras.filter(a => a.estado === 'solicitud_cambio').length,
    };

    if (loading) {
        return (
            <div className={styles.dashboard}>
                <div className={styles.loading}>Cargando actividades...</div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <h1>Mi Dashboard</h1>
            <p className={styles.subtitle}>Resumen de tus actividades y eventos</p>

            {/* Estadísticas */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Total Actividades</h3>
                    <span className={styles.statNumber}>{estadisticas.total}</span>
                </div>
                <div className={styles.statCard}>
                    <h3>Pendientes</h3>
                    <span className={styles.statNumber}>{estadisticas.pendientes}</span>
                </div>
                <div className={styles.statCard}>
                    <h3>Aceptadas</h3>
                    <span className={styles.statNumber}>{estadisticas.aceptadas}</span>
                </div>
                <div className={styles.statCard}>
                    <h3>Con Solicitud</h3>
                    <span className={styles.statNumber}>{estadisticas.conSolicitud}</span>
                </div>
            </div>

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
            </div>

            {/* Lista de actividades */}
            <div className={styles.actividadesList}>
                <h2>Próximas Actividades</h2>
                {actividadesFiltradas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No tienes actividades asignadas actualmente.</p>
                        <p className={styles.emptySubtitle}>
                            Cuando un organizador te asigne a un evento, podrás consultar tu agenda aquí.
                        </p>
                    </div>
                ) : (
                    actividadesFiltradas.map(actividad => (
                        <ActividadCard
                            key={`${actividad.id_ponente}-${actividad.id_actividad}`}
                            actividad={actividad}
                            showActions={true}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default DashboardSection;