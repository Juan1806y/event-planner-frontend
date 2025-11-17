import React from 'react';
import { X, MapPin, Building, Info, Users, Plus } from 'lucide-react';
import styles from '../../styles/lugares.module.css';

const PlaceForm = ({
    title,
    formData,
    ubicaciones,
    empresa,
    onSubmit,
    onClose,
    onInputChange,
    loading = false,
    showCreateButton = false
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onInputChange(name, value);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>
                        <Building size={24} className={styles.titleIcon} />
                        <h2>{title}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {showCreateButton && (
                            <button
                                className={styles.btnCreate}
                                disabled={loading}
                            >
                                <Plus size={20} />
                                Crear Nuevo
                            </button>
                        )}
                        <button
                            className={styles.btnClose}
                            onClick={onClose}
                            disabled={loading}
                            aria-label="Cerrar formulario"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.lugarForm}>
                    {/* Información de la empresa */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                            <Info size={18} />
                            <h3>Información de la Empresa</h3>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Empresa</label>
                            <div className={styles.empresaDisplay}>
                                <strong>{empresa?.nombre || 'No seleccionada'}</strong>
                                {empresa?.descripcion && (
                                    <p className={styles.empresaDescription}>{empresa.descripcion}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información del lugar */}
                    <div className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                            <MapPin size={18} />
                            <h3>Información del Lugar</h3>
                        </div>

                        {/* Nombre del lugar */}
                        <div className={styles.formGroup}>
                            <label htmlFor="nombre">Nombre del Lugar *</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre || ''}
                                onChange={handleInputChange}
                                placeholder="Ej: Sala de conferencias principal"
                                required
                                disabled={loading}
                                className={styles.formInput}
                            />
                            <small className={styles.helpText}>
                                Proporcione un nombre descriptivo para identificar fácilmente este lugar
                            </small>
                        </div>

                        {/* Ubicación */}
                        <div className={styles.formGroup}>
                            <label htmlFor="id_ubicacion">Ubicación *</label>
                            <select
                                id="id_ubicacion"
                                name="id_ubicacion"
                                value={formData.id_ubicacion || ''}
                                onChange={handleInputChange}
                                required
                                disabled={loading || !ubicaciones || ubicaciones.length === 0}
                                className={styles.formSelect}
                            >
                                <option value="">Seleccione una ubicación</option>
                                {ubicaciones && ubicaciones.map((ubicacion) => (
                                    <option key={ubicacion.id} value={ubicacion.id}>
                                        {ubicacion.lugar} - {ubicacion.direccion}
                                    </option>
                                ))}
                            </select>
                            {ubicaciones && ubicaciones.length === 0 && (
                                <div className={styles.warningBox}>
                                    <Info size={16} />
                                    <span>No hay ubicaciones disponibles para esta empresa. Cree una ubicación primero.</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="capacidad">
                                <Users size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                Capacidad
                            </label>
                            <input
                                type="number"
                                id="capacidad"
                                name="capacidad"
                                value={formData.capacidad || ''}
                                onChange={handleInputChange}
                                placeholder="Ej: 50"
                                min="1"
                                disabled={loading}
                                className={styles.formInput}
                            />
                            <small className={styles.helpText}>
                                Número máximo de personas que puede albergar el lugar (opcional)
                            </small>
                        </div>

                        {/* Descripción */}
                        <div className={styles.formGroup}>
                            <label htmlFor="descripcion">Descripción *</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion || ''}
                                onChange={handleInputChange}
                                placeholder="Describa las características, equipamiento y capacidad del lugar..."
                                rows="4"
                                required
                                disabled={loading}
                                className={styles.formTextarea}
                            />
                            <small className={styles.helpText}>
                                Incluya detalles como capacidad, equipos disponibles, características especiales, etc.
                            </small>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.btnSubmit}
                            disabled={loading || !ubicaciones || ubicaciones.length === 0}
                        >
                            {loading ? (
                                <>
                                    <div className={styles.spinner}></div>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Lugar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlaceForm;