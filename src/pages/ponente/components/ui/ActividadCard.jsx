import { useState, useEffect } from 'react';
import styles from '../styles/ActividadCard.module.css';
import SolicitudCambioModal from './SolicitarCambioModal';
import ResponderInvitacionModal from './ResponderInvitacionModal';
import ActividadDetallesModal from './ActividadDetallesModal';
import ponenteAgendaService from '../../../../services/ponenteAgendaService';

const ActividadCard = ({ actividad, showActions = true, onSolicitudEnviada, onRespuestaEnviada, onActualizarActividad, onShowNotification }) => {
    const [showModal, setShowModal] = useState(false);
    const [showResponderModal, setShowResponderModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [estadoLocal, setEstadoLocal] = useState(actividad.estado);

    useEffect(() => {
        setEstadoLocal(actividad.estado);
    }, [actividad.estado]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Por definir';
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return adjustedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return adjustedDate.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        });
    };

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
        const estadoParaMostrar = estado || estadoLocal;
        const label = labels[estadoParaMostrar] || estadoParaMostrar || 'Estado';
        const estadoClass = styles[estadoParaMostrar] || styles[estadoParaMostrar?.replace(/_/g, '')] || '';
        return <span className={`${styles.estadoBadge} ${estadoClass}`}>{label}</span>;
    };

    const showNotification = (message, type = 'info') => {
        if (onShowNotification) {
            onShowNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    };

    const handleSolicitarCambio = () => {
        if (estadoLocal !== 'aceptado') {
            showNotification(`Solo puedes solicitar cambios en actividades aceptadas. Estado actual: ${estadoLocal}`, 'warning');
            return;
        }
        setShowModal(true);
    };

    const handleResponderInvitacion = () => {
        if (estadoLocal !== 'pendiente') {
            showNotification(`Esta actividad ya está ${estadoLocal}. No puedes responder la invitación.`, 'warning');
            return;
        }
        setShowResponderModal(true);
    };

    const handleVerDetalles = () => {
        setShowDetails(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCloseResponderModal = () => {
        setShowResponderModal(false);
    };

    const getTextoBotonPrincipal = () => {
        if (estadoLocal === 'pendiente') {
            return 'Responder';
        } else if (estadoLocal === 'aceptado') {
            return 'Solicitar Cambio';
        } else if (estadoLocal === 'rechazado') {
            return 'Actividad Rechazada';
        } else if (estadoLocal === 'solicitud_cambio') {
            return 'Solicitud Enviada';
        }
        return 'Actividad';
    };

    const handleBotonPrincipal = () => {
        if (estadoLocal === 'pendiente') {
            handleResponderInvitacion();
        } else if (estadoLocal === 'aceptado') {
            handleSolicitarCambio();
        }
        // Para estado 'rechazado' y 'solicitud_cambio' no hace nada
    };

    const handleSolicitudSubmit = async (solicitudData) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('access_token');
            await ponenteAgendaService.solicitarCambios(
                actividad.id_ponente,
                actividad.id_actividad,
                solicitudData.cambios_solicitados,
                solicitudData.justificacion,
                token
            );

            showNotification('Tu solicitud de cambio ha sido enviada para revisión', 'success');
            onSolicitudEnviada?.(solicitudData);
            setShowModal(false);

        } catch (error) {
            console.error('Error al enviar solicitud de cambio:', error);
            const mensaje = (error && error.message) ? error.message.toLowerCase() : '';

            if (mensaje.includes('pendiente') || mensaje.includes('ya tienes una solicitud')) {
                showNotification('Ya tienes una solicitud pendiente para esta actividad. Espera la respuesta antes de enviar una nueva.', 'warning');
            } else if (mensaje.includes('400') || mensaje.includes('bad request')) {
                showNotification('Error en los datos enviados. Verifica que todos los campos estén correctos.', 'error');
            } else {
                showNotification('Error al enviar la solicitud. Por favor intenta de nuevo.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRespuestaSubmit = async (respuestaData) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('access_token');
            const resultado = await ponenteAgendaService.responderInvitacion(
                actividad.id_ponente,
                actividad.id_actividad,
                respuestaData.aceptar,
                respuestaData.motivo_rechazo,
                token
            );

            const nuevoEstado = respuestaData.aceptar ? 'aceptado' : 'rechazado';
            setEstadoLocal(nuevoEstado);

            if (onActualizarActividad) {
                onActualizarActividad(actividad.id_actividad, {
                    ...actividad,
                    estado: nuevoEstado,
                    fecha_respuesta: new Date().toISOString()
                });
            }

            const mensajeExito = respuestaData.aceptar
                ? '¡Invitación aceptada correctamente!'
                : 'Invitación rechazada correctamente';

            showNotification(mensajeExito, 'success');
            onRespuestaEnviada?.(resultado);
            setShowResponderModal(false);

        } catch (error) {
            console.error('Error al enviar respuesta:', error);

            if (error.message.includes('Estado actual: aceptado')) {
                setEstadoLocal('aceptado');
                if (onActualizarActividad) {
                    onActualizarActividad(actividad.id_actividad, {
                        ...actividad,
                        estado: 'aceptado'
                    });
                }
                showNotification('Esta actividad ya fue aceptada anteriormente.', 'info');
            } else if (error.message.includes('400') || error.message.includes('bad request')) {
                showNotification('Error: No se pudo procesar tu respuesta. Verifica los datos e intenta nuevamente.', 'error');
            } else if (error.message.includes('403') || error.message.includes('forbidden')) {
                showNotification('No tienes permisos para realizar esta acción.', 'error');
            } else if (error.message.includes('404') || error.message.includes('not found')) {
                showNotification('No se encontró la actividad solicitada.', 'error');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                showNotification('Error de conexión. Verifica tu internet e intenta nuevamente.', 'error');
            } else {
                showNotification(`Error: ${error.message}`, 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const nombreActividad = getSafeValue(actividad, ['nombre', 'titulo', 'actividad?.titulo'], 'Actividad sin nombre') ||
        getSafeValue(actividad.actividad, ['titulo', 'nombre'], 'Actividad sin nombre');
    const descripcion = getSafeValue(actividad, ['descripcion']) || getSafeValue(actividad.actividad, ['descripcion']);
    const fecha = getSafeValue(actividad, ['fecha', 'fecha_actividad']) || getSafeValue(actividad.actividad, ['fecha_actividad', 'fecha']);
    const horaInicio = getSafeValue(actividad, ['hora_inicio']) || getSafeValue(actividad.actividad, ['hora_inicio']);
    const horaFin = getSafeValue(actividad, ['hora_fin']) || getSafeValue(actividad.actividad, ['hora_fin']);
    const ubicacion = getSafeValue(actividad, ['ubicacion']) || getSafeValue(actividad.actividad, ['ubicacion']);
    const empresa = actividad?.actividad?.evento?.empresa || actividad?.evento?.empresa || actividad?.actividad?.empresa || '';

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
                    {getEstadoBadge(estadoLocal)}
                </div>

                <div className={styles.cardBody}>
                    <div className={styles.detalles}>
                        <div className={styles.detalleItem}>
                            <div className={styles.detalleContent}>
                                <span className={styles.detalleLabel}>Fecha</span>
                                <span className={styles.detalleValue}>
                                    {formatDate(fecha)}
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

                    <div className={styles.detalles} style={{ marginTop: 8 }}>
                        <div className={styles.detalleItem}>
                            <div className={styles.detalleContent}>
                                <span className={styles.detalleLabel}>Fecha asignación</span>
                                <span className={styles.detalleValue}>
                                    {formatDateTime(actividad.fecha_asignacion)}
                                </span>
                            </div>
                        </div>

                        <div className={styles.detalleItem}>
                            <div className={styles.detalleContent}>
                                <span className={styles.detalleLabel}>Fecha respuesta</span>
                                <span className={styles.detalleValue}>
                                    {formatDateTime(actividad.fecha_respuesta)}
                                </span>
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

                    {descripcion && descripcion !== 'No disponible' && (
                        <div className={styles.descripcionContainer}>
                            <div className={styles.descripcionLabel}>Descripción</div>
                            <div className={styles.descripcionText}>{descripcion}</div>
                        </div>
                    )}

                    {showActions && (
                        <div className={styles.actions}>
                            <button
                                className={`${styles.solicitarBtn} ${estadoLocal === 'rechazado' ? styles.rechazadoBtn : ''
                                    } ${estadoLocal === 'solicitud_cambio' ? styles.solicitudEnviadaBtn : ''
                                    }`}
                                onClick={handleBotonPrincipal}
                                disabled={estadoLocal === 'rechazado' || estadoLocal === 'solicitud_cambio' || isLoading}
                            >
                                {isLoading ? 'Procesando...' : getTextoBotonPrincipal()}
                            </button>
                            <button
                                className={styles.detallesBtn}
                                onClick={handleVerDetalles}
                                disabled={isLoading}
                            >
                                Ver Detalles
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showResponderModal && estadoLocal === 'pendiente' && (
                <ResponderInvitacionModal
                    actividad={actividad}
                    onClose={handleCloseResponderModal}
                    onSubmit={handleRespuestaSubmit}
                />
            )}

            {showModal && estadoLocal === 'aceptado' && (
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