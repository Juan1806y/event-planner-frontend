import React from 'react';
import './ModalConfirmacion.css';

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, mensaje }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-titulo">Confirmar eliminación</h2>
                <p className="modal-mensaje">{mensaje}</p>
                <div className="modal-botones">
                    <button className="btn-cancelar" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn-confirmar" onClick={onConfirm}>
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmacion;
