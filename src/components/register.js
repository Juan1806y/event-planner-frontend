import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000';

export const useRegister = () => {
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState('asistente');
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    especialidad: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!formData.cedula.trim()) {
      setError('La cédula es obligatoria');
      return false;
    }
    if (!formData.correo.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      setError('El correo electrónico no es válido');
      return false;
    }
    if (!formData.contraseña) {
      setError('La contraseña es obligatoria');
      return false;
    }
    if (formData.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.contraseña !== formData.confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (selectedRole === 'ponente' && !formData.especialidad.trim()) {
      setError('La especialidad es obligatoria para ponentes');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        cedula: formData.cedula,
        telefono: formData.telefono || null,
        correo: formData.correo,
        contraseña: formData.contraseña,
        rol: selectedRole
      };

      if (selectedRole === 'ponente') {
        payload.especialidad = formData.especialidad;
      }

      console.log('Enviando registro:', payload);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      let data;
      try {
        data = await response.json();
        console.log('Respuesta del servidor:', data);
      } catch (jsonError) {
        console.error('Error al parsear JSON:', jsonError);
        throw new Error('Error al procesar la respuesta del servidor');
      }

      if (!response.ok) {
        let errorMessage = 'Error durante el registro';

        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = typeof data.error === 'string' ? data.error : data.error.message || errorMessage;
        } else if (Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ');
        }

        if (response.status === 400) {
          errorMessage = data.message || 'Datos inválidos. Verifica la información ingresada';
        } else if (response.status === 403) {
          errorMessage = 'Solo puede registrarse como asistente o ponente';
        } else if (response.status >= 500) {
          errorMessage = 'Error en el servidor. Por favor, intenta más tarde';
        }

        throw new Error(errorMessage);
      }

      console.log('Registro exitoso!');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

      return { success: true };

    } catch (err) {
      console.error('Error durante el registro:', err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else if (err.message.includes('ETIMEDOUT') || err.message.includes('timeout')) {
        setError('El servidor no responde. Por favor, intenta más tarde.');
      } else {
        setError(err.message);
      }
      
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return {
    // Estados
    selectedRole,
    formData,
    showPassword,
    showConfirmPassword,
    error,
    loading,
    
    // Funciones
    handleRoleSelect,
    handleInputChange,
    handleRegister,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleNavigateToLogin
  };
};