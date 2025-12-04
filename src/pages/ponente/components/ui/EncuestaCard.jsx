import React, { useState } from 'react';
import styles from '../styles/EncuestaCard.module.css';

const EncuestaCard = ({ encuesta, onEdit, onDelete, onEnviar, onVerEstadisticas }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Función para obtener color según estado
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'borrador': return '#6b7280';
            case 'activa': return '#059669';
            case 'cerrada': return '#dc2626';
            default: return '#6b7280';
        }
    };

    const getEstadoText = (estado) => {
        switch (estado) {
            case 'borrador': return 'Borrador';
            case 'activa': return 'Activa';
            case 'cerrada': return 'Cerrada';
            default: return estado;
        }
    };

    const getTipoText = (tipo) => {
        switch (tipo) {
            case 'pre_actividad': return 'Pre-Actividad';
            case 'durante_actividad': return 'Durante Actividad';
            case 'post_actividad': return 'Post-Actividad';
            default: return tipo;
        }
    };

    const getMomentoText = (momento) => {
        switch (momento) {
            case 'antes': return 'Pre-Actividad';
            case 'durante': return 'Durante Actividad';
            case 'despues': return 'Post-Actividad';
            default: return momento;
        }
    };

    // Calcular respuestas
    const totalRespuestas = encuesta.respuestas?.length || 0;
    const completadas = encuesta.respuestas?.filter(r => r.estado === 'completada').length || 0;
    const tasaRespuesta = totalRespuestas > 0 ? ((completadas / totalRespuestas) * 100).toFixed(1) : 0;

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onEdit(encuesta);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onDelete(encuesta.id);
    };

    const handleEnviar = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onEnviar(encuesta.id);
    };

    const handleVerEstadisticas = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onVerEstadisticas(encuesta);
    };

    return (
        <div
            className={styles.encuestaCard}
            style={{
                borderLeftColor: getEstadoColor(encuesta.estado),
                borderLeftWidth: '4px'
            }}
        >
            {/* Card Header */}
            <div className={styles.cardHeader}>
                <div className={styles.cardHeaderContent}>
                    <div className={styles.cardTitleSection}>
                        <h3 className={styles.encuestaTitulo}>
                            {encuesta.titulo}
                        </h3>
                        <div className={styles.badges}>
                            <span
                                className={styles.tipoBadge}
                                style={{
                                    backgroundColor: encuesta.estado === 'activa' ? '#2C5F7C' :
                                        encuesta.estado === 'cerrada' ? '#dc2626' : '#6b7280'
                                }}
                            >
                                {getTipoText(encuesta.tipo_encuesta)}
                            </span>

                            {encuesta.obligatoria && (
                                <span className={styles.obligatoriaBadge}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginRight: '4px' }}>
                                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Obligatoria
                                </span>
                            )}

                            <span className={`${styles.estadoBadge} ${encuesta.estado === 'completada' ? styles.estadoCompletada :
                                encuesta.estado === 'pendiente' ? styles.estadoPendiente :
                                    styles.estadoNoEnviada
                                }`}>
                                {getEstadoText(encuesta.estado)}
                            </span>
                        </div>
                    </div>

                    <div className={styles.cardActions}>
                        {encuesta.estado === 'activa' && (
                            <button
                                className={`${styles.btnAccion} ${styles.btnEnviar}`}
                                onClick={handleEnviar}
                                title="Enviar encuesta a todos los asistentes"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px' }}>
                                    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                                        stroke="currentColor" strokeWidth="2"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Enviar
                            </button>
                        )}

                        <div className={styles.menuContainer}>
                            <button
                                className={styles.menuButton}
                                onClick={handleMenuToggle}
                                aria-label="Opciones"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="6" r="2" fill="#6b7280" />
                                    <circle cx="12" cy="12" r="2" fill="#6b7280" />
                                    <circle cx="12" cy="18" r="2" fill="#6b7280" />
                                </svg>
                            </button>

                            {isMenuOpen && (
                                <div className={styles.menuDropdown}>
                                    <button className={styles.menuItem} onClick={handleEdit}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                                stroke="currentColor" strokeWidth="2" />
                                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Editar
                                    </button>
                                    <button className={`${styles.menuItem} ${styles.deleteItem}`} onClick={handleDelete}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                                            <path d="M3 6H21M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6"
                                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className={styles.cardContent}>
                {encuesta.descripcion && (
                    <div className={styles.descripcion}>
                        <p>{encuesta.descripcion}</p>
                    </div>
                )}

                <div className={styles.detalles}>
                    <div className={styles.detalleItem}>
                        <span className={styles.detalleLabel}>Asociada a:</span>
                        <span className={styles.detalleValue}>
                            Actividad específica
                        </span>
                    </div>

                    {encuesta.fecha_inicio && encuesta.fecha_fin && (
                        <div className={styles.detalleItem}>
                            <span className={styles.detalleLabel}>Período:</span>
                            <span className={styles.detalleValue}>
                                {new Date(encuesta.fecha_inicio).toLocaleDateString()} - {new Date(encuesta.fecha_fin).toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    <div className={styles.detalleItem}>
                        <span className={styles.detalleLabel}>Momento:</span>
                        <span className={styles.detalleValue}>
                            {getMomentoText(encuesta.momento)}
                        </span>
                    </div>
                </div>

                {/* Respuestas info */}
                {encuesta.estado === 'activa' && totalRespuestas > 0 && (
                    <div className={styles.respuestasInfo}>
                        <div className={styles.respuestasStats}>
                            <span>{completadas} de {totalRespuestas} completadas</span>
                            <span className={styles.tasaRespuesta}>
                                ({tasaRespuesta}% tasa de respuesta)
                            </span>
                        </div>
                        <button
                            className={`${styles.btnAccion} ${styles.btnVerEstadisticas}`}
                            onClick={handleVerEstadisticas}
                        >
                            Ver Estadísticas
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EncuestaCard;