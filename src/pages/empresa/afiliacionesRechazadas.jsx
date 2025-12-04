import React, { useState, useEffect } from 'react';
import styles from './afiliaciones.module.css';

const AfiliacionesRechazadas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('No hay sesión activa');
        return;
      }

      const response = await fetch(`${API_URL}/empresas?incluir_pendientes=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        return;
      }

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          const empresasRechazadas = result.data.filter(e => e.estado === 2);
          setEmpresas(empresasRechazadas);
        } else {
          setEmpresas([]);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cargar empresas');
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      setError('Error de conexión con el servidor');
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nit?.includes(searchTerm)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Afiliaciones Rechazadas</h1>
        <div className={styles.stats}>
          <span className={styles.statsLabel}>Total rechazadas:</span>
          <span className={styles.statsValue}>{empresas.length}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre o NIT"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.searchIcon}>
            <circle cx="8" cy="8" r="6" stroke="#757575" strokeWidth="2" />
            <path d="M13 13l5 5" stroke="#757575" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={fetchEmpresas} className={styles.btnRetry}>
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Cargando empresas...</div>
      ) : filteredEmpresas.length === 0 ? (
        <div className={styles.noResults}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto 16px' }}>
            <circle cx="32" cy="32" r="30" stroke="#f44336" strokeWidth="2" fill="none" />
            <path d="M20 20l24 24M44 20L20 44" stroke="#f44336" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p>{searchTerm ? 'No se encontraron empresas con ese criterio' : 'No hay empresas rechazadas'}</p>
        </div>
      ) : (
        <div className={styles.empresasList}>
          {filteredEmpresas.map((empresa) => (
            <div key={empresa.id} className={styles.empresaCard}>
              <div className={styles.empresaInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Nombre Empresa</span>
                  <span className={styles.value}>{empresa.nombre}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>NIT</span>
                  <span className={styles.value}>{empresa.nit}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Dirección</span>
                  <span className={styles.value}>{empresa.direccion}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Teléfono</span>
                  <span className={styles.value}>{empresa.telefono}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{empresa.correo || empresa.email}</span>
                </div>
              </div>

              <div className={styles.rejectionInfo}>
                <div className={styles.statusBadgeDanger}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" fill="#f44336" />
                    <path d="M6 6l8 8M14 6l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>Rechazada</span>
                </div>
                {empresa.motivo_rechazo && (
                  <div className={styles.rejectionReason}>
                    <strong>Motivo del rechazo:</strong>
                    <p>{empresa.motivo_rechazo}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AfiliacionesRechazadas;