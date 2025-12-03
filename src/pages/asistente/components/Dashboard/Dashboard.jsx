import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import Calendar from '../../../../assets/calendar.png';
import Users from '../../../../assets/person.png';
import CheckCircle from '../../../../assets/notifications.png';
import EventIcon from '../../../../assets/cupos.png';
import Clock from '../../../../assets/clock.png';
import Location from '../../../../assets/lugar.png';
import { formatFecha, formatHora } from '../../utils/dateUtils';
import agendaService from '../../../../services/agendaService';
import eventService from '../../../../services/eventService';
import { inscriptionService } from '../../../../services/inscriptionService';

const Dashboard = () => {
    const [metricas, setMetricas] = useState({
        totalEventos: 0,
        eventosActivos: 0,
        totalInscripciones: 0,
        asistenciasRegistradas: 0,
        proximasActividades: 0,
        actividadesHoy: 0
    });
    const [misInscripciones, setMisInscripciones] = useState([]);
    const [proximasActividades, setProximasActividades] = useState([]);
    const [actividadesHoy, setActividadesHoy] = useState([]);
    const [eventosRecientes, setEventosRecientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [cargandoActividades, setCargandoActividades] = useState(false);

    // Función para obtener todas las métricas
    const obtenerMetricas = async () => {
        setCargando(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token disponible');
            }

            // Obtener inscripciones del usuario
            const inscripciones = await inscriptionService.getMyInscriptions(token);
            setMisInscripciones(inscripciones);

            // Obtener eventos disponibles para métricas generales
            const eventosDisponibles = await eventService.getAvailableEvents(token);

            // Obtener actividades para métricas
            const actividadesProximas = await agendaService.obtenerActividadesPorFecha(
                inscripciones,
                token,
                'proximas'
            );

            const actividadesDelDia = await agendaService.obtenerActividadesPorFecha(
                inscripciones,
                token,
                'hoy'
            );

            setProximasActividades(actividadesProximas.slice(0, 5)); // Últimas 5 actividades
            setActividadesHoy(actividadesDelDia);

            // Calcular asistencias registradas
            const asistenciasTotales = inscripciones.reduce((total, inscripcion) => {
                return total + (inscripcion.asistencias?.length || 0);
            }, 0);

            // Actualizar métricas
            setMetricas({
                totalEventos: eventosDisponibles.length,
                eventosActivos: eventosDisponibles.filter(evento =>
                    evento.estado_evento === 'Disponible' || evento.estado === 1
                ).length,
                totalInscripciones: inscripciones.length,
                asistenciasRegistradas: asistenciasTotales,
                proximasActividades: actividadesProximas.length,
                actividadesHoy: actividadesDelDia.length
            });

            // Obtener eventos recientes (últimos 3 eventos disponibles)
            setEventosRecientes(eventosDisponibles.slice(0, 3));

        } catch (error) {
            console.error('Error obteniendo métricas del dashboard:', error);
        } finally {
            setCargando(false);
        }
    };

    // Función para obtener actividades próximas
    const obtenerActividadesProximas = async () => {
        if (misInscripciones.length === 0) return;

        setCargandoActividades(true);
        try {
            const token = localStorage.getItem('access_token') || localStorage.getItem('token');
            const actividades = await agendaService.obtenerActividadesPorFecha(
                misInscripciones,
                token,
                'proximas'
            );
            setProximasActividades(actividades.slice(0, 5));
        } catch (error) {
            console.error('Error obteniendo actividades próximas:', error);
        } finally {
            setCargandoActividades(false);
        }
    };

    useEffect(() => {
        obtenerMetricas();
    }, []);

    // Función para formatear el rango de horas
    const formatRangoHoras = (horaInicio, horaFin) => {
        const inicio = formatHora(horaInicio);
        const fin = formatHora(horaFin);
        return `${inicio} - ${fin}`;
    };

    // Función para obtener lugares como string
    const obtenerLugaresTexto = (lugares) => {
        if (!lugares || lugares.length === 0) return 'Virtual';
        return lugares.map(lugar => lugar.nombre).join(', ');
    };

    // Función para obtener la clase de estado de la actividad
    const getEstadoActividad = (actividad) => {
        if (agendaService.estaEnCurso(actividad)) {
            return styles.enCurso;
        }
        if (agendaService.esProxima(actividad)) {
            return styles.proxima;
        }
        return styles.pasada;
    };

    // Función para obtener el texto del estado
    const getTextoEstado = (actividad) => {
        if (agendaService.estaEnCurso(actividad)) {
            return 'En curso';
        }
        if (agendaService.esProxima(actividad)) {
            return 'Próxima';
        }
        return 'Finalizada';
    };

    if (cargando) {
        return (
            <div className={styles.dashboardContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <div className={styles.headerSection}>
                <h1 className={styles.mainTitle}>Mi Dashboard</h1>
                <p className={styles.subtitle}>Resumen de tus actividades y eventos</p>
            </div>

            {/* Métricas */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                        <img src={EventIcon} alt="Eventos" className={styles.iconImage} />
                    </div>
                    <div className={styles.metricContent}>
                        <h3 className={styles.metricValue}>{metricas.totalEventos}</h3>
                        <p className={styles.metricLabel}>Eventos Disponibles</p>
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>
                        <img src={Users} alt="Inscripciones" className={styles.iconImage} />
                    </div>
                    <div className={styles.metricContent}>
                        <h3 className={styles.metricValue}>{metricas.totalInscripciones}</h3>
                        <p className={styles.metricLabel}>Mis Inscripciones</p>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className={styles.mainContent}>
                {/* Columna Izquierda - Actividades Próximas */}
                <div className={styles.leftColumn}>
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <h2>Próximas Actividades</h2>
                            <span className={styles.badge}>{proximasActividades.length}</span>
                        </div>

                        {cargandoActividades ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                                <p>Cargando actividades...</p>
                            </div>
                        ) : proximasActividades.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No hay actividades próximas programadas</p>
                            </div>
                        ) : (
                            <div className={styles.activitiesList}>
                                {proximasActividades.map((actividad, index) => {
                                    const estadoActividad = getEstadoActividad(actividad);
                                    const textoEstado = getTextoEstado(actividad);
                                    const lugaresTexto = obtenerLugaresTexto(actividad.lugares);

                                    return (
                                        <div key={`${actividad.id_actividad}-${index}`} className={styles.activityItem}>
                                            <div className={styles.activityHeader}>
                                                <h4 className={styles.activityTitle}>{actividad.titulo}</h4>
                                                <span className={`${styles.activityStatus} ${estadoActividad}`}>
                                                    {textoEstado}
                                                </span>
                                            </div>

                                            <div className={styles.activityDetails}>
                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailIcon}>
                                                        <img src={Calendar} alt="Fecha" className={styles.iconSmall} />
                                                    </span>
                                                    <span>{formatFecha(actividad.fecha_actividad)}</span>
                                                </div>

                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailIcon}>
                                                        <img src={Clock} alt="Hora" className={styles.iconSmall} />
                                                    </span>
                                                    <span>{formatRangoHoras(actividad.hora_inicio, actividad.hora_fin)}</span>
                                                </div>

                                                <div className={styles.detailRow}>
                                                    <span className={styles.detailIcon}>
                                                        <img src={Location} alt="Lugar" className={styles.iconSmall} />
                                                    </span>
                                                    <span>{lugaresTexto}</span>
                                                </div>
                                            </div>

                                            <div className={styles.eventInfo}>
                                                <span className={styles.eventName}>{actividad.evento.titulo}</span>
                                                <span className={styles.eventModality}>{actividad.evento.modalidad}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha - Resumen de Inscripciones y Eventos */}
                <div className={styles.rightColumn}>
                    {/* Resumen de Inscripciones */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <h2>Mis Inscripciones</h2>
                            <span className={styles.badge}>{misInscripciones.length}</span>
                        </div>

                        {misInscripciones.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No tienes inscripciones activas</p>
                            </div>
                        ) : (
                            <div className={styles.inscriptionsList}>
                                {misInscripciones.slice(0, 4).map((inscripcion) => (
                                    <div key={inscripcion.id} className={styles.inscriptionItem}>
                                        <div className={styles.inscriptionHeader}>
                                            <h4>{inscripcion.evento.titulo}</h4>
                                            <span className={`${styles.inscriptionStatus} ${inscripcion.estado === 'Confirmada' ? styles.statusConfirmed : styles.statusPending
                                                }`}>
                                                {inscripcion.estado}
                                            </span>
                                        </div>
                                        <div className={styles.inscriptionDetails}>
                                            <span className={styles.inscriptionCode}>Código: {inscripcion.codigo}</span>
                                            <span className={styles.inscriptionDate}>
                                                {formatFecha(inscripcion.fecha_inscripcion)}
                                            </span>
                                        </div>
                                        {inscripcion.asistencias && inscripcion.asistencias.length > 0 && (
                                            <div className={styles.attendanceCount}>
                                                Asistencias: {inscripcion.asistencias.length}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Eventos Recientes */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <h2>Eventos Disponibles</h2>
                            <span className={styles.badge}>{eventosRecientes.length}</span>
                        </div>

                        {eventosRecientes.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No hay eventos disponibles</p>
                            </div>
                        ) : (
                            <div className={styles.eventsList}>
                                {eventosRecientes.map((evento) => (
                                    <div key={evento.id} className={styles.eventItem}>
                                        <div className={styles.eventHeader}>
                                            <h4>{evento.titulo}</h4>
                                            <span className={styles.eventModality}>{evento.modalidad}</span>
                                        </div>
                                        <div className={styles.eventDetails}>
                                            <span className={styles.eventDate}>
                                                {formatFecha(evento.fecha_inicio)}
                                                {evento.fecha_fin && evento.fecha_fin !== evento.fecha_inicio &&
                                                    ` - ${formatFecha(evento.fecha_fin)}`
                                                }
                                            </span>
                                            {evento.cupos_disponibles > 0 && (
                                                <span className={styles.eventCapacity}>
                                                    {evento.cupos_disponibles} cupos disponibles
                                                </span>
                                            )}
                                        </div>
                                        {evento.empresa && (
                                            <div className={styles.eventCompany}>
                                                {evento.empresa}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>
                            <h2>Resumen Rápido</h2>
                        </div>
                        <div className={styles.quickStats}>
                            <div className={styles.quickStat}>
                                <span className={styles.statLabel}>Eventos Activos:</span>
                                <span className={styles.statValue}>{metricas.eventosActivos}</span>
                            </div>
                            <div className={styles.quickStat}>
                                <span className={styles.statLabel}>Actividades Próximas:</span>
                                <span className={styles.statValue}>{metricas.proximasActividades}</span>
                            </div>
                            <div className={styles.quickStat}>
                                <span className={styles.statLabel}>Asistencias Hoy:</span>
                                <span className={styles.statValue}>
                                    {actividadesHoy.filter(act => agendaService.estaEnCurso(act)).length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;