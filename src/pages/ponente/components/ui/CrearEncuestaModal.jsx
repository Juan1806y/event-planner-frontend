import React, { useState, useEffect, useMemo } from 'react';
import styles from '../styles/CrearEncuestaModal.module.css';

const CrearEncuestaModal = ({
    eventoId,
    actividadId,
    onClose,
    onConfirm,
    eventos = [],
    encuestaEdit = null
}) => {
    const [formData, setFormData] = useState({
        titulo: '',
        tipo_encuesta: '',
        momento: '',
        url_google_form: '',
        url_respuestas: '',
        estado: 'borrador',
        fecha_inicio: '',
        fecha_fin: '',
        id_evento: eventoId || '',
        id_actividad: actividadId || '',
        obligatoria: false,
        descripcion: ''
    });

    const [errores, setErrores] = useState({});
    const [validando, setValidando] = useState(false);
    const [mostrarCamposOpcionales, setMostrarCamposOpcionales] = useState(false);

    // Tipos de encuesta (solo para actividades)
    const tiposEncuesta = [
        { value: 'pre_actividad', label: 'Pre-Actividad' },
        { value: 'durante_actividad', label: 'Durante Actividad' },
        { value: 'post_actividad', label: 'Post-Actividad' }
    ];

    // Momentos
    const momentos = [
        { value: 'antes', label: 'Antes' },
        { value: 'durante', label: 'Durante' },
        { value: 'despues', label: 'Después' }
    ];

    // Estados
    const estados = [
        { value: 'borrador', label: 'Borrador' },
        { value: 'activa', label: 'Activa' },
        { value: 'cerrada', label: 'Cerrada' }
    ];

    // Obtener actividades filtradas por el evento seleccionado
    const actividadesFiltradas = useMemo(() => {
        if (!formData.id_evento) return [];

        const eventoSeleccionado = eventos.find(e => e.id == formData.id_evento);
        console.log('🔍 Evento seleccionado:', eventoSeleccionado);
        console.log('🔍 Actividades del evento:', eventoSeleccionado?.actividades);

        if (!eventoSeleccionado || !eventoSeleccionado.actividades || eventoSeleccionado.actividades.length === 0) {
            console.log('⚠️ No hay actividades para este evento');
            return [];
        }

        // Formatear las actividades para tener el formato correcto
        return eventoSeleccionado.actividades.map(actividad => ({
            id_actividad: actividad.id_actividad || actividad.id,
            titulo: actividad.titulo,
            fecha_actividad: actividad.fecha_actividad,
            id_evento: eventoSeleccionado.id
        }));
    }, [formData.id_evento, eventos]);

    // Inicializar datos si es edición
    useEffect(() => {
        if (encuestaEdit) {
            console.log('📝 Editando encuesta:', encuestaEdit);
            setFormData({
                titulo: encuestaEdit.titulo || '',
                tipo_encuesta: encuestaEdit.tipo_encuesta || 'pre_actividad',
                momento: encuestaEdit.momento || 'antes',
                url_google_form: encuestaEdit.url_google_form || '',
                url_respuestas: encuestaEdit.url_respuestas || '',
                estado: encuestaEdit.estado || 'borrador',
                fecha_inicio: encuestaEdit.fecha_inicio || '',
                fecha_fin: encuestaEdit.fecha_fin || '',
                id_evento: encuestaEdit.id_evento || eventoId || '',
                id_actividad: encuestaEdit.id_actividad || actividadId || '',
                obligatoria: encuestaEdit.obligatoria || false,
                descripcion: encuestaEdit.descripcion || ''
            });
            setMostrarCamposOpcionales(true);
        } else if (eventoId || actividadId) {
            console.log('➕ Creando encuesta con IDs:', { eventoId, actividadId });
            // Si se pasa evento o actividad, llenar automáticamente
            setFormData(prev => ({
                ...prev,
                id_evento: eventoId || '',
                id_actividad: actividadId || '',
                tipo_encuesta: 'pre_actividad' // Valor por defecto
            }));
        } else {
            // Si es creación nueva, establecer valor por defecto para tipo_encuesta
            setFormData(prev => ({
                ...prev,
                tipo_encuesta: 'pre_actividad'
            }));
        }
    }, [encuestaEdit, eventoId, actividadId]);

    // Resetear actividad cuando cambia el evento (solo en creación)
    useEffect(() => {
        if (!encuestaEdit && formData.id_evento) {
            setFormData(prev => ({
                ...prev,
                id_actividad: ''
            }));
        }
    }, [formData.id_evento, encuestaEdit]);

    // Validar URL de Google Forms
    const validarGoogleFormURL = (url) => {
        const pattern = /^https:\/\/docs\.google\.com\/forms\/d\/e\/[A-Za-z0-9_-]+\/viewform$/;
        return pattern.test(url);
    };

    // Validar formulario
    const validarFormulario = () => {
        const nuevosErrores = {};

        // Título
        if (!formData.titulo.trim()) {
            nuevosErrores.titulo = 'El título es requerido';
        }

        // Evento
        if (!formData.id_evento) {
            nuevosErrores.id_evento = 'Debe seleccionar un evento';
        }

        // Actividad es obligatoria
        if (!formData.id_actividad) {
            nuevosErrores.id_actividad = 'Debe seleccionar una actividad';
        }

        // Tipo de encuesta
        if (!formData.tipo_encuesta) {
            nuevosErrores.tipo_encuesta = 'Debe seleccionar un tipo de encuesta';
        }

        // URL de Google Form
        if (!formData.url_google_form.trim()) {
            nuevosErrores.url_google_form = 'La URL del formulario es requerida';
        } else if (!validarGoogleFormURL(formData.url_google_form)) {
            nuevosErrores.url_google_form = 'URL de Google Forms inválida';
        }

        // Fechas
        if (formData.fecha_inicio && formData.fecha_fin) {
            const inicio = new Date(formData.fecha_inicio);
            const fin = new Date(formData.fecha_fin);

            if (fin < inicio) {
                nuevosErrores.fecha_fin = 'La fecha fin no puede ser anterior a la fecha inicio';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        const newFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };

        // Si cambia el evento, resetear actividad
        if (name === 'id_evento') {
            newFormData.id_actividad = '';
        }

        setFormData(newFormData);

        // Limpiar error del campo al editar
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setValidando(true);
        try {
            // Preparar datos para enviar
            const datosEnviar = { ...formData };

            // Convertir IDs a números
            datosEnviar.id_evento = parseInt(datosEnviar.id_evento);

            if (datosEnviar.id_actividad) {
                datosEnviar.id_actividad = parseInt(datosEnviar.id_actividad);
            }

            // Limpiar campos vacíos opcionales
            if (!datosEnviar.url_respuestas) {
                delete datosEnviar.url_respuestas;
            }
            if (!datosEnviar.fecha_inicio) {
                delete datosEnviar.fecha_inicio;
            }
            if (!datosEnviar.fecha_fin) {
                delete datosEnviar.fecha_fin;
            }
            if (!datosEnviar.descripcion) {
                delete datosEnviar.descripcion;
            }

            console.log('📤 Enviando datos:', datosEnviar);
            const resultado = await onConfirm(datosEnviar);
            if (resultado) {
                onClose();
            }
        } catch (error) {
            console.error('Error al guardar encuesta:', error);
        } finally {
            setValidando(false);
        }
    };

    const getEventoSeleccionado = () => {
        return eventos.find(e => e.id == formData.id_evento);
    };

    const getActividadSeleccionada = () => {
        if (!formData.id_actividad) return null;
        return actividadesFiltradas.find(a => a.id_actividad == formData.id_actividad);
    };

    console.log('🔍 Estado actual:', {
        formData,
        actividadesFiltradas,
        eventoSeleccionado: getEventoSeleccionado(),
        actividadSeleccionada: getActividadSeleccionada()
    });

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        {encuestaEdit ? 'Editar Encuesta' : 'Crear Nueva Encuesta'}
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formBody}>
                        {/* Información de la encuesta */}
                        <div className={styles.formSection}>
                            <h3 className={styles.sectionTitle}>
                                {encuestaEdit ? 'Información de la Encuesta' : 'Nueva Encuesta'}
                            </h3>

                            {/* Filtros de Evento y Actividad */}
                            <div className={styles.filtrosModal}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Evento *
                                    </label>
                                    <select
                                        name="id_evento"
                                        value={formData.id_evento}
                                        onChange={handleChange}
                                        className={`${styles.formSelect} ${errores.id_evento ? styles.inputError : ''}`}
                                    >
                                        <option value="">Selecciona un evento</option>
                                        {eventos.map(evento => (
                                            <option key={evento.id} value={evento.id}>
                                                {evento.titulo} - {new Date(evento.fecha_inicio).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                    {errores.id_evento && (
                                        <span className={styles.errorText}>{errores.id_evento}</span>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Actividad *
                                    </label>
                                    <select
                                        name="id_actividad"
                                        value={formData.id_actividad || ''}
                                        onChange={handleChange}
                                        className={`${styles.formSelect} ${errores.id_actividad ? styles.inputError : ''}`}
                                        disabled={!formData.id_evento}
                                    >
                                        <option value="">Selecciona una actividad</option>
                                        {actividadesFiltradas.map(actividad => (
                                            <option key={actividad.id_actividad} value={actividad.id_actividad}>
                                                {actividad.titulo} - {new Date(actividad.fecha_actividad).toLocaleDateString()}
                                            </option>
                                        ))}
                                    </select>
                                    {errores.id_actividad && (
                                        <span className={styles.errorText}>{errores.id_actividad}</span>
                                    )}
                                    {!errores.id_actividad && (
                                        <span className={styles.helpText}>
                                            {!formData.id_evento
                                                ? 'Selecciona un evento primero'
                                                : actividadesFiltradas.length === 0
                                                    ? 'Este evento no tiene actividades'
                                                    : 'Selecciona una actividad para la encuesta'
                                            }
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Información de la selección */}
                            {(formData.id_evento || formData.id_actividad) && (
                                <div className={styles.infoAsociada}>
                                    {getEventoSeleccionado() && (
                                        <div className={styles.asociacionInfo}>
                                            <span className={styles.infoLabel}>Evento seleccionado:</span>
                                            <span className={styles.infoValue}>
                                                {getEventoSeleccionado().titulo}
                                            </span>
                                        </div>
                                    )}
                                    {formData.id_actividad && getActividadSeleccionada() && (
                                        <div className={styles.asociacionInfo}>
                                            <span className={styles.infoLabel}>Actividad seleccionada:</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Título */}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    Título de la encuesta *
                                </label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    className={`${styles.formInput} ${errores.titulo ? styles.inputError : ''}`}
                                    maxLength="200"
                                />
                                {errores.titulo && (
                                    <span className={styles.errorText}>{errores.titulo}</span>
                                )}
                            </div>

                            {/* Tipo y Momento */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Tipo de encuesta *
                                    </label>
                                    <select
                                        name="tipo_encuesta"
                                        value={formData.tipo_encuesta}
                                        onChange={handleChange}
                                        className={`${styles.formSelect} ${errores.tipo_encuesta ? styles.inputError : ''}`}
                                    >
                                        <option value="">Selecciona un tipo</option>
                                        {tiposEncuesta.map(tipo => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errores.tipo_encuesta && (
                                        <span className={styles.errorText}>{errores.tipo_encuesta}</span>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Momento *
                                    </label>
                                    <select
                                        name="momento"
                                        value={formData.momento}
                                        onChange={handleChange}
                                        className={styles.formSelect}
                                    >
                                        <option value="">Selecciona un momento</option>
                                        {momentos.map(momento => (
                                            <option key={momento.value} value={momento.value}>
                                                {momento.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* URL Google Form */}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    URL de Google Forms *
                                </label>
                                <input
                                    type="url"
                                    name="url_google_form"
                                    value={formData.url_google_form}
                                    onChange={handleChange}
                                    className={`${styles.formInput} ${errores.url_google_form ? styles.inputError : ''}`}
                                    placeholder="https://docs.google.com/forms/d/e/{FORM_ID}/viewform"
                                />
                                {errores.url_google_form ? (
                                    <span className={styles.errorText}>{errores.url_google_form}</span>
                                ) : (
                                    <span className={styles.helpText}>
                                        Formato requerido: https://docs.google.com/forms/d/e/ID_FORMULARIO/viewform
                                    </span>
                                )}
                            </div>

                            {/* Descripción */}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    Descripción
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    className={styles.formTextarea}
                                    placeholder="Describe el propósito de esta encuesta..."
                                    rows="3"
                                />
                            </div>

                            {/* Campos opcionales */}
                            <button
                                type="button"
                                className={styles.toggleOpcionales}
                                onClick={() => setMostrarCamposOpcionales(!mostrarCamposOpcionales)}
                            >
                                {mostrarCamposOpcionales ? 'Ocultar' : 'Mostrar'} campos opcionales
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    style={{ transform: mostrarCamposOpcionales ? 'rotate(180deg)' : 'none' }}>
                                    <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {mostrarCamposOpcionales && (
                                <div className={styles.camposOpcionales}>
                                    {/* URL de respuestas */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            URL de Google Sheets (Respuestas)
                                        </label>
                                        <input
                                            type="url"
                                            name="url_respuestas"
                                            value={formData.url_respuestas}
                                            onChange={handleChange}
                                            className={styles.formInput}
                                            placeholder="https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit"
                                        />
                                        <span className={styles.helpText}>
                                            Opcional - URL donde se almacenan las respuestas
                                        </span>
                                    </div>

                                    {/* Estado */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Estado
                                        </label>
                                        <select
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleChange}
                                            className={styles.formSelect}
                                        >
                                            {estados.map(estado => (
                                                <option key={estado.value} value={estado.value}>
                                                    {estado.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Fechas */}
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>
                                                Fecha de inicio
                                            </label>
                                            <input
                                                type="date"
                                                name="fecha_inicio"
                                                value={formData.fecha_inicio}
                                                onChange={handleChange}
                                                className={styles.formInput}
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>
                                                Fecha de fin
                                            </label>
                                            <input
                                                type="date"
                                                name="fecha_fin"
                                                value={formData.fecha_fin}
                                                onChange={handleChange}
                                                className={`${styles.formInput} ${errores.fecha_fin ? styles.inputError : ''}`}
                                            />
                                            {errores.fecha_fin && (
                                                <span className={styles.errorText}>{errores.fecha_fin}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Obligatoria */}
                                    <div className={styles.formGroup}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                name="obligatoria"
                                                checked={formData.obligatoria}
                                                onChange={handleChange}
                                                className={styles.checkboxInput}
                                            />
                                            <span className={styles.checkboxCustom}></span>
                                            Encuesta obligatoria
                                        </label>
                                        <span className={styles.helpText}>
                                            Los asistentes deberán completar esta encuesta
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            className={styles.btnCancelar}
                            onClick={onClose}
                            disabled={validando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.btnConfirmar}
                            disabled={validando}
                        >
                            {validando ? (
                                <>
                                    <span className={styles.spinnerSmall}></span>
                                    {encuestaEdit ? 'Actualizando...' : 'Creando...'}
                                </>
                            ) : (
                                encuestaEdit ? 'Actualizar Encuesta' : 'Crear Encuesta'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearEncuestaModal;