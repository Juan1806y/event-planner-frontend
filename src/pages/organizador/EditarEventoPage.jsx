// src/pages/EventosPage/EditarEventoPage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Save,
    AlertCircle,
    Building2,
    Users,
    CheckCircle,
    XCircle, MapPin
} from 'lucide-react';
import { useEvento } from './useCrearEvento';
import './CrearEventoPage.css';

const ESTADOS = [
    { value: 0, label: 'Borrador' },
    { value: 1, label: 'Publicado' },
    { value: 2, label: 'Cancelado' },
    { value: 3, label: 'Finalizado' }
];

const EditarEventoPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        cargando,
        guardando,
        error,
        mensaje,
        mostrarModalExito,
        mostrarModalError,
        errorCupos,
        empresa,
        formData,
        lugares,
        handleInputChange,
        guardarEvento,
        obtenerCapacidadLugar,
        setMostrarModalError,
        setMostrarModalExito,
        ubicaciones,
        ubicacionSeleccionada,
        setUbicacionSeleccionada
    } = useEvento(id);

    if (cargando) {
        return (
            <div className="crear-evento-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando evento...</p>
                </div>
            </div>
        );
    }

    if (error && !empresa) {
        return (
            <div className="crear-evento-page">
                <div className="crear-evento-container">
                    <div className="error-container">
                        <AlertCircle size={64} color="#dc3545" />
                        <h2>Error al Cargar Evento</h2>
                        <p>{error}</p>
                        <button onClick={() => navigate('/organizador')} className="btn-cancelar-crear">
                            Volver a Eventos
                        </button>
                        <button onClick={() => window.location.reload()} className="btn-submit-crear">
                            Reintentar
                        </button>
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
                    <button onClick={() => navigate('/organizador')} className="btn-back">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-content-crear">
                        <Calendar size={28} className="header-icon" />
                        <h1 className="page-title-crear">Editar Evento</h1>
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

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        guardarEvento(); // 👈 Llama al hook
                    }}
                    className="form-crear-evento"
                >
                    <p className="form-hint">Actualiza la información del evento y sus actividades</p>

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

                        <div className="form-row-crear">
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Users size={18} />
                                    Cupos Disponibles
                                </label>
                                <input
                                    type="number"
                                    value={formData.cupos}
                                    onChange={(e) => handleInputChange('cupos', e.target.value)}
                                    placeholder="Número máximo de participantes"
                                    className="form-input-crear"
                                    min="1"
                                />
                                {formData.id_lugar && formData.modalidad !== 'Virtual' && (
                                    <p className="form-hint" style={{ color: '#667eea', fontWeight: '500' }}>
                                        Capacidad del lugar: {obtenerCapacidadLugar(formData.id_lugar) || 'No especificada'} personas
                                    </p>
                                )}
                            </div>

                            <div className="form-group-crear">
                                <label className="form-label-crear">Estado del Evento</label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => handleInputChange('estado', e.target.value)}
                                    className="form-select-crear"
                                    required
                                >
                                    {ESTADOS.map((estado) => (
                                        <option key={estado.value} value={estado.value}>
                                            {estado.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
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
                                        {Array.isArray(ubicaciones) && ubicaciones.map((ubicacion) => (
                                            <option key={ubicacion.id} value={ubicacion.id}>
                                                {ubicacion.lugar}
                                            </option>
                                        ))}

                                    </select>
                                    {Array.isArray(ubicaciones) && ubicaciones.length === 0 && (
                                        <p className="form-hint text-warning">
                                            No hay ubicaciones registradas para esta empresa
                                        </p>
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

                    {/* Botones */}
                    <div className="form-actions-crear">
                        <button
                            type="button"
                            onClick={() => navigate('/organizador')}
                            className="btn-cancelar-crear"
                            disabled={guardando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando || errorCupos.mostrar}
                            className="btn-submit-crear"
                        >
                            <Save size={20} />
                            {guardando ? 'Guardando Cambios...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de éxito */}
            {mostrarModalExito && (
                <div className="modal-overlay">
                    <div className="modal-exito">
                        <CheckCircle size={48} color="#28a745" />
                        <h2>¡Evento actualizado exitosamente!</h2>
                        <button
                            className="btn-submit-crear"
                            onClick={() => {
                                setMostrarModalExito(false);
                                navigate('/organizador');
                            }}
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de error */}
            {mostrarModalError && (
                <div className="modal-overlay">
                    <div className="modal-exito" style={{ borderTop: '4px solid #dc3545' }}>
                        <XCircle size={48} color="#dc3545" />
                        <h2>Error en los Cupos</h2>
                        <p>{errorCupos.mensaje}</p>
                        <button
                            className="btn-submit-crear"
                            style={{ backgroundColor: '#dc3545' }}
                            onClick={() => setMostrarModalError(false)}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditarEventoPage;
