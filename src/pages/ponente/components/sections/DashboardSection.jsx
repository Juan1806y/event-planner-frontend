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
        </div>
    );
};

export default DashboardSection;