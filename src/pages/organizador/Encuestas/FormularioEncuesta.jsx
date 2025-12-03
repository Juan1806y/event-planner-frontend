// FormularioEncuesta.jsx
import React from 'react';

const FormularioEncuesta = ({
    formData,
    modoEdicion,
    errores,
    cargando,
    eventoSeleccionado,
    actividades,
    onInputChange,
    onSubmit,
    onCerrar
}) => {
    return (
        <div className="formulario-encuesta">
            <div className="formulario-header">
                <h3>{modoEdicion ? 'Editar Encuesta' : 'Crear Nueva Encuesta'}</h3>
                <button className="btn-cerrar" onClick={onCerrar}>✕</button>
            </div>

            <div>
                <div className="form-section">
                    <h4>Información Básica</h4>

                    <div className="form-group">
                        <label>Título de la Encuesta *</label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={onInputChange}
                            placeholder="Ej: Encuesta de Satisfacción - Conferencia 2024"
                            className={errores.titulo ? 'input-error' : ''}
                        />
                        {errores.titulo && <span className="error-text">{errores.titulo}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Tipo de Encuesta *</label>
                            <select
                                name="tipo_encuesta"
                                value={formData.tipo_encuesta}
                                onChange={onInputChange}
                            >
                                <option value="satisfaccion_evento">Satisfacción de Evento</option>
                                <option value="post_actividad">Post-Actividad</option>
                                <option value="pre_actividad">Pre-Actividad</option>                                <option value="pre_actividad">Pre-Actividad</option>
                                <option value="durante_actividad">Durante-Actividad</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Momento *</label>
                            <select
                                name="momento"
                                value={formData.momento}
                                onChange={onInputChange}
                            >
                                <option value="antes">Antes del Evento</option>
                                <option value="durante">Durante el Evento</option>
                                <option value="despues">Después del Evento</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={onInputChange}
                            placeholder="Describe el propósito de esta encuesta..."
                            rows="3"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h4>Asociación</h4>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Evento *</label>
                            <input
                                type="text"
                                value={eventoSeleccionado?.titulo || ''}
                                disabled
                                style={{ backgroundColor: '#f0f0f0' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Actividad (opcional)</label>
                            <select
                                name="id_actividad"
                                value={formData.id_actividad || ''}
                                onChange={onInputChange}
                            >
                                <option value="">Sin actividad específica</option>
                                {Array.isArray(actividades) && actividades.map(actividad => (
                                    <option key={actividad.id} value={actividad.id}>
                                        {actividad.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h4>URLs de Google Forms</h4>

                    <div className="form-group">
                        <label>URL del Formulario de Google *</label>
                        <input
                            type="url"
                            name="url_google_form"
                            value={formData.url_google_form}
                            onChange={onInputChange}
                            placeholder="https://docs.google.com/forms/d/e/..."
                            className={errores.url_google_form ? 'input-error' : ''}
                        />
                        {errores.url_google_form && <span className="error-text">{errores.url_google_form}</span>}
                        <span className="help-text">URL pública del formulario que responderán los asistentes</span>
                    </div>

                    <div className="form-group">
                        <label>URL de Respuestas (opcional)</label>
                        <input
                            type="url"
                            name="url_respuestas"
                            value={formData.url_respuestas}
                            onChange={onInputChange}
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                        <span className="help-text">URL de la hoja de cálculo con las respuestas</span>
                    </div>
                </div>

                <div className="form-section">
                    <h4>Configuración</h4>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Estado *</label>
                            <select
                                name="estado"
                                value={formData.estado}
                                onChange={onInputChange}
                            >
                                <option value="borrador">Borrador</option>
                                <option value="activa">Activa</option>
                                <option value="cerrada">Cerrada</option>
                            </select>
                        </div>

                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="obligatoria"
                                    checked={formData.obligatoria}
                                    onChange={onInputChange}
                                />
                                <span>Encuesta obligatoria</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha de Inicio</label>
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={formData.fecha_inicio}
                                onChange={onInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Fecha de Fin</label>
                            <input
                                type="date"
                                name="fecha_fin"
                                value={formData.fecha_fin}
                                onChange={onInputChange}
                                className={errores.fecha_fin ? 'input-error' : ''}
                            />
                            {errores.fecha_fin && <span className="error-text">{errores.fecha_fin}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancelar"
                        onClick={onCerrar}
                        disabled={cargando}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-guardar"
                        onClick={onSubmit}
                        disabled={cargando}
                    >
                        {cargando ? 'Guardando...' : (modoEdicion ? 'Actualizar Encuesta' : 'Crear Encuesta')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormularioEncuesta;