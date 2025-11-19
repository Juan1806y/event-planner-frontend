import React from 'react';
import styles from './EventModal.module.css';
import { formatFecha, debugFecha } from '../../utils/dateUtils';

const EventModal = ({ evento, onClose, formatFecha, formatFechaCompleta }) => {

    // Debug para verificar toda la información del evento
    React.useEffect(() => {
        console.log('📊 Debug EventModal - Información completa:', {
            titulo: evento.titulo,
            cupo_total: evento.cupo_total,
            cupos_disponibles: evento.cupos_disponibles,
            inscritos_count: evento.inscritos_count,
            estado_evento: evento.estado_evento,
            modalidad: evento.modalidad
        });

        debugFecha(evento.fecha_inicio, 'Modal - Fecha inicio');
        debugFecha(evento.fecha_fin, 'Modal - Fecha fin');
    }, [evento]);

    // ✅ Función para formatear el número de cupos
    const formatearCupos = (valor) => {
        if (valor === undefined || valor === null) return 'No disponible';
        if (typeof valor === 'number') return valor.toString();
        return valor;
    };

    // ✅ Función para calcular porcentaje de disponibilidad
    const calcularPorcentajeDisponibilidad = () => {
        if (!evento.cupo_total || evento.cupo_total === 0) return 0;
        if (typeof evento.cupos_disponibles !== 'number') return 0;

        return Math.round((evento.cupos_disponibles / evento.cupo_total) * 100);
    };

    const porcentajeDisponible = calcularPorcentajeDisponibilidad();

    return (
        <div className={styles.modalBody}>
            <div className={styles.eventInfoGrid}>
                <div className={styles.infoSection}>
                    <h4>Información General</h4>
                    <div className={styles.infoItem}>
                        <label>Título:</label>
                        <span>{evento.titulo}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Descripción:</label>
                        <p>{evento.descripcion || 'No disponible'}</p>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Modalidad:</label>
                        <span>{evento.modalidad || 'No especificado'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Estado:</label>
                        <span>{evento.estado_evento === 'Disponible' ? 'Disponible' : 'No disponible'}</span>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h4>Fechas</h4>
                    <div className={styles.infoItem}>
                        <label>Fecha de inicio:</label>
                        <span>{formatFecha(evento.fecha_inicio)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Fecha de fin:</label>
                        <span>{formatFecha(evento.fecha_fin)}</span>
                    </div>
                    {evento.hora && (
                        <div className={styles.infoItem}>
                            <label>Hora:</label>
                            <span>{evento.hora}</span>
                        </div>
                    )}
                </div>

                <div className={styles.infoSection}>
                    <h4>Capacidad y Organización</h4>
                    <div className={styles.infoItem}>
                        <label>Cupos totales:</label>
                        <span>{formatearCupos(evento.cupo_total)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Organizador:</label>
                        <span>{evento.organizador || evento.creador?.nombre || 'No especificado'}</span>
                    </div>
                    {evento.correo_organizador && (
                        <div className={styles.infoItem}>
                            <label>Correo del organizador:</label>
                            <span>{evento.correo_organizador}</span>
                        </div>
                    )}
                    <div className={styles.infoItem}>
                        <label>Empresa:</label>
                        <span>{evento.empresa || 'No especificada'}</span>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h4>Información Adicional</h4>
                    <div className={styles.infoItem}>
                        <label>Fecha de creación:</label>
                        <span>{formatFechaCompleta(evento.fecha_creacion)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Última actualización:</label>
                        <span>{formatFechaCompleta(evento.fecha_actualizacion)}</span>
                    </div>
                    {evento.actividades && evento.actividades.length > 0 && (
                        <div className={styles.infoItem}>
                            <label>Actividades:</label>
                            <span>{evento.actividades.length} actividad(es) programada(s)</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.modalActions}>
                <button
                    className={styles.btnCancel}
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default EventModal;