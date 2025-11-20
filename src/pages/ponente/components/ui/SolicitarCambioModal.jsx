import { useState } from 'react';
import styles from '../styles/SolicitudCambioModal.module.css';

const SolicitudCambioModal = ({ actividad, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        cambios_solicitados: {
            fecha_actividad: actividad.fecha ? formatDateForInput(actividad.fecha) : '',
            hora_inicio: actividad.hora_inicio || '',
            hora_fin: actividad.hora_fin || '',
            titulo: actividad.nombre || actividad.titulo || '',
            descripcion: actividad.descripcion || '',
            ubicacion: actividad.ubicacion || ''
        },
        tipo_cambio: [],
        justificacion: ''
    });

    const [errors, setErrors] = useState({});
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    function formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateForDisplay(dateString) {
        if (!dateString) return 'No definida';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            timeZone: 'UTC',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const showAlert = (message, type = 'error') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);

        setTimeout(() => {
            setShowNotification(false);
        }, 5000);
    };

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

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Verificar que al menos haya un cambio solicitado
        const cambiosSolicitados = Object.entries(formData.cambios_solicitados)
            .some(([key, value]) => {
                if (key === 'fecha_actividad' && value) return true;
                if (key === 'hora_inicio' && value) return true;
                if (key === 'hora_fin' && value) return true;
                if (key === 'titulo' && value) return true;
                if (key === 'descripcion' && value) return true;
                if (key === 'ubicacion' && value) return true;
                return false;
            });

        if (!cambiosSolicitados && formData.tipo_cambio.length === 0) {
            newErrors.cambios = 'Por favor, especifica al menos un cambio solicitado';
        }

        // Validación más estricta de la justificación
        if (!formData.justificacion || !formData.justificacion.trim()) {
            newErrors.justificacion = 'Por favor, proporciona una justificación para el cambio';
        } else if (formData.justificacion.trim().length < 10) {
            newErrors.justificacion = 'La justificación debe tener al menos 10 caracteres';
        }

        // Validar que si se cambia hora_inicio, también se cambie hora_fin y viceversa
        if ((formData.cambios_solicitados.hora_inicio && !formData.cambios_solicitados.hora_fin) ||
            (!formData.cambios_solicitados.hora_inicio && formData.cambios_solicitados.hora_fin)) {
            newErrors.horario = 'Si modificas el horario, debes especificar tanto la hora de inicio como la de fin';
        }

        // Validar que la fecha no sea en el pasado
        if (formData.cambios_solicitados.fecha_actividad) {
            const selectedDate = new Date(formData.cambios_solicitados.fecha_actividad);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.fecha = 'No puedes seleccionar una fecha en el pasado';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!validateForm()) {
            showAlert('Por favor, corrige los errores en el formulario', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            const cambiosFiltrados = {};
            Object.entries(formData.cambios_solicitados).forEach(([key, value]) => {
                if (value && value.trim() !== '') {
                    cambiosFiltrados[key] = value.trim();
                }
            });

            const justificacion = formData.justificacion.trim();
            if (!justificacion) {
                showAlert('La justificación es obligatoria', 'error');
                setIsSubmitting(false);
                return;
            }

            const datosEnvio = {
                cambios_solicitados: cambiosFiltrados,
                tipo_cambio: formData.tipo_cambio,
                justificacion: justificacion
            };

            console.log('Datos a enviar:', datosEnvio);

            // Enviar la solicitud
            await onSubmit(datosEnvio);

            // Mostrar notificación de éxito personalizada
            showAlert('Tu solicitud de cambio ha sido enviada para revisión', 'success');

            // Cerrar el modal después de un tiempo
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error al enviar solicitud:', error);

            // Mostrar error específico si está disponible
            if (error.message && error.message.includes('400')) {
                showAlert('Error: La justificación es requerida o muy corta', 'error');
            } else if (error.message && error.message.includes('network')) {
                showAlert('Error de conexión. Verifica tu internet e intenta nuevamente.', 'error');
            } else {
                showAlert('Error al enviar la solicitud. Por favor, intenta nuevamente.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
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

    return (
        <div className={styles.modalOverlay}>
            {/* Notificación personalizada - ESTILO MEJORADO */}
            {showNotification && (
                <div className={`${styles.notification} ${styles[notificationType]}`}>
                    <div className={styles.notificationContent}>
                        <span className={styles.notificationIcon}>
                            {notificationType === 'success' ? '✅' : '❌'}
                        </span>
                        <span className={styles.notificationMessage}>
                            {notificationMessage}
                        </span>
                        <button
                            className={styles.notificationClose}
                            onClick={() => setShowNotification(false)}
                            aria-label="Cerrar notificación"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>Solicitar Cambio de Actividad</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar modal">×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Información de la actividad actual */}
                    <div className={styles.formSection}>
                        <h3>Actividad Actual</h3>
                        <div className={styles.currentInfo}>
                            <p><strong>Título:</strong> {getValorActual('titulo')}</p>
                            <p><strong>Fecha:</strong> {getValorActual('fecha_actividad')}</p>
                            <p><strong>Horario:</strong> {getValorActual('hora_inicio')} - {getValorActual('hora_fin')}</p>
                            <p><strong>Ubicación:</strong> {getValorActual('ubicacion')}</p>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h3>Cambios Solicitados</h3>

                        {errors.cambios && (
                            <div className={styles.errorMessage}>
                                {errors.cambios}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>Nueva Fecha:</label>
                            <input
                                type="date"
                                value={formData.cambios_solicitados.fecha_actividad}
                                onChange={(e) => handleInputChange('cambios_solicitados.fecha_actividad', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <small className={styles.helpText}>
                                Actual: {getValorActual('fecha_actividad')}
                            </small>
                            {errors.fecha && (
                                <div className={styles.errorMessage}>
                                    {errors.fecha}
                                </div>
                            )}
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Nueva Hora de Inicio:</label>
                                <input
                                    type="time"
                                    value={formData.cambios_solicitados.hora_inicio}
                                    onChange={(e) => handleInputChange('cambios_solicitados.hora_inicio', e.target.value)}
                                />
                                <small className={styles.helpText}>
                                    Actual: {getValorActual('hora_inicio')}
                                </small>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Nueva Hora de Fin:</label>
                                <input
                                    type="time"
                                    value={formData.cambios_solicitados.hora_fin}
                                    onChange={(e) => handleInputChange('cambios_solicitados.hora_fin', e.target.value)}
                                />
                                <small className={styles.helpText}>
                                    Actual: {getValorActual('hora_fin')}
                                </small>
                            </div>
                        </div>

                        {errors.horario && (
                            <div className={styles.errorMessage}>
                                {errors.horario}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>Nuevo Título:</label>
                            <input
                                type="text"
                                value={formData.cambios_solicitados.titulo}
                                onChange={(e) => handleInputChange('cambios_solicitados.titulo', e.target.value)}
                                placeholder="Nuevo título para la actividad"
                            />
                            <small className={styles.helpText}>
                                Actual: {getValorActual('titulo')}
                            </small>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Nueva Descripción:</label>
                            <textarea
                                value={formData.cambios_solicitados.descripcion}
                                onChange={(e) => handleInputChange('cambios_solicitados.descripcion', e.target.value)}
                                placeholder="Nueva descripción para la actividad"
                                rows="3"
                            />
                            <small className={styles.helpText}>
                                Actual: {getValorActual('descripcion')}
                            </small>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Nueva Ubicación:</label>
                            <input
                                type="text"
                                value={formData.cambios_solicitados.ubicacion}
                                onChange={(e) => handleInputChange('cambios_solicitados.ubicacion', e.target.value)}
                                placeholder="Nueva ubicación para la actividad"
                            />
                            <small className={styles.helpText}>
                                Actual: {getValorActual('ubicacion')}
                            </small>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h3>Justificación *</h3>
                        <div className={styles.formGroup}>
                            <label>Explica por qué necesitas este cambio:</label>
                            <textarea
                                value={formData.justificacion}
                                onChange={(e) => handleInputChange('justificacion', e.target.value)}
                                placeholder="Describe los motivos para solicitar el cambio (conflicto de horario, disponibilidad, recursos, etc.)"
                                rows="4"
                                className={errors.justificacion ? styles.error : ''}
                                required
                            />
                            {errors.justificacion && (
                                <div className={styles.errorMessage}>
                                    {errors.justificacion}
                                </div>
                            )}
                        </div>
                    </div>

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
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SolicitudCambioModal;