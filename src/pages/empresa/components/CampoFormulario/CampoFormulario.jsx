import React from 'react';
import './CampoFormulario.css';

export const CampoFormulario = ({
    label,
    name,
    type = 'text',
    value,
    error,
    hasCambiado,
    onChange,
    required = false,
    fullWidth = false,
    placeholder = '',
    ...props
}) => {
    const getBadgeClass = () => {
        return hasCambiado ? 'badge-modificado' : 'badge-sin-cambios';
    };

    const getBadgeText = () => {
        return hasCambiado ? 'MODIFICADO' : 'SIN CAMBIOS';
    };

    return (
        <div className={`form-group ${fullWidth ? 'full-width' : ''}`}>
            <label htmlFor={name}>
                {label}
                {required && '*'}
                <span className={getBadgeClass()}>
                    {getBadgeText()}
                </span>
            </label>
            
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className={error ? 'error' : ''}
                placeholder={placeholder}
                required={required}
                {...props}
            />
            
            {error && (
                <span className="error-message">{error}</span>
            )}
        </div>
    );
};