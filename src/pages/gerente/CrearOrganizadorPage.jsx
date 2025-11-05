// src/pages/CrearOrganizadorPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearOrganizador, validarDatosOrganizador } from '../../components/organizadorService';
import empresaService from '../../components/empresaService';
import GerenteSidebar from '../gerente/GerenteSidebar';
import './CrearOrganizadorModal.css';
import Header from '../../layouts/Header/header';

const CrearOrganizadorPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    contraseña: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [empresaInfo, setEmpresaInfo] = useState(null);

  useEffect(() => {
    cargarEmpresa();
  }, []);

  const cargarEmpresa = async () => {
    try {
      setLoadingEmpresa(true);
      setApiError('');

      const respuesta = await empresaService.obtenerEmpresaGerente();
      console.log('Empresa cargada exitosamente:', respuesta);

      const empresaData = respuesta?.data?.[0];
      if (!empresaData) {
        throw new Error('No se encontraron datos de la empresa.');
      }

      console.log('Datos de la empresa:', empresaData);
      console.log('ID de empresa:', empresaData.id);

      setEmpresaInfo({
        id: empresaData.id,
        nombre: empresaData.nombre || 'Mi Empresa'
      });

    } catch (error) {
      console.error('Error al cargar empresa:', error);
      setApiError(error.message || 'No se pudieron cargar los datos de la empresa. Por favor, inicia sesión nuevamente.');
    } finally {
      setLoadingEmpresa(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!empresaInfo || !empresaInfo.id) {
      setApiError('No se pudo determinar la empresa. Por favor, verifica tu sesión.');
      return;
    }

    console.log('handleSubmit ejecutado');
    console.log('Datos del formulario:', formData);
    console.log('ID de empresa:', empresaInfo.id);

    // Preparar datos completos para validación
    const datosCompletos = {
      ...formData,
      id_empresa: empresaInfo.id
    };

    console.log('Datos completos para validación:', datosCompletos);

    const validation = validarDatosOrganizador(datosCompletos);
    console.log('Resultado de validación:', validation);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setApiError('');
    setSuccess('');

    try {
      console.log('Enviando datos al servidor:', datosCompletos);
      const resultado = await crearOrganizador(datosCompletos);
      console.log('Respuesta del servidor:', resultado);

      setSuccess(resultado.message || '¡Organizador creado exitosamente!');

      // Limpiar formulario
      setFormData({
        nombre: '',
        cedula: '',
        telefono: '',
        correo: '',
        contraseña: ''
      });
      setErrors({});

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/gerente'); // o la ruta que corresponda
      }, 2000);

    } catch (err) {
      console.error('Error al crear organizador:', err);
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loadingEmpresa) {
    return (
      <div className="crear-organizador-page">
        <div className="page-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando información de la empresa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!empresaInfo) {
    return (
      <div className="crear-organizador-page">
        <div className="page-container">
          <div className="alert alert-error">
            <span>⚠️</span>
            {apiError || 'No se pudo cargar la información de la empresa'}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate(-1)}
            style={{ marginTop: '1rem' }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="crear-organizador-page">
      <GerenteSidebar />
      <div className="page-container">
          <Header />

        <div className="form-container">
          {apiError && (
            <div className="alert alert-error">
              <span>⚠️</span>
              {apiError}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>✓</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">
                👤 Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                disabled={loading}
                className={errors.nombre ? 'input-error' : ''}
              />
              {errors.nombre && (
                <span className="error-message">{errors.nombre}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cedula">
                  🆔 Cédula *
                </label>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  placeholder="Ej: 1234567890"
                  disabled={loading}
                  className={errors.cedula ? 'input-error' : ''}
                />
                {errors.cedula && (
                  <span className="error-message">{errors.cedula}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telefono">
                  📞 Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: 3001234567"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="correo">
                📧 Correo Electrónico *
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                disabled={loading}
                className={errors.correo ? 'input-error' : ''}
              />
              {errors.correo && (
                <span className="error-message">{errors.correo}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="contraseña">
                🔒 Contraseña Temporal *
              </label>
              <input
                type="password"
                id="contraseña"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                disabled={loading}
                className={errors.contraseña ? 'input-error' : ''}
              />
              {errors.contraseña && (
                <span className="error-message">{errors.contraseña}</span>
              )}
              <small className="form-hint">
                Esta contraseña se enviará por correo al organizador
              </small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Organizador'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearOrganizadorPage;