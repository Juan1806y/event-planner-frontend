import { useState } from 'react';
import styles from '../styles/SolicitudCambioModal.module.css';

const SolicitudCambioModal = ({ actividad, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        cambios_solicitados: {
            hora_inicio: actividad.hora_inicio || '',
            hora_fin: actividad.hora_fin || '',
            fecha: actividad.fecha ? actividad.fecha.split('T')[0] : ''
        },
        tipo_cambio: [],
        justificacion: ''
    });

    const handleInputChange = (field, value) => {
        if (field.startsWith('cambios_solicitados.')) {
            const subField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                cambios_solicitados: {
                    ...prev.cambios_solicitados,
                    [subField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const cambiosSolicitados = Object.values(formData.cambios_solicitados).some(val => val !== '');

        if (!cambiosSolicitados && formData.tipo_cambio.length === 0) {
            alert('Por favor, especifica al menos un cambio solicitado');
            return;
        }

        if (!formData.justificacion.trim()) {
            alert('Por favor, proporciona una justificación para el cambio');
            return;
        }

        onSubmit(formData);
    };

    const toggleTipo = (tipo) => {
        setFormData(prev => {
            const tipos = new Set(prev.tipo_cambio || []);
            if (tipos.has(tipo)) tipos.delete(tipo);
            else tipos.add(tipo);
            return { ...prev, tipo_cambio: Array.from(tipos) };
        });
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>Solicitar Cambio de Actividad</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formSection}>
                        <h3>Cambios Solicitados</h3>

                        <div className={styles.formGroup}>
                            <label>Nueva Fecha:</label>
                            <input
                                type="date"
                                value={formData.cambios_solicitados.fecha}
                                onChange={(e) => handleInputChange('cambios_solicitados.fecha', e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Nueva Hora de Inicio:</label>
                            <input
                                type="time"
                                value={formData.cambios_solicitados.hora_inicio}
                                onChange={(e) => handleInputChange('cambios_solicitados.hora_inicio', e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Nueva Hora de Fin:</label>
                            <input
                                type="time"
                                value={formData.cambios_solicitados.hora_fin}
                                onChange={(e) => handleInputChange('cambios_solicitados.hora_fin', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h3>Tipo de cambio</h3>
                        <div className={styles.formGroup}>
                            <label>Selecciona el/los tipo(s) de cambio:</label>
                            <div className={styles.checkboxRow}>
                                <label>
                                    <input type="checkbox" checked={formData.tipo_cambio.includes('titulo')} onChange={() => toggleTipo('titulo')} /> Título
                                </label>
                                <label>
                                    <input type="checkbox" checked={formData.tipo_cambio.includes('materiales')} onChange={() => toggleTipo('materiales')} /> Materiales
                                </label>
                                <label>
                                    <input type="checkbox" checked={formData.tipo_cambio.includes('horario')} onChange={() => toggleTipo('horario')} /> Horario
                                </label>
                                <label>
                                    <input type="checkbox" checked={formData.tipo_cambio.includes('descripcion')} onChange={() => toggleTipo('descripcion')} /> Descripción
                                </label>
                                <label>
                                    <input type="checkbox" checked={formData.tipo_cambio.includes('ubicacion')} onChange={() => toggleTipo('ubicacion')} /> Ubicación
                                </label>
                            </div>
                        </div>

                        <h3>Justificación</h3>
                        <div className={styles.formGroup}>
                            <label>Explica por qué necesitas este cambio:</label>
                            <textarea
                                value={formData.justificacion}
                                onChange={(e) => handleInputChange('justificacion', e.target.value)}
                                placeholder="Describe los motivos para solicitar el cambio (conflicto de horario, disponibilidad, etc.)"
                                rows="4"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton}>
                            Enviar Solicitud
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SolicitudCambioModal;