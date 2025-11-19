import React from 'react';
import styles from '../styles/EventModal.module.css';
import { formatFecha, debugFecha } from '../../../asistente/utils/dateUtils';
import { safeRender } from '../../utils/objectUtils';

const EventModal = ({ evento, onClose, formatFecha, formatFechaCompleta }) => {

    // Debug para verificar toda la información del evento
    React.useEffect(() => {
        console.log('📊 Debug EventModal Ponente - Información completa:', evento);

        // Debug específico para identificar campos problemáticos
        if (evento) {
            Object.keys(evento).forEach(key => {
                const value = evento[key];
                if (value && typeof value === 'object') {
                    console.log(`⚠️ Campo problemático: ${key}`, {
                        tipo: typeof value,
                        valor: value,
                        esArray: Array.isArray(value)
                    });
                }
            });
        }
    }, [evento]);

    // ✅ Función para formatear el número de cupos
    const formatearCupos = (valor) => {
        return safeRender(valor, 'No disponible');
    };

    // ✅ Función para calcular porcentaje de disponibilidad
    const calcularPorcentajeDisponibilidad = () => {
        const cupoTotal = Number(safeRender(evento.cupo_total, 0));
        const cuposDisponibles = Number(safeRender(evento.cupos_disponibles, 0));

        if (cupoTotal === 0) return 0;
        return Math.round((cuposDisponibles / cupoTotal) * 100);
    };

    const porcentajeDisponible = calcularPorcentajeDisponibilidad();

    // Función para obtener el organizador de forma segura
    const obtenerOrganizadorSeguro = () => {
        const organizador = safeRender(evento.organizador);
        const creador = safeRender(evento.creador);

        return organizador !== 'No disponible' ? organizador :
            creador !== 'No disponible' ? creador : 'No especificado';
    };

    // Función para obtener el correo del organizador de forma segura
    const obtenerCorreoOrganizadorSeguro = () => {
        const correo = safeRender(evento.correo_organizador);
        return correo !== 'No disponible' ? correo : null;
    };

    return (
        <div className={styles.modalBody}>
            <div className={styles.modalHeader}>
                <h2 style={{ color: 'white' }}>
                    <span style={{ color: 'white' }}>{safeRender(evento.titulo)}</span>
                </h2>
            </div>

            <div className={styles.eventInfoGrid}>
                <div className={styles.infoSection}>
                    <h4>Información General</h4>
                    <div className={styles.infoItem}>
                        <label>Descripción:</label>
                        <p>{safeRender(evento.descripcion)}</p>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Modalidad:</label>
                        <span>{safeRender(evento.modalidad, 'No especificado')}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Estado:</label>
                        <span>{safeRender(evento.estado_evento) === 'Disponible' ? 'Disponible' : 'No disponible'}</span>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h4>Fechas</h4>
                    <div className={styles.infoItem}>
                        <label>Fecha de inicio:</label>
                        <span>{formatFecha(safeRender(evento.fecha_inicio))}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Fecha de fin:</label>
                        <span>{formatFecha(safeRender(evento.fecha_fin))}</span>
                    </div>
                    {evento.hora && (
                        <div className={styles.infoItem}>
                            <label>Hora:</label>
                            <span>{safeRender(evento.hora)}</span>
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
                        <span>{obtenerOrganizadorSeguro()}</span>
                    </div>
                    {obtenerCorreoOrganizadorSeguro() && (
                        <div className={styles.infoItem}>
                            <label>Correo del organizador:</label>
                            <span>{obtenerCorreoOrganizadorSeguro()}</span>
                        </div>
                    )}
                    <div className={styles.infoItem}>
                        <label>Empresa:</label>
                        <span>{safeRender(evento.empresa, 'No especificada')}</span>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <h4>Información Adicional</h4>
                    <div className={styles.infoItem}>
                        <label>Fecha de creación:</label>
                        <span>{formatFechaCompleta(safeRender(evento.fecha_creacion))}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Última actualización:</label>
                        <span>{formatFechaCompleta(safeRender(evento.fecha_actualizacion))}</span>
                    </div>
                    {evento.actividades && (
                        <div className={styles.infoItem}>
                            <label>Actividades:</label>
                            <span>{safeRender(evento.actividades)} programada(s)</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.modalActions}>
                <button
                    className={styles.btnClose}
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default EventModal;