import { useState, useEffect } from 'react';  // ← Agrega useEffect
import styles from '../styles/SolicitudCambioModal.module.css';
import { API_PREFIX } from '../../../../config/apiConfig';
const API_BASE = API_PREFIX;

const SolicitudCambioModal = ({ actividad, onClose, onSubmit }) => {
    // DEBUG: Ver qué datos llegan realmente
    console.log('Datos recibidos en modal (RAW):', actividad);

    // Estado para cargar los datos completos
    const [actividadCompleta, setActividadCompleta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarActividadCompleta = async () => {
            try {
                setLoading(true);

                // Si ya tenemos los datos completos (con lugares), usarlos
                if (actividad?.lugares || actividad?.actividad?.lugares) {
                    console.log('Ya tiene lugares, usando datos directamente');
                    setActividadCompleta(actividad);
                    setLoading(false);
                    return;
                }

                // Si no, necesitamos obtener los datos completos
                console.log('Obteniendo datos completos de la actividad...');

                // Obtener el token
                const token = localStorage.getItem('access_token');
                if (!token) {
                    throw new Error('No hay token de autenticación');
                }

                // Obtener IDs
                const ponenteId = actividad?.id_ponente;
                const actividadId = actividad?.id_actividad || actividad?.id;

                if (!ponenteId || !actividadId) {
                    throw new Error('Faltan IDs para obtener los datos completos');
                }

                // Hacer la petición para obtener datos completos
                const response = await fetch(
                    `${API_BASE}/ponente-actividad/${ponenteId}/${actividadId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();

                if (result.success && result.data?.actividad) {
                    console.log('Datos completos obtenidos:', result.data.actividad);
                    setActividadCompleta(result.data.actividad);
                } else {
                    // Si no podemos obtener datos completos, usar los que tenemos
                    console.log('Usando datos disponibles (sin lugares)');
                    setActividadCompleta(actividad);
                }

            } catch (error) {
                console.error('Error al cargar actividad completa:', error);
                setError(error.message);
                // Usar los datos que tenemos aunque sean incompletos
                setActividadCompleta(actividad);
            } finally {
                setLoading(false);
            }
        };

        cargarActividadCompleta();
    }, [actividad]);

    const [formData, setFormData] = useState({
        cambios_solicitados: {
            fecha_actividad: '',
            hora_inicio: '',
            hora_fin: '',
            titulo: '',
            descripcion: '',
            ubicacion: ''
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
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        const year = adjustedDate.getFullYear();
        const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
        const day = String(adjustedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDateForDisplay(dateString) {
        if (!dateString) return 'No definida';
        const date = new Date(dateString);
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

        return adjustedDate.toLocaleDateString('es-ES', {
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

        const cambiosSolicitados = Object.entries(formData.cambios_solicitados)
            .some(([key, value]) => {
                if (value && value.trim() !== '') {
                    return true;
                }
                return false;
            });

        if (!cambiosSolicitados) {
            newErrors.cambios = 'Por favor, especifica al menos un cambio solicitado';
        }

        if (cambiosSolicitados) {
            if (!formData.justificacion || !formData.justificacion.trim()) {
                newErrors.justificacion = 'Por favor, proporciona una justificación para el cambio';
            } else if (formData.justificacion.trim().length < 10) {
                newErrors.justificacion = 'La justificación debe tener al menos 10 caracteres';
            }
        }

        if ((formData.cambios_solicitados.hora_inicio && !formData.cambios_solicitados.hora_fin) ||
            (!formData.cambios_solicitados.hora_inicio && formData.cambios_solicitados.hora_fin)) {
            newErrors.horario = 'Si modificas el horario, debes especificar tanto la hora de inicio como la de fin';
        }

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

            const datosEnvio = {
                cambios_solicitados: cambiosFiltrados,
                tipo_cambio: formData.tipo_cambio,
                justificacion: justificacion
            };

            console.log('Datos a enviar:', datosEnvio);

            await onSubmit(datosEnvio);

            showAlert('Tu solicitud de cambio ha sido enviada para revisión', 'success');

            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error al enviar solicitud:', error);

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

    const getUbicacionCompleta = (actividad) => {
        if (!actividad) return 'No asignada';

        // Intentar obtener lugares de diferentes formas
        const lugares = actividad.lugares || actividad.actividad?.lugares;

        if (!lugares || lugares.length === 0) {
            return 'No asignada';
        }

        const lugar = lugares[0];
        const partes = [];

        // Nombre del lugar (ej: AG-404)
        if (lugar.nombre?.trim()) {
            partes.push(lugar.nombre.trim());
        }

        // Información de ubicación
        if (lugar.ubicacion) {
            if (lugar.ubicacion.lugar?.trim()) {
                partes.push(lugar.ubicacion.lugar.trim());
            }
            if (lugar.ubicacion.direccion?.trim()) {
                partes.push(lugar.ubicacion.direccion.trim());
            }
        }

        // Descripción del lugar
        if (lugar.descripcion?.trim()) {
            partes.push(lugar.descripcion.trim());
        }

        return partes.length > 0 ? partes.join(' - ') : 'No asignada';
    };

    const getValorActual = (campo) => {
        // Usar actividadCompleta si está disponible, sino usar actividad
        const datos = actividadCompleta || actividad;

        switch (campo) {
            case 'fecha_actividad':
                // Intentar obtener fecha de diferentes formas
                const fecha = datos?.fecha_actividad || datos?.fecha;
                return formatDateForDisplay(fecha);
            case 'hora_inicio':
                return datos?.hora_inicio ? datos.hora_inicio.substring(0, 5) : 'No definida';
            case 'hora_fin':
                return datos?.hora_fin ? datos.hora_fin.substring(0, 5) : 'No definida';
            case 'titulo':
                // Intentar obtener título de diferentes formas
                return datos?.titulo || datos?.nombre || 'No definido';
            case 'descripcion':
                return datos?.descripcion || 'No disponible';
            case 'ubicacion':
                return getUbicacionCompleta(datos);
            default:
                return 'No disponible';
        }
    };

    const clearField = (field) => {
        handleInputChange(`cambios_solicitados.${field}`, '');
    };

    // Mostrar loading mientras se cargan datos
    if (loading) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                    <div className={styles.modalHeader}>
                        <h2>Solicitar Cambio de Actividad</h2>
                        <button className={styles.closeButton} onClick={onClose}>×</button>
                    </div>
                    <div className={styles.loading}>
                        Cargando información de la actividad...
                    </div>
                </div>
            </div>
        );
    }

    // Si hay error
    if (error) {
        console.warn('Error al cargar datos completos:', error);
        // Continuamos con los datos disponibles
    }

    return (
        <div className={styles.modalOverlay}>
            {/* ... (el resto del JSX se mantiene igual) ... */}
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>Solicitar Cambio de Actividad</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
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
                            {error && (
                                <p className={styles.warning}>
                                    <small>Nota: No se pudieron cargar todos los detalles de la actividad</small>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h3>Cambios Solicitados</h3>
                        <p className={styles.helpText}>
                            Completa solo los campos que deseas modificar. No es necesario completar todos.
                        </p>

                        {errors.cambios && (
                            <div className={styles.errorMessage}>
                                {errors.cambios}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <div className={styles.fieldHeader}>
                                <label>Nueva Fecha:</label>
                                {formData.cambios_solicitados.fecha_actividad && (
                                    <button
                                        type="button"
                                        className={styles.clearButton}
                                        onClick={() => clearField('fecha_actividad')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
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
                                <div className={styles.fieldHeader}>
                                    <label>Nueva Hora de Inicio:</label>
                                    {formData.cambios_solicitados.hora_inicio && (
                                        <button
                                            type="button"
                                            className={styles.clearButton}
                                            onClick={() => clearField('hora_inicio')}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
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
                                <div className={styles.fieldHeader}>
                                    <label>Nueva Hora de Fin:</label>
                                    {formData.cambios_solicitados.hora_fin && (
                                        <button
                                            type="button"
                                            className={styles.clearButton}
                                            onClick={() => clearField('hora_fin')}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
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
                            <div className={styles.fieldHeader}>
                                <label>Nuevo Título:</label>
                                {formData.cambios_solicitados.titulo && (
                                    <button
                                        type="button"
                                        className={styles.clearButton}
                                        onClick={() => clearField('titulo')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
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
                            <div className={styles.fieldHeader}>
                                <label>Nueva Descripción:</label>
                                {formData.cambios_solicitados.descripcion && (
                                    <button
                                        type="button"
                                        className={styles.clearButton}
                                        onClick={() => clearField('descripcion')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
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
                            <div className={styles.fieldHeader}>
                                <label>Nueva Ubicación:</label>
                                {formData.cambios_solicitados.ubicacion && (
                                    <button
                                        type="button"
                                        className={styles.clearButton}
                                        onClick={() => clearField('ubicacion')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
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