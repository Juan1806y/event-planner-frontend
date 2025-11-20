import { useState } from 'react';
import styles from '../styles/ActividadCard.module.css';
import SolicitudCambioModal from './SolicitarCambioModal';
import ActividadDetallesModal from './ActividadDetallesModal';
import ponenteAgendaService from '../../../../services/ponenteAgendaService';

const ActividadCard = ({ actividad, showActions = true, onSolicitudEnviada }) => {
    const [showModal, setShowModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const getSafeValue = (obj, posiblesClaves, defaultValue = 'No disponible') => {
        if (!obj) return defaultValue;

        if (typeof obj !== 'object') return obj;

        for (let clave of posiblesClaves) {
            if (obj[clave] !== undefined && obj[clave] !== null && obj[clave] !== '') {
                return obj[clave];
            }
        }

        return defaultValue;
    };

    const getEstadoBadge = (estado) => {
        const labels = {
            pendiente: 'Pendiente',
            aceptado: 'Aceptado',
            rechazado: 'Rechazado',
            solicitud_cambio: 'Solicitud Cambio',
            solicitudCambio: 'Solicitud Cambio'
        };

        const label = labels[estado] || estado || 'Estado';
        const estadoClass = styles[estado] || styles[estado.replace(/_/g, '')] || '';
        return <span className={`${styles.estadoBadge} ${estadoClass}`}>{label}</span>;
    };

    const handleSolicitarCambio = () => {
        setShowModal(true);
    };

    const handleVerDetalles = () => {
        setShowDetails(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSolicitudSubmit = async (solicitudData) => {
        try {
            const token = localStorage.getItem('access_token');

            await ponenteAgendaService.solicitarCambios(
                actividad.id_ponente,
                actividad.id_actividad,
                solicitudData.cambios_solicitados,
                solicitudData.justificacion,
                token
            );

            onSolicitudEnviada?.(solicitudData);
            setShowModal(false);
            alert('Tu solicitud de cambio ha sido enviada para revisión.');
        } catch (error) {
            console.error('Error al enviar solicitud de cambio:', error);

            const mensaje = (error && error.message) ? error.message.toLowerCase() : '';

            if (mensaje.includes('pendiente') || mensaje.includes('ya tienes una solicitud')) {
                alert('Ya tienes una solicitud pendiente para esta actividad. Espera la respuesta antes de enviar una nueva.');
            } else {
                alert('Error al enviar la solicitud. Por favor intenta de nuevo.');
            }
        }
    };

    const nombreActividad = getSafeValue(actividad, ['nombre', 'titulo', 'actividad?.titulo'], 'Actividad sin nombre') ||
        getSafeValue(actividad.actividad, ['titulo', 'nombre'], 'Actividad sin nombre');
    const descripcion = getSafeValue(actividad, ['descripcion']) || getSafeValue(actividad.actividad, ['descripcion']);
    const fecha = getSafeValue(actividad, ['fecha', 'fecha_actividad']) || getSafeValue(actividad.actividad, ['fecha_actividad', 'fecha']);
    const horaInicio = getSafeValue(actividad, ['hora_inicio']) || getSafeValue(actividad.actividad, ['hora_inicio']);
    const horaFin = getSafeValue(actividad, ['hora_fin']) || getSafeValue(actividad.actividad, ['hora_fin']);
    const ubicacion = getSafeValue(actividad, ['ubicacion']) || getSafeValue(actividad.actividad, ['ubicacion']);
    const evento = actividad?.actividad?.evento?.titulo || actividad?.evento?.titulo || actividad?.actividad?.evento?.nombre || actividad?.evento?.nombre || 'Evento';
    const empresa = actividad?.actividad?.evento?.empresa || actividad?.evento?.empresa || actividad?.actividad?.empresa || '';

    let displayEstado = actividad.estado || 'pendiente';
    if (actividad.fecha_asignacion && !actividad.fecha_respuesta) {
        displayEstado = 'pendiente';
    }

    const actividadId = actividad.id_ponente || actividad.id_actividad || actividad.actividad?.id_actividad || actividad.actividad?.id;

    return (
        <>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h3 className={styles.titulo}>{nombreActividad}</h3>
                        <span className={styles.modalidadBadge}>
                            {actividad.tipo || 'Actividad'}
                        </span>
                    </div>
                    {getEstadoBadge(displayEstado)}
                </div>

                <div className={styles.cardBody}>

                    {/* Detalles */}
                    <div className={styles.detalles}>
                        <div className={styles.detalleItem}>
                            <div className={styles.detalleContent}>
                                <span className={styles.detalleLabel}>Fecha</span>
                                <span className={styles.detalleValue}>
                                    {fecha ? new Date(fecha).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'Por definir'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.detalleItem}>
                            <div className={styles.detalleContent}>
                                <span className={styles.detalleLabel}>Horario</span>
                                <span className={styles.detalleValue}>
                                    {horaInicio && horaFin ?
                                        `${horaInicio.substring(0, 5)} - ${horaFin.substring(0, 5)}` :
                                        'Por definir'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Información de asignación */}
                    <div className={styles.detalles} style={{ marginTop: 8 }}>
                        <div className={styles.detalleItem}>
                            <div className={styles.detalleContent}>
                                <span className={styles.detalleLabel}>Fecha asignación</span>
                                <span className={styles.detalleValue}>{actividad.fecha_asignacion ? new Date(actividad.fecha_asignacion).toLocaleString('es-ES') : '—'}</span>
                            </div>
                        </div>

                        <div className={styles.detalleItem}>
                            <div className={styles.detalleContent}>
                                <span className={styles.detalleLabel}>Fecha respuesta</span>
                                <span className={styles.detalleValue}>{actividad.fecha_respuesta ? new Date(actividad.fecha_respuesta).toLocaleString('es-ES') : '—'}</span>
                            </div>
                        </div>

                        {empresa && (
                            <div className={styles.detalleItem}>
                                <div className={styles.detalleContent}>
                                    <span className={styles.detalleLabel}>Empresa</span>
                                    <span className={styles.detalleValue}>{empresa}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Descripción */}
                    {descripcion && descripcion !== 'No disponible' && (
                        <div className={styles.descripcionContainer}>
                            <div className={styles.descripcionLabel}>Descripción</div>
                            <div className={styles.descripcionText}>{descripcion}</div>
                        </div>
                    )}

                    {/* Acciones */}
                    {showActions && displayEstado !== 'solicitud_cambio' && (

                        <div className={styles.actions}>
                            <button
                                className={styles.solicitarBtn}
                                onClick={handleSolicitarCambio}
                                disabled={displayEstado === 'rechazado'}
                            >
                                {displayEstado === 'pendiente' ? 'Responder' : 'Solicitar Cambio'}
                            </button>
                            <button
                                className={styles.detallesBtn}
                                onClick={handleVerDetalles}
                            >
                                Ver Detalles
                            </button>
                        </div>
                    )}

                    {displayEstado === 'solicitud_cambio' && (
                        <div className={styles.solicitudInfo}>
                            <p className={styles.solicitudText}>
                                Tienes una solicitud de cambio pendiente de revisión
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <SolicitudCambioModal
                    actividad={actividad}
                    onClose={handleCloseModal}
                    onSubmit={handleSolicitudSubmit}
                />
            )}

            {showDetails && actividadId && (
                <ActividadDetallesModal actividadId={actividadId} onClose={() => setShowDetails(false)} />
            )}
        </>
    );
};

export default ActividadCard;