import { useState, useEffect } from 'react';
import ActividadCard from '../ui/ActividadCard';
import styles from '../styles/MisActividadesSection.module.css';

const MisActividadesSection = ({ actividades, onSolicitudEnviada, error }) => {
    const [filter, setFilter] = useState('todas');
    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);

    console.log('🎯 MisActividadesSection - actividades recibidas:', actividades);

    useEffect(() => {
        if (!actividades || !Array.isArray(actividades)) {
            setActividadesFiltradas([]);
            return;
        }

        const actividadesProcesadas = actividades.map(asignacion => {

            if (asignacion.nombre || asignacion.titulo) {
                return asignacion;
            }

            if (asignacion.actividad) {
                return {
                    id_asignacion: asignacion.id_asignacion,
                    id_ponente: asignacion.id_ponente,
                    id_actividad: asignacion.id_actividad,
                    estado: asignacion.estado,
                    fecha_asignacion: asignacion.fecha_asignacion,
                    fecha_respuesta: asignacion.fecha_respuesta,
                    notas: asignacion.notas,

                    nombre: asignacion.actividad.titulo || asignacion.actividad.nombre,
                    descripcion: asignacion.actividad.descripcion,
                    fecha: asignacion.actividad.fecha_actividad,
                    hora_inicio: asignacion.actividad.hora_inicio,
                    hora_fin: asignacion.actividad.hora_fin,
                    ubicacion: asignacion.actividad.ubicacion,
                    tipo: asignacion.actividad.tipo,

                    evento: asignacion.evento
                };
            }

            return asignacion;
        });

        const filtradas = actividadesProcesadas.filter(actividad => {
            if (!actividad.estado) {
                console.warn('⚠️ Actividad sin estado:', actividad);
                return filter === 'todas';
            }

            if (filter === 'pendientes') return actividad.estado === 'pendiente';
            if (filter === 'aceptadas') return actividad.estado === 'aceptado';
            if (filter === 'solicitud_cambio') return actividad.estado === 'solicitud_cambio';
            return true;
        });

        console.log(`🎯 Actividades filtradas (${filter}):`, filtradas);
        setActividadesFiltradas(filtradas);
    }, [actividades, filter]);

    return (
        <div className={styles.actividades}>
            <h2>Mis Actividades</h2>
            <p className={styles.subtitle}>Gestiona tus actividades asignadas</p>

            {error && (
                <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffeeba',
                    color: '#856404',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    marginBottom: '12px'
                }}>
                    <strong>Atención:</strong> {error}. Si crees que deberías tener actividades, contacta al organizador o administrador para que te vinculen como ponente.
                </div>
            )}

            <div style={{
                background: '#f8f9fa',
                padding: '8px 12px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#666'
            }}>
                <strong>Debug:</strong> {actividades?.length || 0} actividades cargadas |
                Mostrando {actividadesFiltradas.length} filtradas
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
                <button
                    className={`${styles.filterBtn} ${filter === 'solicitud_cambio' ? styles.active : ''}`}
                    onClick={() => setFilter('solicitud_cambio')}
                >
                    Con Solicitud
                </button>
            </div>

            <div className={styles.actividadesList}>
                <div className={styles.actividadesGrid}>
                    {actividadesFiltradas.map((actividad, index) => (
                        <ActividadCard
                            key={actividad.id_asignacion || `${actividad.id_ponente}-${actividad.id_actividad}-${index}`}
                            actividad={actividad}
                            showActions={true}
                            onSolicitudEnviada={onSolicitudEnviada}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MisActividadesSection;