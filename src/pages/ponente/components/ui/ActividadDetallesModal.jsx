import { useEffect, useState } from 'react';
import styles from '../styles/EventModal.module.css';

const ActividadDetallesModal = ({ actividadId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detalle, setDetalle] = useState(null);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('access_token');
                const API_BASE = (window.__env && window.__env.REACT_APP_API_URL) || 'http://localhost:3000';

                const res = await fetch(`${API_BASE}/api/actividades/${actividadId}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `Error ${res.status}`);
                }

                const json = await res.json();
                setDetalle(json.data || json);
            } catch (err) {
                console.error('Error cargando detalle de actividad:', err);
                setError(err.message || 'Error cargando detalle');
            } finally {
                setLoading(false);
            }
        };

        fetchDetalle();
    }, [actividadId]);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>Detalle de Actividad</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.modalBody} style={{ padding: '16px' }}>
                    {loading && <p>Cargando...</p>}
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    {detalle && (
                        <div>
                            <h3 style={{ marginTop: 0 }}>{detalle.titulo || detalle.nombre}</h3>
                            <p><strong>Descripción:</strong> {detalle.descripcion || 'No disponible'}</p>
                            <p><strong>Materiales:</strong> {detalle.materiales || 'No disponibles'}</p>
                            <p><strong>Fecha:</strong> {detalle.fecha_actividad || detalle.fecha}</p>
                            <p><strong>Horario:</strong> {detalle.hora_inicio ? `${detalle.hora_inicio.substring(0,5)} - ${detalle.hora_fin?.substring(0,5) || ''}` : 'No definido'}</p>
                            <p><strong>Ubicación:</strong> {detalle.ubicacion || 'No definida'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActividadDetallesModal;
