import { useState } from 'react';
import styles from '../styles/ResponderInvitacionModal.module.css';

const ResponderInvitacionModal = ({ actividad, onClose, onSubmit }) => {
    const [respuesta, setRespuesta] = useState('');
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'No definida';
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

        return adjustedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getValorActual = (campo) => {
        switch (campo) {
            case 'fecha_actividad':
                return formatDateForDisplay(actividad.fecha);
            case 'hora_inicio':
                return actividad.hora_inicio ? actividad.hora_inicio.substring(0, 5) : 'No definida';
            case 'hora_fin':
                return actividad.hora_fin ? actividad.hora_fin.substring(0, 5) : 'No definida';
            case 'titulo':
                return actividad.nombre || actividad.titulo || 'No definido';
            case 'descripcion':
                return actividad.descripcion || 'No disponible';
            case 'ubicacion':
                return actividad.ubicacion || 'No asignada';
            default:
                return 'No disponible';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!respuesta) {
            newErrors.respuesta = 'Por favor, selecciona una respuesta';
        }

        if (respuesta === 'rechazar' && !motivoRechazo.trim()) {
            newErrors.motivoRechazo = 'Por favor, proporciona un motivo para el rechazo';
        } else if (respuesta === 'rechazar' && motivoRechazo.trim().length < 10) {
            newErrors.motivoRechazo = 'El motivo del rechazo debe tener al menos 10 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const datosEnvio = {
                aceptar: respuesta === 'aceptar'
            };

            if (respuesta === 'rechazar') {
                datosEnvio.motivo_rechazo = motivoRechazo.trim();
            }

            await onSubmit(datosEnvio);

        } catch (error) {
            console.error('Error al enviar respuesta:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>Responder Invitación</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Información de la actividad */}
                    <div className={styles.formSection}>
                        <h3>Actividad</h3>
                        <div className={styles.currentInfo}>
                            <p><strong>Título:</strong> {getValorActual('titulo')}</p>
                            <p><strong>Fecha:</strong> {getValorActual('fecha_actividad')}</p>
                            <p><strong>Horario:</strong> {getValorActual('hora_inicio')} - {getValorActual('hora_fin')}</p>
                            <p><strong>Ubicación:</strong> {getValorActual('ubicacion')}</p>
                        </div>
                    </div>

                    {/* Selección de respuesta */}
                    <div className={styles.formSection}>
                        <h3>Tu Respuesta</h3>

                        <div className={styles.radioGroup}>
                            <label className={styles.radioOption}>
                                <input
                                    type="radio"
                                    name="respuesta"
                                    value="aceptar"
                                    checked={respuesta === 'aceptar'}
                                    onChange={(e) => setRespuesta(e.target.value)}
                                />
                                <span className={styles.radioLabel}>
                                    <span className={styles.radioTitle}>Aceptar Invitación</span>
                                    <span className={styles.radioDescription}>
                                        Confirmas tu participación en esta actividad
                                    </span>
                                </span>
                            </label>

                            <label className={styles.radioOption}>
                                <input
                                    type="radio"
                                    name="respuesta"
                                    value="rechazar"
                                    checked={respuesta === 'rechazar'}
                                    onChange={(e) => setRespuesta(e.target.value)}
                                />
                                <span className={styles.radioLabel}>
                                    <span className={styles.radioTitle}>Rechazar Invitación</span>
                                    <span className={styles.radioDescription}>
                                        No podrás participar en esta actividad
                                    </span>
                                </span>
                            </label>
                        </div>

                        {errors.respuesta && (
                            <div className={styles.errorMessage}>{errors.respuesta}</div>
                        )}
                    </div>

                    {/* Motivo de rechazo (solo si se selecciona rechazar) */}
                    {respuesta === 'rechazar' && (
                        <div className={styles.formSection}>
                            <h3>Motivo del Rechazo</h3>
                            <div className={styles.formGroup}>
                                <label>Explica por qué no puedes participar:</label>
                                <textarea
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    placeholder="Describe los motivos por los cuales no puedes participar (conflicto de horario, indisponibilidad, etc.)"
                                    rows="4"
                                    className={errors.motivoRechazo ? styles.error : ''}
                                />
                                {errors.motivoRechazo && (
                                    <div className={styles.errorMessage}>
                                        {errors.motivoRechazo}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={respuesta === 'aceptar' ? styles.acceptButton : styles.rejectButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Enviando...' : respuesta === 'aceptar' ? 'Aceptar Invitación' : 'Rechazar Invitación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResponderInvitacionModal;