import React, { useState, useEffect } from 'react';
import styles from './InscriptionModal.module.css';

const InscriptionModal = ({ evento, onClose, onConfirm, formatFecha, loading = false, userData = null }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        institucion: ''
    });

    const getUserData = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return {
                    nombre: user.nombre || user.name || '',
                    email: user.email || user.correo || '',
                    telefono: user.telefono || user.phone || ''
                };
            }

            const token = localStorage.getItem('token') || localStorage.getItem('access_token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    return {
                        nombre: payload.nombre || payload.name || '',
                        email: payload.email || payload.correo || '',
                        telefono: payload.telefono || payload.phone || ''
                    };
                } catch (tokenError) {
                    console.warn('No se pudo decodificar el token:', tokenError);
                }
            }

            return null;
        } catch (error) {
            console.error('Error obteniendo datos del usuario:', error);
            return null;
        }
    };

    useEffect(() => {
        const data = userData || getUserData();
        if (data) {
            setFormData(prevData => ({
                ...prevData,
                nombre: data.nombre || '',
                email: data.email || '',
                telefono: data.telefono || ''
            }));
        }
    }, [userData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className={styles.modalBody}>
            <div className={styles.eventInfo}>
                <h3>{evento.titulo}</h3>
                <p><strong>Fecha:</strong> {formatFecha(evento.fecha_inicio)}</p>
                <p><strong>Modalidad:</strong> {evento.modalidad || 'Presencial'}</p>
                <p><strong>Cupos disponibles:</strong> {evento.cupos_disponibles} de {evento.cupo_total}</p>
                {evento.descripcion && evento.descripcion !== 'Sin descripción disponible' && (
                    <div className={styles.eventDescriptionModal}>
                        <strong>Descripción:</strong>
                        <p>{evento.descripcion}</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className={styles.formSection}>
                <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre completo *</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={styles.formInput}
                        placeholder="Ingresa tu nombre completo"
                        disabled={loading}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.formInput}
                        placeholder="Ingresa tu email"
                        disabled={loading}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={styles.formInput}
                        placeholder="Ingresa tu teléfono"
                        disabled={loading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="institucion">Institución/Organización</label>
                    <input
                        type="text"
                        id="institucion"
                        name="institucion"
                        value={formData.institucion}
                        onChange={handleChange}
                        className={styles.formInput}
                        placeholder="Ingresa tu institución u organización"
                        disabled={loading}
                    />
                    <small className={styles.fieldNote}>
                        Este campo es opcional pero recomendado para eventos institucionales
                    </small>
                </div>

                <div className={styles.modalActions}>
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
                        className={styles.btnConfirm}
                        disabled={loading || !formData.nombre || !formData.email}
                    >
                        {loading ? 'Inscribiendo...' : 'Confirmar Inscripción'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InscriptionModal;