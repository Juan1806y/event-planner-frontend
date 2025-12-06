import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './empresa.module.css';
import HeaderAfiliar from '../../layouts/Header/headerAfiliar/headerAfiliar';

const Empresa = () => {
  const navigate = useNavigate();

  // DATOS MOCK PARA PRUEBA INMEDIATA
  const paisesMock = [
    { id: 1, nombre: 'Colombia' },
    { id: 2, nombre: 'México' },
    { id: 3, nombre: 'Argentina' },
    { id: 4, nombre: 'España' },
    { id: 5, nombre: 'Chile' },
    { id: 6, nombre: 'Perú' },
    { id: 7, nombre: 'Ecuador' }
  ];

  const ciudadesMock = {
    1: [ // Colombia
      { id: 101, nombre: 'Bogotá' },
      { id: 102, nombre: 'Medellín' },
      { id: 103, nombre: 'Cali' },
      { id: 104, nombre: 'Barranquilla' }
    ],
    2: [ // México
      { id: 201, nombre: 'Ciudad de México' },
      { id: 202, nombre: 'Guadalajara' },
      { id: 203, nombre: 'Monterrey' },
      { id: 204, nombre: 'Puebla' }
    ],
    3: [ // Argentina
      { id: 301, nombre: 'Buenos Aires' },
      { id: 302, nombre: 'Córdoba' },
      { id: 303, nombre: 'Rosario' },
      { id: 304, nombre: 'Mendoza' }
    ],
    4: [ // España
      { id: 401, nombre: 'Madrid' },
      { id: 402, nombre: 'Barcelona' },
      { id: 403, nombre: 'Valencia' },
      { id: 404, nombre: 'Sevilla' }
    ],
    5: [ // Chile
      { id: 501, nombre: 'Santiago' },
      { id: 502, nombre: 'Valparaíso' },
      { id: 503, nombre: 'Concepción' },
      { id: 504, nombre: 'Antofagasta' }
    ]
  };

  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    id_pais: '',
    id_ciudad: '',
    telefono: '',
    correo: ''
  });

  // USAR DATOS MOCK DIRECTAMENTE
  const [paises] = useState(paisesMock);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Cuando se selecciona un país, cargar sus ciudades
  useEffect(() => {
    if (formData.id_pais) {
      const paisId = parseInt(formData.id_pais);
      const ciudadesDelPais = ciudadesMock[paisId] || [];
      setCiudades(ciudadesDelPais);

      // Resetear ciudad seleccionada si no está en las nuevas ciudades
      if (formData.id_ciudad && !ciudadesDelPais.some(c => c.id === parseInt(formData.id_ciudad))) {
        setFormData(prev => ({ ...prev, id_ciudad: '' }));
      }
    } else {
      setCiudades([]);
    }
  }, [formData.id_pais]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'id_pais') {
      setFormData({
        ...formData,
        [name]: value,
        id_ciudad: '' // Resetear ciudad cuando cambia el país
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

    // Simular envío
    setTimeout(() => {
      console.log('Datos enviados:', formData);
      alert(`Datos enviados:\n${JSON.stringify(formData, null, 2)}`);
      setShowSuccessModal(true);
      setLoading(false);
    }, 1000);
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

        {/* INFO DE DEBUG - TEMPORAL */}
        <div style={{
          backgroundColor: '#e8f4fd',
          border: '1px solid #b6d4fe',
          borderRadius: '5px',
          padding: '10px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <strong>⚠️ MODO PRUEBA:</strong> Usando datos de demostración.
          {paises.length} países disponibles.
        </div>

        <form onSubmit={handleSubmit}>
          {/* ... tus secciones anteriores del formulario igual ... */}

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
                <span style={{
                  marginLeft: '5px',
                  fontSize: '12px',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  ({paises.length} opciones)
                </span>
              </label>
              <select
                id="id_pais"
                name="id_pais"
                value={formData.id_pais}
                onChange={handleChange}
                required
                className={styles.selectInput}
                style={{ borderColor: formData.id_pais ? '#4CAF50' : '#ccc' }}
              >
                <option value="">-- Seleccione un país --</option>
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
                <span style={{
                  marginLeft: '5px',
                  fontSize: '12px',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  ({ciudades.length} disponibles)
                </span>
              </label>
              <select
                id="id_ciudad"
                name="id_ciudad"
                value={formData.id_ciudad}
                onChange={handleChange}
                required
                disabled={!formData.id_pais || ciudades.length === 0}
                className={styles.selectInput}
                style={{
                  borderColor: formData.id_ciudad ? '#4CAF50' : '#ccc',
                  backgroundColor: !formData.id_pais ? '#f5f5f5' : 'white'
                }}
              >
                <option value="">
                  {!formData.id_pais
                    ? '← Seleccione un país primero'
                    : ciudades.length === 0
                      ? 'No hay ciudades para este país'
                      : '-- Seleccione una ciudad --'}
                </option>
                {ciudades.map(ciudad => (
                  <option key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre}
                  </option>
                ))}
              </select>
              {formData.id_pais && ciudades.length === 0 && (
                <small style={{ color: '#ff9800', display: 'block', marginTop: '5px' }}>
                  No hay ciudades registradas para este país en la demo.
                </small>
              )}
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
              {loading ? 'Enviando...' : 'Enviar Solicitud (Demo)'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.successIcon}>✓</div>
              <h3>¡Solicitud Enviada! (Modo Demo)</h3>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.successMessage}>
                <span className={styles.messageIcon}>📋</span>
                <div className={styles.messageText}>
                  <strong>Datos recibidos:</strong>
                  <pre style={{
                    background: '#f5f5f5',
                    padding: '10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '150px'
                  }}>
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              </div>

              <div className={styles.infoBox}>
                <p>
                  <strong>⚠️ Nota:</strong> Esta es una demostración.
                  En producción, los datos se enviarían al servidor.
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