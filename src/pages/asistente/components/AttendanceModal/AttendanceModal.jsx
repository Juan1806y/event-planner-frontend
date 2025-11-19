import React, { useState } from 'react';
import styles from './AttendanceModal.module.css';

const AttendanceModal = ({ inscripcion, onClose, onConfirm, loading = false }) => {
    const [codigoAsistencia, setCodigoAsistencia] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (codigoAsistencia.trim()) {
            onConfirm(codigoAsistencia);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Registrar Asistencia</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.eventInfo}>
                        <h3>{inscripcion.evento?.nombre}</h3>
                        <p><strong>Fecha:</strong> {inscripcion.evento?.fecha}</p>
                        <p><strong>Hora:</strong> {inscripcion.evento?.hora}</p>
                        <p><strong>Modalidad:</strong> {inscripcion.evento?.modalidad}</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.attendanceForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="codigoAsistencia">
                                Código de Asistencia *
                            </label>
                            <input
                                type="text"
                                id="codigoAsistencia"
                                value={codigoAsistencia}
                                onChange={(e) => setCodigoAsistencia(e.target.value.toUpperCase())}
                                placeholder="Ingresa el código proporcionado por el organizador"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                onClick={onClose}
                                className={styles.cancelButton}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={styles.confirmButton}
                                disabled={!codigoAsistencia.trim() || loading}
                            >
                                {loading ? 'Registrando...' : 'Registrar Asistencia'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AttendanceModal;