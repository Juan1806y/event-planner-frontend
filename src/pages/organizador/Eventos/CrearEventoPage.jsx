import React from "react";
import {
    Calendar,
    Building2,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Save,
} from "lucide-react";

import Sidebar from "../Sidebar";
import "./CrearEventoPage.css";
import { useEvento } from "../../../components/useCrearEvento";

const CrearEventoPage = () => {
    const {
        empresa,
        formData,
        handleInputChange,
        handleSubmit,
        mensaje,
        loading,
        enviando,
        mostrarModalExito,
        handleCerrarModal,
        handleVolver,
    } = useEvento(null);

    const handleHoraInicio = (value) => {
        handleInputChange("hora", value);
    };

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

                        {mensaje?.texto && (
                            <div className={`mensaje-alert alert-error`}>
                                <span>{mensaje.texto}</span>
                            </div>
                        )}

                        <div className="error-actions">
                            <button onClick={handleVolver} className="btn-cancelar-crear">
                                Volver
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-submit-crear"
                            >
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
            <Sidebar />

            <div className="crear-evento-container">

                <div className="page-header-crear">
                    <button onClick={handleVolver} className="btn-back">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-content-crear">
                        <Calendar size={28} className="header-icon" />
                        <h1 className="page-title-crear">Crear Nuevo Evento</h1>
                    </div>
                </div>

                <div className="empresa-info-header">
                    <Building2 size={20} />
                    <span>
                        Organizando para: <strong>{empresa.nombre}</strong>
                    </span>
                </div>

                {mensaje?.texto && (
                    <div
                        className={`mensaje-alert ${mensaje.tipo === "exito" ? "alert-exito" : "alert-error"
                            }`}
                    >
                        {mensaje.tipo === "exito" ? (
                            <CheckCircle size={20} />
                        ) : (
                            <AlertCircle size={20} />
                        )}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-crear-evento">

                    {/* Título */}
                    <div className="form-group-crear">
                        <label className="form-label-crear">Nombre del Evento *</label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => handleInputChange("titulo", e.target.value)}
                            placeholder="Ej: Conferencia 2025"
                            className="form-input-crear"
                            required
                        />
                    </div>

                    {/* Modalidad */}
                    <div className="form-group-crear">
                        <label className="form-label-crear">Modalidad *</label>
                        <select
                            value={formData.modalidad}
                            onChange={(e) => handleInputChange("modalidad", e.target.value)}
                            className="form-select-crear"
                        >
                            <option value="Presencial">Presencial</option>
                            <option value="Virtual">Virtual</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                    </div>

                    {/* Fechas */}
                    <div className="form-row-crear">

                        <div className="form-group-crear">
                            <label className="form-label-crear">Fecha de Inicio *</label>
                            <input
                                type="date"
                                value={formData.fecha_inicio}
                                onChange={(e) =>
                                    handleInputChange("fecha_inicio", e.target.value)
                                }
                                className="form-input-crear"
                                required
                            />
                        </div>

                        <div className="form-group-crear">
                            <label className="form-label-crear">Fecha de Fin *</label>
                            <input
                                type="date"
                                value={formData.fecha_fin}
                                onChange={(e) => handleInputChange("fecha_fin", e.target.value)}
                                className="form-input-crear"
                                required
                            />
                        </div>
                    </div>

                    {/* HORA INICIO AGREGADA */}
                    <div className="form-group-crear">
                        <label className="form-label-crear">Hora de Inicio *</label>
                        <input
                            type="time"
                            value={formData.hora || ""}
                            onChange={(e) => handleHoraInicio(e.target.value)}
                            className="form-input-crear"
                            required
                        />
                    </div>
                    {/* Cupos */}
                    <div className="form-group-crear">
                        <label className="form-label-crear">Cupos</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.cupos || ""}
                            onChange={(e) => handleInputChange("cupos", e.target.value)}
                            placeholder="Ej: 100"
                            className="form-input-crear"
                        />
                    </div>

                    {/* Descripción adicional */}
                    <div className="form-group-crear">
                        <label className="form-label-crear">Descripción Adicional</label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) =>
                                handleInputChange("descripcion", e.target.value)
                            }
                            className="form-textarea-crear"
                            rows="5"
                        />
                    </div>

                    {/* Botones */}
                    <div className="form-actions-crear">
                        <button
                            type="button"
                            onClick={handleVolver}
                            className="btn-cancelar-crear"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={enviando}
                            className="btn-submit-crear"
                        >
                            <Save size={20} />
                            {enviando ? "Creando..." : "Crear Evento"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal Éxito */}
            {mostrarModalExito && (
                <div className="modal-overlay">
                    <div className="modal-exito">
                        <CheckCircle size={48} color="#28a745" />
                        <h2>¡Evento creado exitosamente!</h2>
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
