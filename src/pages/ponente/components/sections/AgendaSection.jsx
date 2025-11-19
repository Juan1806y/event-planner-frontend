import { useState, useEffect } from 'react';
import { usePonenteAgenda } from '../../hooks/usePonenteAgenda';
import styles from '../styles/AgendaSection.module.css';

const AgendaSection = ({ evento }) => {
    const { 
        cargarAgendaPorEvento, 
        loading, 
        error 
    } = usePonenteAgenda();
    
    const [agenda, setAgenda] = useState([]);

    useEffect(() => {
        if (evento) {
            loadAgendaEvento();
        }
    }, [evento]);

    const loadAgendaEvento = async () => {
        try {
            const actividades = await cargarAgendaPorEvento(evento.id);
            setAgenda(actividades);
        } catch (err) {
            console.error('Error cargando agenda del evento:', err);
        }
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!evento) {
        return (
            <div className={styles.agenda}>
                <div className={styles.emptyState}>
                    <h2>Mis Agendas</h2>
                    <p>Selecciona un evento para ver tu agenda</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className={styles.loading}>Cargando agenda...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.agenda}>
            <div className={styles.header}>
                <h2>Agenda - {evento.nombre}</h2>
                <button onClick={loadAgendaEvento} className={styles.refreshBtn}>
                    Actualizar
                </button>
            </div>

            {agenda.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No tienes actividades asignadas en este evento.</p>
                </div>
            ) : (
                <div className={styles.agendaTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora Inicio</th>
                                <th>Hora Fin</th>
                                <th>Actividad</th>
                                <th>Tipo</th>
                                <th>Ubicación</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agenda.map((item, index) => (
                                <tr key={index}>
                                    <td>{new Date(item.actividad.fecha_actividad).toLocaleDateString('es-ES')}</td>
                                    <td>{formatTime(item.actividad.hora_inicio)}</td>
                                    <td>{formatTime(item.actividad.hora_fin)}</td>
                                    <td className={styles.actividadTitle}>{item.actividad.titulo}</td>
                                    <td>
                                        <span className={styles.tipoBadge}>{item.actividad.tipo}</span>
                                    </td>
                                    <td>{item.actividad.ubicacion || 'Por asignar'}</td>
                                    <td className={styles.descripcion}>
                                        {item.actividad.descripcion || 'Sin descripción'}
                                    </td>
                                    <td>
                                        <span className={`${styles.estadoBadge} ${styles[item.estado]}`}>
                                            {item.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AgendaSection;