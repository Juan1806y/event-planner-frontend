import React from 'react';
import styles from './InscriptionsList.module.css';
import Calendar from '../../../../assets/calendar.png';
import Codigo from '../../../../assets/codigo.png';
import { formatRangoFechas } from '../../utils/dateUtils';

const InscriptionsList = ({
    misInscripciones,
    loading,
    asistenciasRegistradas,
    registrandoAsistencia,
    inscripcionRegistrando,
    handleRegistrarAsistencia,
    puedeRegistrarAsistencia,
    formatFecha,
    formatHora,
    onViewEvents
}) => {

    const formatHoraLocal = (hora) => {
        if (!hora) return '';
        return hora.substring(0, 5);
    };

    // Función para mostrar el rango de fechas del evento
    const getRangoFechasEvento = (evento) => {
        if (!evento) return 'Fechas no disponibles';
        return formatRangoFechas(evento.fecha_inicio, evento.fecha_fin);
    };

    const tieneAsistenciaRegistradaHoy = (inscripcion) => {
        const hoy = new Date().toISOString().split('T')[0];

        // Verificar en estado local primero
        if (asistenciasRegistradas.has(inscripcion.id)) {
            return true;
        }

        // Verificar en asistencias del backend
        const asistencias = inscripcion.asistencias || [];
        return asistencias.some(asistencia =>
            asistencia.fecha === hoy && asistencia.estado === 'Presente'
        );
    };

    const getEstadoVisual = (inscripcion) => {
        const hoy = new Date().toISOString().split('T')[0];
        const evento = inscripcion.evento;

        // Si ya registró asistencia HOY
        if (tieneAsistenciaRegistradaHoy(inscripcion)) {
            return {
                texto: 'Registrado',
                clase: styles.statusRegistered,
                puedeRegistrar: false
            };
        }

        // Si la inscripción está confirmada
        if (inscripcion.estado === 'Confirmada' && evento) {
            // Verificar si está dentro del rango del evento
            const dentroDelRango = hoy >= evento.fecha_inicio && hoy <= evento.fecha_fin;

            if (dentroDelRango) {
                return {
                    texto: 'Pendiente',
                    clase: styles.statusPending,
                    puedeRegistrar: true
                };
            } else {
                // Fuera del rango - mostrar por qué
                if (hoy < evento.fecha_inicio) {
                    return {
                        texto: 'No iniciado',
                        clase: styles.statusPending,
                        puedeRegistrar: false
                    };
                } else {
                    return {
                        texto: 'Finalizado',
                        clase: styles.statusConfirmed,
                        puedeRegistrar: false
                    };
                }
            }
        }

        // Para otros estados
        return {
            texto: inscripcion.estado || 'Pendiente',
            clase: styles.statusPending,
            puedeRegistrar: false
        };
    };

    // Función CORREGIDA para obtener mensaje de estado
    const getMensajeEstado = (inscripcion, estadoVisual) => {
        if (estadoVisual.texto === 'Registrado') {
            return 'Asistencia ya registrada';
        }

        if (estadoVisual.texto === 'Pendiente') {
            return 'Puede registrar asistencia';
        }

        if (estadoVisual.texto === 'No iniciado') {
            return 'El evento aún no ha comenzado';
        }

        if (estadoVisual.texto === 'Finalizado') {
            return 'El evento ya finalizó';
        }

        return `Estado: ${estadoVisual.texto}`;
    };

    const getAsistenciasDelEvento = (inscripcion) => {
        if (!inscripcion.asistencias || !Array.isArray(inscripcion.asistencias)) {
            return [];
        }
        return inscripcion.asistencias;
    };

    // Función SEGURA para formatear fecha
    const formatFechaSegura = (fecha) => {
        if (!fecha) return 'Fecha no disponible';
        try {
            return formatFecha(fecha);
        } catch (error) {
            console.error('Error formateando fecha:', fecha, error);
            return 'Fecha inválida';
        }
    };

    // Función CORREGIDA para determinar qué mostrar
    const getAccionAsistencia = (inscripcion, estadoVisual) => {
        if (estadoVisual.texto === 'Registrado') {
            return {
                tipo: 'mensaje',
                contenido: 'Asistencia registrada',
                clase: styles.mensajeAsistenciaRegistrada
            };
        }

        if (estadoVisual.puedeRegistrar) {
            return {
                tipo: 'boton',
                contenido: 'Registrar Asistencia'
            };
        }

        // Determinar la clase según el mensaje
        const mensaje = getMensajeEstado(inscripcion, estadoVisual);
        let claseMensaje = styles.mensajeEstadoDefault;

        if (mensaje === 'El evento aún no ha comenzado') {
            claseMensaje = styles.mensajeEventoNoIniciado;
        } else if (mensaje === 'El evento ya finalizó') {
            claseMensaje = styles.mensajeEventoFinalizado;
        } else if (mensaje === 'Asistencia ya registrada') {
            claseMensaje = styles.mensajeAsistenciaRegistrada;
        }

        return {
            tipo: 'mensaje',
            contenido: mensaje,
            clase: claseMensaje
        };
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando mis inscripciones...</p>
            </div>
        );
    }

    if (!misInscripciones || misInscripciones.length === 0) {
        return (
            <div className={styles.noInscripciones}>
                <h3>No tienes inscripciones activas.</h3>
                <button
                    className={styles.btnShowAll}
                    onClick={onViewEvents}
                >
                    Ver eventos disponibles
                </button>
            </div>
        );
    }

    return (
        <div className={styles.inscripcionesContainer}>
            <div className={styles.inscripcionesHeader}>
                <h2>Mis Inscripciones</h2>
                <p>Gestiona tus inscripciones y registra tu asistencia a los eventos.</p>
            </div>

            <div className={styles.inscripcionesGrid}>
                {misInscripciones.map((inscripcion) => {
                    const evento = inscripcion.evento;
                    const estadoVisual = getEstadoVisual(inscripcion);
                    const accionAsistencia = getAccionAsistencia(inscripcion, estadoVisual);
                    const asistencias = getAsistenciasDelEvento(inscripcion);
                    const estaRegistrando = registrandoAsistencia && inscripcionRegistrando === inscripcion.id;

                    return (
                        <div className={styles.inscripcionCard} key={inscripcion.id}>
                            <div className={styles.inscripcionHeader}>
                                <h3 className={styles.inscripcionTitle}>
                                    {evento?.titulo || 'Evento no disponible'}
                                </h3>
                                <span className={`${styles.inscripcionStatus} ${estadoVisual.clase}`}>
                                    {estadoVisual.texto}
                                </span>
                            </div>

                            {evento && (
                                <div className={styles.inscripcionDetails}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailIcon}>
                                            <img src={Calendar} alt="Fecha" className={styles.iconImage} />
                                        </span>
                                        <span>
                                            {getRangoFechasEvento(evento)}
                                            {evento.hora && ` - ${formatHoraLocal(evento.hora)}`}
                                        </span>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <img src={Codigo} alt="Código" className={styles.iconImage} />
                                        <span className={styles.codigoText}>{inscripcion.codigo}</span>
                                    </div>

                                    {asistencias.length > 0 && (
                                        <div className={styles.asistenciasSection}>
                                            <h4>Asistencias registradas:</h4>
                                            {asistencias.map((asistencia, index) => (
                                                <div key={asistencia.id || index} className={styles.asistenciaItem}>
                                                    <span>{formatFechaSegura(asistencia.fecha)}</span>
                                                    <span className={`${styles.asistenciaStatus} ${asistencia.estado === 'Presente'
                                                        ? styles.asistenciaPresent
                                                        : styles.asistenciaAbsent
                                                        }`}>
                                                        {asistencia.estado || 'Sin estado'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={styles.inscripcionActions}>
                                {accionAsistencia.tipo === 'boton' && (
                                    <button
                                        className={`${styles.btnRegistrarAsistencia} ${estaRegistrando ? styles.btnRegistrando : ''
                                            }`}
                                        onClick={() => handleRegistrarAsistencia(inscripcion)}
                                        disabled={registrandoAsistencia}
                                    >
                                        {estaRegistrando ? 'Registrando...' : accionAsistencia.contenido}
                                    </button>
                                )}

                                {accionAsistencia.tipo === 'mensaje' && (
                                    <span className={`${styles.mensajeEstado} ${accionAsistencia.clase || ''}`}>
                                        {accionAsistencia.contenido}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InscriptionsList;