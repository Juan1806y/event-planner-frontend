import React from 'react';
import styles from '../../styles/CrearOrganizadorModal.module.css';

const CreateOrganizerForm = ({
    formData,
    errors,
    apiError,
    success,
    loading,
    onInputChange,
    onSubmit,
    onCancel
}) => {
    const handleLocalInputChange = (e) => {
        const { name, value } = e.target;
        onInputChange(name, value);
    };

    return (
        <div className={styles.formContainer}>
            {apiError && (
                <div className={`${styles.alert} ${styles.alertError}`}>
                    <span>⚠️</span>
                    {apiError}
                </div>
            )}

            {success && (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>
                    <span>✓</span>
                    {success}
                </div>
            )}

            <form onSubmit={onSubmit} className={styles.organizerForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="nombre" className={styles.formLabel}>
                        👤 Nombre Completo *
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleLocalInputChange}
                        placeholder="Ej: Juan Pérez"
                        disabled={loading}
                        className={`${styles.formInput} ${errors.nombre ? styles.inputError : ''}`}
                    />
                    {errors.nombre && (
                        <span className={styles.errorMessage}>{errors.nombre}</span>
                    )}
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="cedula" className={styles.formLabel}>
                            🆔 Cédula *
                        </label>
                        <input
                            type="text"
                            id="cedula"
                            name="cedula"
                            value={formData.cedula}
                            onChange={handleLocalInputChange}
                            placeholder="Ej: 1234567890"
                            disabled={loading}
                            className={`${styles.formInput} ${errors.cedula ? styles.inputError : ''}`}
                        />
                        {errors.cedula && (
                            <span className={styles.errorMessage}>{errors.cedula}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="telefono" className={styles.formLabel}>
                            📞 Teléfono
                        </label>
                        <input
                            type="tel"
                            id="telefono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleLocalInputChange}
                            placeholder="Ej: 3001234567"
                            disabled={loading}
                            className={styles.formInput}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="correo" className={styles.formLabel}>
                        📧 Correo Electrónico *
                    </label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleLocalInputChange}
                        placeholder="ejemplo@correo.com"
                        disabled={loading}
                        className={`${styles.formInput} ${errors.correo ? styles.inputError : ''}`}
                    />
                    {errors.correo && (
                        <span className={styles.errorMessage}>{errors.correo}</span>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="contraseña" className={styles.formLabel}>
                        🔒 Contraseña Temporal *
                    </label>
                    <input
                        type="password"
                        id="contraseña"
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleLocalInputChange}
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                        disabled={loading}
                        className={`${styles.formInput} ${errors.contraseña ? styles.inputError : ''}`}
                    />
                    {errors.contraseña && (
                        <span className={styles.errorMessage}>{errors.contraseña}</span>
                    )}
                    <small className={styles.formHint}>
                        Esta contraseña se enviará por correo al organizador
                    </small>
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className={styles.btnPrimary}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className={styles.spinnerSmall}></div>
                                Creando...
                            </>
                        ) : (
                            'Crear Organizador'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateOrganizerForm;