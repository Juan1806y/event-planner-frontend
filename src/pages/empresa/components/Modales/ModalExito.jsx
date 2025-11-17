import React from 'react';
import './Modales.css';

export const ModalExito = ({
    show,
    mensaje,
    onClose,
    titulo = "Operación Exitosa"
}) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-body">
                    <div className="modal-icon success">✅</div>
                    <p>{mensaje}</p>
                </div>
                
                <div className="modal-actions">
                    <button
                        className="modal-btn-accept"
                        onClick={onClose}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};