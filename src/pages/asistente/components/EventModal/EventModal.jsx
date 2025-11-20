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

    const formatearCupos = (valor) => {
        if (valor === undefined || valor === null) return 'No disponible';
        if (typeof valor === 'number') return valor.toString();
        return valor;
    };

    const calcularPorcentajeDisponibilidad = () => {
        if (!evento.cupo_total || evento.cupo_total === 0) return 0;
        if (typeof evento.cupos_disponibles !== 'number') return 0;
        return Math.round((evento.cupos_disponibles / evento.cupo_total) * 100);
    };

    const obtenerActividadesOrdenadas = () => {
        if (!evento.actividades || evento.actividades.length === 0) return [];
        
        return [...evento.actividades].sort((a, b) => {
            const fechaHoraA = new Date(`${a.fecha_actividad}T${a.hora_inicio}`);
            const fechaHoraB = new Date(`${b.fecha_actividad}T${b.hora_inicio}`);
            return fechaHoraA - fechaHoraB;
        });
    };

    const formatearHora = (hora) => {
        if (!hora) return '';
        const [hours, minutes] = hora.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hora12 = h % 12 || 12;
        return `${hora12}:${minutes} ${ampm}`;
    };

    const porcentajeDisponible = calcularPorcentajeDisponibilidad();
    const actividadesOrdenadas = obtenerActividadesOrdenadas();

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
                    {actividadesOrdenadas.length > 0 && (
                        <div className={styles.infoItem}>
                            <label>Total de actividades:</label>
                            <span>{actividadesOrdenadas.length} actividad(es) programada(s)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Sección de Actividades en orden cronológico */}
            {actividadesOrdenadas.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <div className={styles.infoSection}>
                        <h4>Cronograma de Actividades</h4>
                        {actividadesOrdenadas.map((actividad, index) => (
                            <div key={actividad.id_actividad} style={{ 
                                marginBottom: index < actividadesOrdenadas.length - 1 ? '16px' : '0',
                                paddingBottom: index < actividadesOrdenadas.length - 1 ? '16px' : '0',
                                borderBottom: index < actividadesOrdenadas.length - 1 ? '1px solid #e5e7eb' : 'none'
                            }}>
                                <div style={{ 
                                    marginBottom: '12px', 
                                    paddingLeft: '8px', 
                                    borderLeft: '3px solid #2C5F7C',
                                    background: 'white',
                                    padding: '12px',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ 
                                        fontSize: '1rem', 
                                        fontWeight: '600', 
                                        color: '#2C5F7C',
                                        marginBottom: '8px'
                                    }}>
                                        {index + 1}. {actividad.titulo}
                                    </div>
                                    
                                    <div style={{ 
                                        display: 'grid', 
                                        gap: '8px',
                                        fontSize: '0.9rem'
                                    }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '600', color: '#374151', minWidth: '80px' }}>
                                                Fecha:
                                            </span>
                                            <span style={{ color: '#6b7280' }}>
                                                {formatFecha(actividad.fecha_actividad)}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '600', color: '#374151', minWidth: '80px' }}>
                                                Horario:
                                            </span>
                                            <span style={{ color: '#6b7280' }}>
                                                {formatearHora(actividad.hora_inicio)} - {formatearHora(actividad.hora_fin)}
                                            </span>
                                        </div>

                                        {actividad.lugares && actividad.lugares.length > 0 && (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '600', color: '#374151', minWidth: '80px' }}>
                                                    Lugar:
                                                </span>
                                                <span style={{ color: '#6b7280' }}>
                                                    {actividad.lugares.map(lugar => lugar.nombre).join(', ')}
                                                </span>
                                            </div>
                                        )}

                                        {actividad.descripcion && (
                                            <div style={{ marginTop: '4px' }}>
                                                <span style={{ 
                                                    fontWeight: '600', 
                                                    color: '#374151',
                                                    display: 'block',
                                                    marginBottom: '4px'
                                                }}>
                                                    Descripción:
                                                </span>
                                                <p style={{
                                                    margin: 0,
                                                    color: '#6b7280',
                                                    lineHeight: '1.5',
                                                    paddingLeft: '8px'
                                                }}>
                                                    {actividad.descripcion}
                                                </p>
                                            </div>
                                        )}

                                        {actividad.url && (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '600', color: '#374151', minWidth: '80px' }}>
                                                    Enlace:
                                                </span>
                                                <a 
                                                    href={actividad.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: '#2C5F7C',
                                                        textDecoration: 'none',
                                                        wordBreak: 'break-all'
                                                    }}
                                                >
                                                    {actividad.url}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
