// src/pages/ActualizarEmpresa.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GerenteSidebar from '../gerente/GerenteSidebar';
import empresaService from '../../components/empresaService';
import './ActualizarEmpresa.css';
import Header from '../../layouts/Header/header';

const ActualizarEmpresa = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false); // Nuevo estado
    const [modalMessage, setModalMessage] = useState('');
    const [cancelModalMessage, setCancelModalMessage] = useState(''); // Nuevo estado
    const [user, setUser] = useState(null);
    const [empresaOriginal, setEmpresaOriginal] = useState(null);
    const [formData, setFormData] = useState({
        nombreEmpresa: '',
        nit: '',
        direccion: '',
        ciudad: '',
        pais: '',
        telefono: '',
        correo: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    // Cargar datos del usuario y de la empresa
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Cargar datos de la empresa asociada al gerente
        cargarEmpresa();
    }, [navigate]);

    const cargarEmpresa = async () => {
        try {
            setIsLoading(true);
            setLoadError(null);

            const respuesta = await empresaService.obtenerEmpresaGerente();
            console.log('Empresa cargada exitosamente:', respuesta);

            const empresaData = respuesta?.data?.[0];
            if (!empresaData) throw new Error('No se encontraron datos de la empresa.');

            // Obtener nombres de ciudad y país
            let ciudadNombre = '';
            let paisNombre = '';

            if (empresaData.id_ciudad) {
                const ciudad = await empresaService.obtenerCiudadPorId(empresaData.id_ciudad);

                const ciudadData = ciudad?.data;
                const ciudadNombre = ciudadData?.nombre || ciudadData?.nombre_ciudad || '';

                const idPais = ciudadData?.id_pais;
                let paisNombre = '';

                if (idPais) {
                    const pais = await empresaService.obtenerPaisPorId(idPais);

                    const paisData = pais?.data;
                    paisNombre = paisData?.nombre || paisData?.nombre_pais || '';
                }

                setEmpresaOriginal({ ...empresaData, ciudad: ciudadNombre, pais: paisNombre, nombreEmpresa: empresaData.nombre });

                setFormData({
                    nombreEmpresa: empresaData.nombre || '',
                    nit: empresaData.nit || '',
                    direccion: empresaData.direccion || '',
                    ciudad: ciudadNombre || '',
                    pais: paisNombre || '',
                    telefono: empresaData.telefono || '',
                    correo: empresaData.correo || ''
                });
            }

        } catch (error) {
            console.error('Error al cargar empresa:', error);
            setLoadError(error.message || 'No se pudieron cargar los datos de la empresa.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombreEmpresa.trim()) {
            newErrors.nombreEmpresa = 'El nombre de la empresa es requerido';
        }

        if (!formData.nit.trim()) {
            newErrors.nit = 'El NIT es requerido';
        }

        if (!formData.direccion.trim()) {
            newErrors.direccion = 'La dirección es requerida';
        }

        if (!formData.ciudad.trim()) {
            newErrors.ciudad = 'La ciudad es requerida';
        }

        if (!formData.pais.trim()) {
            newErrors.pais = 'El país es requerido';
        }

        if (!formData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es requerido';
        }

        if (!formData.correo.trim()) {
            newErrors.correo = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            newErrors.correo = 'El correo electrónico no es válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Función para verificar si un campo ha cambiado
    const hasCambiado = (campo) => {
        if (!empresaOriginal) return false;
        return formData[campo] !== empresaOriginal[campo];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            console.log("Datos originales del formulario:", formData);

            // Buscar el ID de la ciudad según su nombre
            const ciudadResponse = await empresaService.obtenerTodasCiudades();
            const ciudadEncontrada = ciudadResponse.data.find(
                (c) => c.nombre.toLowerCase() === formData.ciudad.toLowerCase()
            );

            if (!ciudadEncontrada) {
                throw new Error("La ciudad seleccionada no existe en la base de datos.");
            }

            const datosActualizados = {
                nombre: formData.nombreEmpresa,
                nit: formData.nit,
                direccion: formData.direccion,
                id_ciudad: ciudadEncontrada.id,
                telefono: formData.telefono,
                correo: formData.correo
            };

            console.log("📦 Datos a enviar al backend:", datosActualizados);

            const resultado = await empresaService.actualizarEmpresa(empresaOriginal.id, datosActualizados);

            console.log("Empresa actualizada exitosamente:", resultado);

            // Mostrar el modal de éxito
            setModalMessage("Solicitud de actualización fue registrada correctamente. Será revisada por el equipo de administración.");
            setShowModal(true);

        } catch (error) {
            console.error("Error al actualizar empresa:", error);
            setModalMessage("❌ Ocurrió un error al actualizar la empresa");
            setShowModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalMessage('');
        navigate('/gerente'); // Redirigir al dashboard del gerente
    };


    const handleCancel = () => {
        // Verificar si hay cambios
        const hayCambios = Object.keys(formData).some(key => hasCambiado(key));

        if (hayCambios) {
            // Si hay cambios, mostrar modal de confirmación de cancelación
            setCancelModalMessage("¿Está seguro que desea cancelar? Se perderán los cambios no guardados.");
            setShowCancelModal(true);
        } else {
            // Si no hay cambios, redirigir directamente
            navigate('/gerente');
        }
    };

    const handleCloseCancelModal = () => {
        setShowCancelModal(false);
        setCancelModalMessage('');
        navigate('/gerente'); // Redirigir al dashboard
    };

    const handleCancelModalClose = () => {
        // Solo cerrar el modal sin redirigir (cuando el usuario decide no cancelar)
        setShowCancelModal(false);
        setCancelModalMessage('');
    };


    // Mostrar loading mientras se cargan los datos
    if (isLoading) {
        return (
            <div className="gerente-layout">
                <GerenteSidebar />
                <div className="gerente-content">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        fontSize: '1.2rem',
                        color: '#555'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '3rem',
                                marginBottom: '1rem'
                            }}>
                                ⏳
                            </div>
                            Cargando información de la empresa...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mostrar error si no se pudieron cargar los datos
    if (loadError) {
        return (
            <div className="gerente-layout">
                <GerenteSidebar />
                <div className="gerente-content">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        gap: '1rem',
                        padding: '2rem'
                    }}>
                        <div style={{ fontSize: '4rem' }}>⚠️</div>
                        <p style={{
                            color: '#e74c3c',
                            fontSize: '1.2rem',
                            textAlign: 'center',
                            maxWidth: '500px'
                        }}>
                            {loadError}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={cargarEmpresa}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
                            >
                                🔄 Reintentar
                            </button>
                            <button
                                onClick={() => navigate('/gerente')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#95a5a6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#7f8c8d'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#95a5a6'}
                            >
                                ← Volver al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gerente-layout">
            <GerenteSidebar />

            <div className="gerente-content">
                <Header />

                <main className="gerente-main">
                    <div className="form-container">
                        <h2>Gestión de Actualización de Empresa</h2>
                        <div className="info-banner">
                            <div className="info-icon">ℹ️</div>
                            <div className="info-text">
                                <strong>Instrucciones</strong>
                                <p>Modifique los campos que desea actualizar. Los cambios se guardarán inmediatamente.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <div className="section-header">
                                    <span className="section-icon">🏢</span>
                                    <h2>Información Básica de la Empresa</h2>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="nombreEmpresa">
                                            Nombre de la Empresa*
                                            {!hasCambiado('nombreEmpresa') ? (
                                                <span className="badge-sin-cambios">SIN CAMBIOS</span>
                                            ) : (
                                                <span className="badge-modificado">MODIFICADO</span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            id="nombreEmpresa"
                                            name="nombreEmpresa"
                                            value={formData.nombreEmpresa}
                                            onChange={handleChange}
                                            className={errors.nombreEmpresa ? 'error' : ''}
                                        />
                                        {errors.nombreEmpresa && (
                                            <span className="error-message">{errors.nombreEmpresa}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="nit">
                                            NIT*
                                            {!hasCambiado('nit') ? (
                                                <span className="badge-sin-cambios">SIN CAMBIOS</span>
                                            ) : (
                                                <span className="badge-modificado">MODIFICADO</span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            id="nit"
                                            name="nit"
                                            value={formData.nit}
                                            onChange={handleChange}
                                            className={errors.nit ? 'error' : ''}
                                        />
                                        {errors.nit && (
                                            <span className="error-message">{errors.nit}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <span className="section-icon">📍</span>
                                    <h2>Información de Contacto</h2>
                                </div>

                                <div className="form-group full-width">
                                    <label htmlFor="direccion">
                                        Dirección*
                                        {!hasCambiado('direccion') ? (
                                            <span className="badge-sin-cambios">SIN CAMBIOS</span>
                                        ) : (
                                            <span className="badge-modificado">MODIFICADO</span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        id="direccion"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        className={errors.direccion ? 'error' : ''}
                                    />
                                    {errors.direccion && (
                                        <span className="error-message">{errors.direccion}</span>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="ciudad">
                                            Ciudad*
                                            {!hasCambiado('ciudad') ? (
                                                <span className="badge-sin-cambios">SIN CAMBIOS</span>
                                            ) : (
                                                <span className="badge-modificado">MODIFICADO</span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            id="ciudad"
                                            name="ciudad"
                                            value={formData.ciudad}
                                            onChange={handleChange}
                                            className={errors.ciudad ? 'error' : ''}
                                        />
                                        {errors.ciudad && (
                                            <span className="error-message">{errors.ciudad}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="departamento">
                                            Pais*
                                            {!hasCambiado('pais') ? (
                                                <span className="badge-sin-cambios">SIN CAMBIOS</span>
                                            ) : (
                                                <span className="badge-modificado">MODIFICADO</span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            id="pais"
                                            name="pais"
                                            value={formData.pais}
                                            onChange={handleChange}
                                            className={errors.pais ? 'error' : ''}
                                        />
                                        {errors.pais && (
                                            <span className="error-message">{errors.pais}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="telefono">
                                            Teléfono*
                                            {!hasCambiado('telefono') ? (
                                                <span className="badge-sin-cambios">SIN CAMBIOS</span>
                                            ) : (
                                                <span className="badge-modificado">MODIFICADO</span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className={errors.telefono ? 'error' : ''}
                                        />
                                        {errors.telefono && (
                                            <span className="error-message">{errors.telefono}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="correo">
                                            Correo Electrónico*
                                            {!hasCambiado('correo') ? (
                                                <span className="badge-sin-cambios">SIN CAMBIOS</span>
                                            ) : (
                                                <span className="badge-modificado">MODIFICADO</span>
                                            )}
                                        </label>
                                        <input
                                            type="email"
                                            id="correo"
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleChange}
                                            className={errors.correo ? 'error' : ''}
                                        />
                                        {errors.correo && (
                                            <span className="error-message">{errors.correo}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
            {/* Modal de confirmación */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-body">
                            <p>{modalMessage}</p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="modal-btn-accept"
                                onClick={handleCloseModal}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de confirmación de cancelación */}
            {showCancelModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-icon warning">⚠️</div>
                        </div>
                        <div className="modal-body">
                            <p>{cancelModalMessage}</p>
                        </div>
                        <div className="modal-actions cancel-modal-actions">
                            <button
                                className="modal-btn-cancel"
                                onClick={handleCancelModalClose}
                            >
                                No, continuar editando
                            </button>
                            <button
                                className="modal-btn-confirm"
                                onClick={handleCloseCancelModal}
                            >
                                Sí, descartar cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ActualizarEmpresa;