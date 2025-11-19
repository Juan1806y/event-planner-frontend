import React from 'react';
import './Modales.css';

export const ModalConfirmacion = ({
    show,
    mensaje,
    onConfirm,
    onCancel,
    titulo = "Confirmar Acción"
}) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-icon warning">⚠️</div>
                    <h3>{titulo}</h3>
                </div>
                
                <div className="modal-body">
                    <p>{mensaje}</p>
                </div>
                
                <div className="modal-actions cancel-modal-actions">
                    <button
                        className="modal-btn-cancel"
                        onClick={onCancel}
                    >
                        No, continuar editando
                    </button>
                    <button
                        className="modal-btn-confirm"
                        onClick={onConfirm}
                    >
                        Sí, descartar cambios
                    </button>
                </div>
            </div>
        </div>
    );
};