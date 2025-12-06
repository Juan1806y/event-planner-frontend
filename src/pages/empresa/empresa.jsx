import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './empresa.module.css';
import HeaderAfiliar from '../../layouts/Header/headerAfiliar/headerAfiliar';

const Empresa = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    id_pais: '',
    id_ciudad: '',
    telefono: '',
    correo: ''
  });

  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchPaises();
  }, []);

  useEffect(() => {
    if (formData.id_pais) {
      fetchCiudades(formData.id_pais);
    } else {
      setCiudades([]);
    }
  }, [formData.id_pais]);

  const fetchPaises = async () => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('No hay sesión activa');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/paises`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Países recibidos:', result);
        if (result.success && result.data) {
          // Asegurarse de que result.data es un array
          const paisesData = Array.isArray(result.data) ? result.data : [];
          setPaises(paisesData);
        } else {
          console.warn('Respuesta de países sin formato esperado:', result);
          setPaises([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al obtener países:', response.status, errorData);
        setError('Error al cargar la lista de países');
        setPaises([]);
      }
    } catch (err) {
      console.error('Error al cargar países:', err);
      setError('Error al cargar países');
      setPaises([]);
    }
  };

  const fetchCiudades = async (idPais) => {
    try {
      if (!idPais) {
        setCiudades([]);
        return;
      }

      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('No hay sesión activa');
        navigate('/login');
        return;
      }

      // Intentar múltiples formatos de URL para obtener ciudades por país
      const urlsToTry = [
        `${API_URL}/ciudades?pais=${idPais}`,
        `${API_URL}/paises/${idPais}/ciudades`,
        `${API_URL}/ciudades?id_pais=${idPais}`
      ];

      let ciudadesData = [];
      let lastError = null;

      // Intentar cada URL hasta que una funcione
      for (const url of urlsToTry) {
        try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.status === 401) {
            setError('Sesión expirada. Por favor inicia sesión nuevamente.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }

          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Ciudades obtenidas desde ${url}:`, result);
            
            if (result.success && result.data) {
              // Si result.data es un array, usarlo directamente
              // Si es un objeto con ciudades, extraer el array
              ciudadesData = Array.isArray(result.data) 
                ? result.data 
                : (result.data.ciudades || result.data.data || []);
              
              // Si las ciudades tienen id_pais, filtrar por país
              if (ciudadesData.length > 0 && ciudadesData[0].id_pais !== undefined) {
                ciudadesData = ciudadesData.filter(ciudad => ciudad.id_pais == idPais);
              }
              
              setCiudades(ciudadesData);
              return; // Éxito, salir de la función
            }
          } else {
            lastError = await response.json().catch(() => ({ status: response.status }));
            console.log(`⚠️ URL ${url} falló con status ${response.status}`);
          }
        } catch (err) {
          console.log(`⚠️ Error al intentar ${url}:`, err.message);
          lastError = err;
        }
      }

      // Si ninguna URL funcionó, intentar obtener todas las ciudades y filtrar en el frontend
      console.log('⚠️ Intentando obtener todas las ciudades como fallback...');
      try {
        const response = await fetch(`${API_URL}/ciudades`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const todasLasCiudades = Array.isArray(result.data) ? result.data : [];
            // Filtrar ciudades por país en el frontend
            ciudadesData = todasLasCiudades.filter(ciudad => 
              ciudad.id_pais == idPais || ciudad.pais_id == idPais || ciudad.idPais == idPais
            );
            console.log(`✅ ${ciudadesData.length} ciudades filtradas de ${todasLasCiudades.length} totales`);
            setCiudades(ciudadesData);
            return;
          }
        }
      } catch (fallbackErr) {
        console.error('❌ Error en fallback:', fallbackErr);
      }

      // Si llegamos aquí, no se pudieron obtener ciudades
      console.error('❌ No se pudieron obtener ciudades para el país:', idPais, lastError);
      setCiudades([]);
      
    } catch (err) {
      console.error('❌ Error al cargar ciudades:', err);
      setError('Error al cargar ciudades');
      setCiudades([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'id_pais') {
      setFormData({
        ...formData,
        id_pais: value,
        id_ciudad: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('No hay sesión activa');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/empresas/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        setShowSuccessModal(true);
      } else {
        setError(result.message || 'Error al crear la empresa');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/asistente');
  };

  const handleCancel = () => {
    navigate('/asistente');
  };

  return (
    <div className={styles.empresaContainer}>
      <HeaderAfiliar />
      <div className={styles.empresaCard}>
        <h2 className={styles.empresaTitle}>Solicitud de Afiliación de Empresa</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <span>Información Básica de la Empresa</span>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="nombre">
                Nombre de la Empresa<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ingrese el nombre de la empresa"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nit">
                NIT<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="nit"
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                required
                placeholder="Ingrese el NIT"
              />
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📍</span>
            <span>Información de Contacto</span>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="direccion">
              Dirección<span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              placeholder="Ingrese la dirección"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="id_pais">
                País<span className={styles.required}>*</span>
              </label>
              <select
                id="id_pais"
                name="id_pais"
                value={formData.id_pais}
                onChange={handleChange}
                required
                className={styles.selectInput}
              >
                <option value="">Seleccione un país</option>
                {paises.map(pais => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="id_ciudad">
                Ciudad<span className={styles.required}>*</span>
              </label>
              <select
                id="id_ciudad"
                name="id_ciudad"
                value={formData.id_ciudad}
                onChange={handleChange}
                required
                disabled={!formData.id_pais}
                className={styles.selectInput}
              >
                <option value="">
                  {!formData.id_pais
                    ? 'Primero seleccione un país'
                    : ciudades.length === 0
                      ? 'No hay ciudades disponibles'
                      : 'Seleccione una ciudad'}
                </option>
                {ciudades.map(ciudad => (
                  <option key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="telefono">
                Teléfono<span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="Ingrese el teléfono"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="correo">
                Correo Electrónico<span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                placeholder="Ingrese el correo electrónico"
              />
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.successIcon}>✓</div>
              <h3>¡Empresa Creada Exitosamente!</h3>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.successMessage}>
                <span className={styles.messageIcon}>📧</span>
                <div className={styles.messageText}>
                  <strong>Confirmación Enviada</strong>
                  <p>Se ha enviado un correo electrónico con los detalles completos del registro.</p>
                </div>
              </div>

              <div className={styles.successMessage}>
                <span className={styles.messageIcon}>⏳</span>
                <div className={styles.messageText}>
                  <strong>Solicitud Pendiente</strong>
                  <p>Tu afiliación está en proceso de revisión por parte del administrador.</p>
                </div>
              </div>

              <div className={styles.infoBox}>
                <p>
                  <strong>📬 ¿Qué sigue ahora?</strong>
                  Recibirás una notificación por correo electrónico cuando tu solicitud sea procesada y aprobada.
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnClose} onClick={handleCloseModal}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empresa;