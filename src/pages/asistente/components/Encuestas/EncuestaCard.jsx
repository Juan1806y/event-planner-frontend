import React from 'react';
import styles from './Encuestas.module.css';

const EncuestaCard = ({
    encuesta,
    color,
    tipoTexto,
    estado,
    onAcceder,
    onCompletar,
    loading,
    esEncuestaEvento = false,
    eventoNombre = ''
}) => {
    const esObligatoria = encuesta.obligatoria;
    const esCompletada = estado.estado === 'completada';
    const esPendiente = estado.estado === 'pendiente';

    const esEncuestaActividad = encuesta.id_actividad !== null;
    const esEncuestaSatisfaccion = encuesta.tipo_encuesta === 'satisfaccion_evento';

    const getEstadoStyles = () => {
        if (esCompletada) return styles.estadoCompletada;
        if (esPendiente) return styles.estadoPendiente;
        return styles.estadoNoEnviada;
    };

    const getEstadoTexto = () => {
        if (esCompletada) return 'Completada';
        if (esPendiente) return ' Pendiente';
        return 'No enviada';
    };

    return (
        <div className={styles.encuestaCard}>
            <div
                className={styles.cardHeader}
                style={{ backgroundColor: color + '20', borderLeftColor: color }}
            >
                <div className={styles.cardHeaderContent}>
                    <div className={styles.cardTitleSection}>
                        <h3 className={styles.encuestaTitulo}>{encuesta.titulo}</h3>
                        <div className={styles.badges}>
                            <span
                                className={styles.tipoBadge}
                                style={{ backgroundColor: color }}
                            >
                                {tipoTexto}
                            </span>
                            {esObligatoria && (
                                <span className={styles.obligatoriaBadge}>Obligatoria</span>
                            )}
                        </div>
                    </div>
                    <div className={`${styles.estadoBadge} ${getEstadoStyles()}`}>
                        {getEstadoTexto()}
                    </div>
                </div>
            </div>

            <div className={styles.cardContent}>
                <div className={styles.descripcion}>
                    <p>{encuesta.descripcion || 'Sin descripción'}</p>
                </div>

                <div className={styles.detalles}>
                    <div className={styles.detalleItem}>
                        <span className={styles.detalleLabel}>Asociada a:</span>
                        <span className={styles.detalleValue}>
                            {esEncuestaSatisfaccion
                                ? 'Todo el evento'
                                : esEncuestaActividad
                                    ? 'Actividad específica'
                                    : 'No especificado'
                            }
                        </span>
                    </div>
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
                                {new Date(encuesta.respuestas[0].fecha_completado).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>

                <div className={styles.acciones}>
                    {!esCompletada ? (
                        <button
                            className={`${styles.btnAccion} ${styles.btnAcceder}`}
                            onClick={onAcceder}
                            disabled={loading}
                        >
                            {esPendiente ? 'Continuar Encuesta' : 'Acceder a Encuesta'}
                        </button>
                    ) : (
                        <div className={styles.completadaInfo}>
                            <span className={styles.completadaTexto}>Encuesta completada</span>
                            <button
                                className={`${styles.btnAccion} ${styles.btnVerRespuesta}`}
                                onClick={onAcceder}
                            >
                                Ver Respuesta
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EncuestaCard;