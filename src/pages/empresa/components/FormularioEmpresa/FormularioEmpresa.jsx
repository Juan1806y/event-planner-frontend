import React from 'react';
import { CampoFormulario } from '../CampoFormulario/CampoFormulario';
import './FormularioEmpresa.css';

export const FormularioEmpresa = ({
    formData,
    errors,
    isSubmitting,
    hasCambiado,
    onFieldChange,
    onSubmit,
    onCancel
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="form-container">
            <h2>Gestión de Actualización de Empresa</h2>
            
            <div className="info-banner">
                <div className="info-icon">ℹ️</div>
                <div className="info-text">
                    <strong>Instrucciones</strong>
                    <p>Modifique los campos que desea actualizar. Los cambios se guardarán inmediatamente.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Sección Información Básica */}
                <div className="form-section">
                    <div className="section-header">
                        <h2>Información Básica de la Empresa</h2>
                    </div>

                    <div className="form-row">
                        <CampoFormulario
                            label="Nombre de la Empresa"
                            name="nombreEmpresa"
                            value={formData.nombreEmpresa}
                            error={errors.nombreEmpresa}
                            hasCambiado={hasCambiado('nombreEmpresa')}
                            onChange={onFieldChange}
                            required
                        />
                        
                        <CampoFormulario
                            label="NIT"
                            name="nit"
                            value={formData.nit}
                            error={errors.nit}
                            hasCambiado={hasCambiado('nit')}
                            onChange={onFieldChange}
                            required
                        />
                    </div>
                </div>

                {/* Sección Información de Contacto */}
                <div className="form-section">
                    <div className="section-header">
                        <h2>Información de Contacto</h2>
                    </div>

                    <CampoFormulario
                        label="Dirección"
                        name="direccion"
                        value={formData.direccion}
                        error={errors.direccion}
                        hasCambiado={hasCambiado('direccion')}
                        onChange={onFieldChange}
                        fullWidth
                        required
                    />

                    <div className="form-row">
                        <CampoFormulario
                            label="Ciudad"
                            name="ciudad"
                            value={formData.ciudad}
                            error={errors.ciudad}
                            hasCambiado={hasCambiado('ciudad')}
                            onChange={onFieldChange}
                            required
                        />
                        
                        <CampoFormulario
                            label="País"
                            name="pais"
                            value={formData.pais}
                            error={errors.pais}
                            hasCambiado={hasCambiado('pais')}
                            onChange={onFieldChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <CampoFormulario
                            label="Teléfono"
                            name="telefono"
                            value={formData.telefono}
                            error={errors.telefono}
                            hasCambiado={hasCambiado('telefono')}
                            onChange={onFieldChange}
                            required
                        />
                        
                        <CampoFormulario
                            label="Correo Electrónico"
                            name="correo"
                            type="email"
                            value={formData.correo}
                            error={errors.correo}
                            hasCambiado={hasCambiado('correo')}
                            onChange={onFieldChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};