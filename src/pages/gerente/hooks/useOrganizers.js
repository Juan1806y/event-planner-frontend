import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { organizersAPI } from '../../../services/api/organizersAPI';
import { useNotifications } from './useNotifications';

export const useOrganizers = () => {
  const navigate = useNavigate();
  const { showNotification, closeNotification, notifications } = useNotifications();

  const [state, setState] = useState({
    loading: false,
    loadingEmpresa: true,
    empresaInfo: null,
    formData: {
      nombre: '',
      cedula: '',
      telefono: '',
      correo: '',
      contraseña: ''
    },
    errors: {},
    apiError: '',
    success: '',
    sidebarCollapsed: false
  });

  useEffect(() => {
    cargarEmpresa();
  }, []);

  const cargarEmpresa = async () => {
    try {
      setState(prev => ({ ...prev, loadingEmpresa: true, apiError: '' }));

      const empresaInfo = await organizersAPI.getEmpresaGerente();

      setState(prev => ({
        ...prev,
        empresaInfo,
        loadingEmpresa: false
      }));

    } catch (error) {
      console.error('Error al cargar empresa:', error);

      let errorMessage = error.message;
      if (error.message.includes('404')) {
        errorMessage = 'No se pudo encontrar la información de la empresa. Verifica que el usuario tenga una empresa asignada.';
      }

      setState(prev => ({
        ...prev,
        apiError: errorMessage,
        loadingEmpresa: false
      }));
      showNotification('error', 'Error', errorMessage);
    }
  };

  const handleSidebarToggle = (collapsed) => {
    setState(prev => ({
      ...prev,
      sidebarCollapsed: collapsed
    }));
  };

  const handleInputChange = (field, value) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      },
      errors: {
        ...prev.errors,
        [field]: ''
      },
      apiError: ''
    }));
  };

  const validateForm = () => {
    const errors = {};
    const { nombre, cedula, correo, contraseña, telefono } = state.formData;

    if (!nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (nombre.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!cedula.trim()) {
      errors.cedula = 'La cédula es requerida';
    } else if (cedula.trim().length < 6) {
      errors.cedula = 'La cédula debe tener al menos 6 caracteres';
    }

    if (!correo.trim()) {
      errors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      errors.correo = 'El formato del correo no es válido';
    }

    if (!contraseña.trim()) {
      errors.contraseña = 'La contraseña es requerida';
    } else if (contraseña.length < 6) {
      errors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (telefono && !/^[\d\s+\-()]{10,15}$/.test(telefono)) {
      errors.telefono = 'El formato del teléfono no es válido';
    }

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('error', 'Error de validación', 'Por favor corrige los errores en el formulario');
      return;
    }

    if (!state.empresaInfo?.id) {
      const errorMsg = 'No se pudo determinar la empresa. Por favor, verifica tu sesión.';
      setState(prev => ({ ...prev, apiError: errorMsg }));
      showNotification('error', 'Error', errorMsg);
      return;
    }

    setState(prev => ({ ...prev, loading: true, apiError: '', success: '' }));

    try {
      const datosCompletos = {
        ...state.formData,
        id_empresa: state.empresaInfo.id
      };

      console.log('Enviando datos del organizador:', datosCompletos);

      const resultado = await organizersAPI.crearOrganizador(datosCompletos);

      setState(prev => ({
        ...prev,
        success: resultado.message,
        formData: {
          nombre: '',
          cedula: '',
          telefono: '',
          correo: '',
          contraseña: ''
        },
        errors: {},
        loading: false
      }));

      showNotification('success', 'Éxito', resultado.message);

      setTimeout(() => {
        navigate('/gerente');
      }, 2000);

    } catch (error) {
      console.error('Error al crear organizador:', error);

      let errorMessage = error.message;
      if (error.message.includes('400')) {
        errorMessage = 'Datos inválidos. Verifica que todos los campos estén correctos.';
      } else if (error.message.includes('409')) {
        errorMessage = 'Ya existe un organizador con esa cédula o correo electrónico.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
      }

      setState(prev => ({
        ...prev,
        apiError: errorMessage,
        loading: false
      }));
      showNotification('error', 'Error', errorMessage);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return {
    ...state,
    handleInputChange,
    handleSubmit,
    handleCancel,
    handleSidebarToggle,
    notifications,
    closeNotification
  };
};