import React, { useState } from 'react';
import styles from './Encuestas.module.css';

const EncuestaModal = ({
    encuesta,
    tipoTexto,
    estado,
    onClose,
    onCompletar,
    confirmandoCompletar,
    color,
    esEncuestaEvento = false,
    eventoNombre = '',
    idAsistente = null
}) => {
    const esCompletada = estado.estado === 'completada';
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const handleAccederFormulario = () => {
        window.open(encuesta.url_google_form, '_blank');
        if (!esCompletada) {
            setMostrarConfirmacion(true);
        }
    };

    const handleConfirmarCompletar = () => {
        onCompletar();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {esCompletada ? 'Encuesta Completada' : encuesta.titulo}
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {!mostrarConfirmacion ? (
                        <>
                            <div className={styles.modalInfo}>
                                <div className={styles.modalBadges}>
                                    <span
                                        className={styles.modalTipo}
                                        style={{ backgroundColor: color }}
                                    >
                                        {tipoTexto}
                                    </span>
                                    {encuesta.obligatoria && (
                                        <span className={styles.modalObligatoria}>Obligatoria</span>
                                    )}
                                    <span className={`${styles.modalEstado} ${esCompletada ? styles.estadoCompletada : styles.estadoPendiente
                                        }`}>
                                        {esCompletada ? 'Completada' : ' Pendiente'}
                                    </span>
                                </div>

                                <div className={styles.modalDescripcion}>
                                    <h4>Descripción:</h4>
                                    <p>{encuesta.descripcion || 'Sin descripción adicional'}</p>
                                </div>

                                <div className={styles.modalDetalles}>
                                    <h4>Detalles:</h4>
                                    <div className={styles.detalleGrid}>
                                        <div className={styles.detalleItem}>
                                            <span className={styles.detalleLabel}>Período:</span>
                                            <span className={styles.detalleValue}>
                                                {encuesta.fecha_inicio ? new Date(encuesta.fecha_inicio).toLocaleDateString() : 'Sin fecha'}
                                                {encuesta.fecha_fin && ` - ${new Date(encuesta.fecha_fin).toLocaleDateString()}`}
                                            </span>
                                        </div>

                                        {encuesta.respuestas?.[0]?.fecha_envio && (
                                            <div className={styles.detalleItem}>
                                                <span className={styles.detalleLabel}>Enviada:</span>
                                                <span className={styles.detalleValue}>
                                                    {new Date(encuesta.respuestas[0].fecha_envio).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        {esCompletada && encuesta.respuestas?.[0]?.fecha_completado && (
                                            <div className={styles.detalleItem}>
                                                <span className={styles.detalleLabel}>Completada:</span>
                                                <span className={styles.detalleValue}>
                                                    {/* Buscar la respuesta específica del asistente */}
                                                    {(() => {
                                                        const respuestaAsistente = encuesta.respuestas?.find(
                                                            r => r.id_asistente == idAsistente
                                                        );
                                                        return respuestaAsistente?.fecha_completado
                                                            ? new Date(respuestaAsistente.fecha_completado).toLocaleDateString()
                                                            : 'Fecha no disponible';
                                                    })()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalAcciones}>
                                {!esCompletada ? (
                                    <>
                                        <button
                                            className={`${styles.btnModal} ${styles.btnAccederModal}`}
                                            onClick={handleAccederFormulario}
                                            style={{ backgroundColor: color }}
                                        >
                                            Acceder al Formulario Google
                                        </button>
                                        <p className={styles.instrucciones}>
                                            Haz clic en el botón para abrir el formulario de Google.
                                            Una vez que completes el formulario, regresa aquí para marcar como completada.
                                        </p>
                                    </>
                                ) : (
                                    <div className={styles.completadaContainer}>
                                        <div className={styles.completadaMensaje}>
                                            <div>
                                                <h4>Encuesta Completada</h4>
                                                <p>Has completado exitosamente esta encuesta.</p>
                                            </div>
                                        </div>
                                        <button
                                            className={`${styles.btnModal} ${styles.btnVerFormulario}`}
                                            onClick={() => window.open(encuesta.url_google_form, '_blank')}
                                        >
                                            Ver Formulario
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className={styles.confirmacionContainer}>
                            <h3>¿Completaste el formulario exitosamente?</h3>
                            <p className={styles.confirmacionTexto}>
                                Por favor confirma que has terminado de completar el formulario de Google.
                                Una vez confirmado, tu respuesta será registrada como completada.
                            </p>

                            <div className={styles.confirmacionAcciones}>
                                <button
                                    className={`${styles.btnModal} ${styles.btnCancelar}`}
                                    onClick={() => setMostrarConfirmacion(false)}
                                    disabled={confirmandoCompletar}
                                >
                                    Volver
                                </button>
                                <button
                                    className={`${styles.btnModal} ${styles.btnConfirmar}`}
                                    onClick={handleConfirmarCompletar}
                                    disabled={confirmandoCompletar}
                                    style={{ backgroundColor: color }}
                                >
                                    {confirmandoCompletar ? (
                                        <>
                                            <span className={styles.spinnerSmall}></span>
                                            Confirmando...
                                        </>
                                    ) : (
                                        'Sí, completé el formulario'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EncuestaModal;