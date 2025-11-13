import React from 'react';
import {
    Calendar, Users, Building2,
    CheckCircle, AlertCircle, ArrowLeft, Plus, Trash2, Save, MapPin
} from 'lucide-react';
import { useEvento } from './useCrearEvento';
import './CrearEventoPage.css';

const CrearEventoPage = () => {
    const {
        loading,
        enviando,
        empresa,
        mensaje,
        mostrarModalExito,
        ubicaciones,
        lugares,
        ubicacionSeleccionada,
        setUbicacionSeleccionada,
        formData,
        handleInputChange,
        handleSubmit,
        handleVolver,
        handleCerrarModal
    } = useEvento();

    if (loading) {
        return (
            <div className="crear-evento-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando información...</p>
                </div>
            </div>
        );
    }

    if (!empresa) {
        return (
            <div className="crear-evento-page">
                <div className="crear-evento-container">
                    <div className="error-container">
                        <AlertCircle size={64} color="#dc3545" />
                        <h2>Error al Cargar Información</h2>
                        <p>No se pudo obtener la información de tu empresa.</p>
                        {mensaje.texto && (
                            <div className="mensaje-alert alert-error">
                                <span>{mensaje.texto}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={handleVolver} className="btn-cancelar-crear">
                                Volver a Eventos
                            </button>
                            <button onClick={() => window.location.reload()} className="btn-submit-crear">
                                Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="crear-evento-page">
            <div className="crear-evento-container">
                {/* Header */}
                <div className="page-header-crear">
                    <button onClick={handleVolver} className="btn-back">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-content-crear">
                        <Calendar size={28} className="header-icon" />
                        <h1 className="page-title-crear">Crear Nuevo Evento</h1>
                    </div>
                </div>

                {/* Empresa Info */}
                {empresa && (
                    <div className="empresa-info-header">
                        <Building2 size={20} />
                        <span>Organizando para: <strong>{empresa.nombre}</strong></span>
                    </div>
                )}

                {/* Mensajes */}
                {mensaje.texto && (
                    <div className={`mensaje-alert ${mensaje.tipo === 'exito' ? 'alert-exito' : 'alert-error'}`}>
                        {mensaje.tipo === 'exito' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-crear-evento">
                    <p className="form-hint">
                        El evento debe incluir un nombre claro y una definición de la agenda o su asignación a fechas específicas antes del evento
                    </p>

                    {/* Información Básica */}
                    <section className="form-section">
                        <h2 className="section-title">Información Básica</h2>

                        <div className="form-group-crear">
                            <label className="form-label-crear">
                                Nombre del Evento <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => handleInputChange('titulo', e.target.value)}
                                placeholder="Ej: Conferencia Anual de Tecnología 2025"
                                className="form-input-crear"
                                required
                            />
                        </div>

                        <div className="form-row-crear">
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Calendar size={18} />
                                    Fecha de Inicio <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                                    className="form-input-crear"
                                    required
                                />
                            </div>

                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Calendar size={18} />
                                    Fecha de Fin <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_fin}
                                    onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                                    className="form-input-crear"
                                    required
                                />
                            </div>
                        </div>
                        <p className="form-hint">
                            El evento puede durar uno o varios días. Las actividades de la agenda se asignarán a fechas específicas dentro de este rango.
                        </p>
                    </section>

                    {/* Ubicación */}
                    <section className="form-section">
                        <h2 className="section-title">Ubicación</h2>

                        <div className="form-group-crear">
                            <label className="form-label-crear">
                                Tipo de Evento <span className="required">*</span>
                            </label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="Presencial"
                                        checked={formData.modalidad === 'Presencial'}
                                        onChange={(e) => handleInputChange('modalidad', e.target.value)}
                                    />
                                    <span>Presencial</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="Virtual"
                                        checked={formData.modalidad === 'Virtual'}
                                        onChange={(e) => handleInputChange('modalidad', e.target.value)}
                                    />
                                    <span>Virtual</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="Híbrido"
                                        checked={formData.modalidad === 'Híbrido'}
                                        onChange={(e) => handleInputChange('modalidad', e.target.value)}
                                    />
                                    <span>Híbrido</span>
                                </label>
                            </div>
                        </div>

                        {(formData.modalidad === 'Presencial' || formData.modalidad === 'Híbrido') && (
                            <>
                                {/* 🔹 Nuevo campo: Selección de ubicación */}
                                <div className="form-group-crear">
                                    <label className="form-label-crear">
                                        <MapPin size={18} />
                                        Ubicación <span className="required">*</span>
                                    </label>
                                    <select
                                        value={ubicacionSeleccionada || ''}
                                        onChange={(e) => setUbicacionSeleccionada(e.target.value)}
                                        className="form-select-crear"
                                    >
                                        <option value="">-- Seleccione una ubicación --</option>
                                        {ubicaciones.map((ubicacion) => (
                                            <option key={ubicacion.id} value={ubicacion.id}>
                                                {ubicacion.lugar}
                                            </option>
                                        ))}

                                    </select>
                                    {ubicaciones.length === 0 && (
                                        <p className="form-hint text-warning">No hay ubicaciones registradas para esta empresa</p>
                                    )}
                                </div>

                                {/* 🔹 Campo existente: Selección de lugar */}
                                <div className="form-group-crear">
                                    <label className="form-label-crear">
                                        <Building2 size={18} />
                                        Lugar Físico <span className="required">*</span>
                                    </label>
                                    <select
                                        value={formData.id_lugar}
                                        onChange={(e) => handleInputChange('id_lugar', e.target.value)}
                                        className="form-select-crear"
                                        disabled={!ubicacionSeleccionada} // 👈 evita seleccionar sin ubicación
                                    >
                                        <option value="">-- Seleccione un lugar --</option>
                                        {Array.isArray(lugares) ? (
                                            lugares.map((lugar) => (
                                                <option key={lugar.id} value={lugar.id}>
                                                    {lugar.nombre} — {lugar.ubicacion?.direccion || 'Sin dirección'}
                                                </option>
                                            ))
                                        ) : (
                                            <option key={lugares.id} value={lugares.id}>
                                                {lugares.nombre} — {lugares.ubicacion?.direccion}
                                            </option>
                                        )}
                                    </select>
                                    <p className="form-hint">
                                        Los lugares registrados incluyen capacidad y dirección
                                    </p>
                                    {ubicacionSeleccionada && lugares.length === 0 && (
                                        <p className="form-hint text-warning">
                                            No hay lugares registrados para esta ubicación
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </section>

                    {/* Información Adicional */}
                    <section className="form-section">
                        <h2 className="section-title">Información Adicional</h2>

                        <div className="form-row-crear">
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Users size={18} />
                                    Cupos Disponibles <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.cupos}
                                    onChange={(e) => handleInputChange('cupos', e.target.value)}
                                    placeholder="Número máximo de participantes"
                                    className="form-input-crear"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="form-group-crear">
                            <label className="form-label-crear">Descripción Adicional</label>
                            <textarea
                                value={formData.descripcion_adicional}
                                onChange={(e) => handleInputChange('descripcion_adicional', e.target.value)}
                                placeholder="Información adicional sobre el evento, requisitos, público objetivo, etc."
                                className="form-textarea-crear"
                                rows="5"
                            />
                        </div>
                    </section>

                    {/* Botones de Acción */}
                    <div className="form-actions-crear">
                        <button type="button" onClick={handleVolver} className="btn-cancelar-crear">
                            Cancelar
                        </button>
                        <button type="submit" disabled={enviando} className="btn-submit-crear">
                            <Save size={20} />
                            {enviando ? 'Creando Evento...' : 'Crear Evento'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de éxito */}
            {mostrarModalExito && (
                <div className="modal-overlay">
                    <div className="modal-exito">
                        <CheckCircle size={48} color="#28a745" />
                        <h2>¡Evento creado exitosamente!</h2>
                        <p>Serás redirigido al panel del organizador.</p>
                        <button className="btn-submit-crear" onClick={handleCerrarModal}>
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrearEventoPage;