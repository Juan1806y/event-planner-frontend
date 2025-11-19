import React from 'react';
import { X, Users } from 'lucide-react';
import styles from '../../styles/lugares.module.css';

const EditPlaceModal = ({
    lugar,
    formData,
    ubicaciones,
    empresa,
    onSubmit,
    onClose,
    onInputChange
}) => {
    const handleLocalInputChange = (e) => {
        const { name, value } = e.target;
        onInputChange(name, value);
    };

    // CORREGIDO: Recibe el evento
    const handleSubmit = (e) => {
        e.preventDefault();
        // CORREGIDO: Pasa el evento
        onSubmit(e);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Editar Lugar</h2>
                    <button className={styles.btnClose} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.lugarForm}>
                    <div className={styles.formGroup}>
                        <label>Empresa</label>
                        <div className={styles.empresaDisplay}>
                            <strong>{empresa?.nombre || 'Cargando...'}</strong>
                        </div>
                        <p className={styles.helpText}>
                            La empresa no se puede modificar al editar un lugar
                        </p>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="edit_id_ubicacion">Ubicación *</label>
                        <select
                            id="edit_id_ubicacion"
                            name="id_ubicacion"
                            value={formData.id_ubicacion}
                            onChange={handleLocalInputChange}
                            required
                            className={styles.formInput}
                        >
                            <option value="">Seleccione una ubicación</option>
                            {Array.isArray(ubicaciones) && ubicaciones.map((ubicacion) => (
                                <option key={ubicacion.id} value={ubicacion.id}>
                                    {ubicacion.lugar} - {ubicacion.direccion} {ubicacion.ciudad_nombre ? `(${ubicacion.ciudad_nombre})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="edit_nombre">Nombre del Lugar *</label>
                        <input
                            type="text"
                            id="edit_nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleLocalInputChange}
                            placeholder="Nombre del lugar"
                            required
                            className={styles.formInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="edit_capacidad">
                            <Users size={16} style={{ display: 'inline', marginRight: '8px' }} />
                            Capacidad
                        </label>
                        <input
                            type="number"
                            id="edit_capacidad"
                            name="capacidad"
                            value={formData.capacidad || ''}
                            onChange={handleLocalInputChange}
                            placeholder="Ej: 50"
                            min="1"
                            className={styles.formInput}
                        />
                        <small className={styles.helpText}>
                            Número máximo de personas que puede albergar el lugar
                        </small>
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="edit_descripcion">Descripción *</label>
                        <textarea
                            id="edit_descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleLocalInputChange}
                            placeholder="Descripción del lugar"
                            rows="4"
                            required
                            className={styles.formTextarea}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.btnSubmit}
                            disabled={!formData.id_ubicacion || !formData.nombre || !formData.descripcion}
                        >
                            Actualizar Lugar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlaceModal;