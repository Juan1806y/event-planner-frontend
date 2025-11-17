import React from 'react';
import { X, Trash2 } from 'lucide-react';
import styles from '../../styles/ubicaciones.module.css';

const DeleteConfirmationModal = ({
    item,
    itemType,
    itemName,
    onConfirm,
    onClose
}) => {
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Confirmar Eliminación</h2>
                    <button className={styles.btnClose} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.confirmDeleteContent}>
                    <div className={styles.warningIcon}>
                        <Trash2 size={48} className={styles.warningIcon} />
                    </div>
                    <p>
                        ¿Está seguro de que desea eliminar la {itemType} <strong>"{itemName}"</strong>?
                    </p>
                    <p className={styles.warningText}>
                        Esta acción no se puede deshacer.
                    </p>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className={`${styles.btnSubmit} ${styles.btnDeleteConfirm}`}
                            onClick={onConfirm}
                        >
                            Eliminar {itemType}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;