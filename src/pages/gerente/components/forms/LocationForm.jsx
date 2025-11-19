import React from 'react';
import { X } from 'lucide-react';
import styles from '../../styles/ubicaciones.module.css';

const LocationForm = ({
    title,
    formData,
    ciudades,
    empresa,
    onSubmit,
    onClose,
    onInputChange
}) => {
    const handleLocalInputChange = (e) => {
        const { name, value } = e.target;
        onInputChange(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{title}</h2>
                    <button className={styles.btnClose} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.ubicacionForm}>
                    <div className={styles.formGroup}>
                        <label>Empresa</label>
                        <div className={styles.empresaDisplay}>
                            <strong>{empresa?.nombre || 'Cargando...'}</strong>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="lugar">Nombre *</label>
                        <input
                            type="text"
                            id="lugar"
                            name="lugar"
                            value={formData.lugar}
                            onChange={handleLocalInputChange}
                            placeholder="Nombre de la ubicación"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="direccion">Dirección *</label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleLocalInputChange}
                            placeholder="Dirección completa"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="id_ciudad">Ciudad *</label>
                        <select
                            id="id_ciudad"
                            name="id_ciudad"
                            value={formData.id_ciudad}
                            onChange={handleLocalInputChange}
                            required
                        >
                            <option value="">Seleccione una ciudad</option>
                            {ciudades.map((ciudad) => (
                                <option key={ciudad.id} value={ciudad.id}>
                                    {ciudad.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="descripcion">Descripción *</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleLocalInputChange}
                            placeholder="Descripción de la ubicación"
                            rows="4"
                            required
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" className={styles.btnCancel} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.btnSubmit}>
                            Crear Ubicación
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LocationForm;