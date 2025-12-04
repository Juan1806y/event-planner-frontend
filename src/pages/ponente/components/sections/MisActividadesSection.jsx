import { useState, useEffect, useCallback } from 'react';
import ActividadCard from '../ui/ActividadCard';
import styles from '../styles/MisActividadesSection.module.css';

const MisActividadesSection = ({ actividades, onSolicitudEnviada, error }) => {
    const [filter, setFilter] = useState('todas');
    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
    const [actividadesData, setActividadesData] = useState(actividades || []);

    useEffect(() => {
        if (actividades && Array.isArray(actividades)) {
            setActividadesData(actividades);
        }
    }, [actividades]);

    // Función para actualizar el estado de una actividad
    const handleActualizarEstadoActividad = useCallback((idActividad, nuevoEstado, fechaRespuesta) => {
        console.log('🔄 [MisActividadesSection] Actualizando actividad:');
        console.log('🔍 ID recibido:', idActividad);
        console.log('🔍 Nuevo estado:', nuevoEstado);
        console.log('🔍 Fecha respuesta:', fechaRespuesta);
        console.log('📋 Actividades actuales:', actividadesData);

        setActividadesData(prev => {
            return prev.map(actividad => {
                // Buscar la actividad por diferentes identificadores posibles
                if (actividad.id_actividad === idActividad ||
                    actividad.id_asignacion === idActividad ||
                    (actividad.actividad && actividad.actividad.id_actividad === idActividad)) {

                    console.log('✅ Actividad encontrada, actualizando estado...');

                    // Crear una nueva versión de la actividad con el estado actualizado
                    const actividadActualizada = {
                        ...actividad,
                        estado: nuevoEstado,
                        fecha_respuesta: fechaRespuesta || new Date().toISOString()
                    };

                    return actividadActualizada;
                }
                return actividad;
            });
        });
    }, []);

    // Procesar actividades para mostrar
    useEffect(() => {
        if (!actividadesData || !Array.isArray(actividadesData)) {
            setActividadesFiltradas([]);
            return;
        }

        const actividadesProcesadas = actividadesData.map(asignacion => {
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
                return filter === 'todas';
            }

            if (filter === 'pendientes') return actividad.estado === 'pendiente';
            if (filter === 'aceptadas') return actividad.estado === 'aceptado';
            if (filter === 'solicitud_cambio') return actividad.estado === 'solicitud_cambio';
            return true;
        });

        setActividadesFiltradas(filtradas);
    }, [actividadesData, filter]);

    return (
        <div className={styles.actividades}>
            <h2>Mis Actividades</h2>
            <p className={styles.subtitle}>Gestiona tus actividades asignadas</p>

            {error && (
                <div className={styles.errorMessage}>
                    <strong>Atención:</strong> {error}. Si crees que deberías tener actividades, contacta al organizador o administrador para que te vinculen como ponente.
                </div>
            )}

            {/* Filtros con contador */}
            <div className={styles.filtersContainer}>
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

                <div className={styles.filterCounter}>
                    <span className={styles.counterNumber}>{actividadesFiltradas.length}</span>
                    <span className={styles.counterText}>
                        {actividadesFiltradas.length === 1 ? 'actividad' : 'actividades'}
                        {filter !== 'todas' && ` ${filter}`}
                    </span>
                </div>
            </div>

            <div className={styles.actividadesList}>
                <div className={styles.actividadesGrid}>
                    {actividadesFiltradas.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No tienes actividades {filter !== 'todas' ? filter : ''}.</p>
                            <p className={styles.emptySubtitle}>
                                {actividades?.length === 0
                                    ? 'Cuando un organizador te asigne actividades, aparecerán aquí.'
                                    : 'Prueba con otro filtro para ver más actividades.'
                                }
                            </p>
                        </div>
                    ) : (
                        actividadesFiltradas.map((actividad, index) => (
                            <ActividadCard
                                key={actividad.id_asignacion || `${actividad.id_ponente}-${actividad.id_actividad}-${index}`}
                                actividad={actividad}
                                showActions={true}
                                onSolicitudEnviada={onSolicitudEnviada}
                                onActualizarEstado={handleActualizarEstadoActividad} // ← Nueva prop
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MisActividadesSection;