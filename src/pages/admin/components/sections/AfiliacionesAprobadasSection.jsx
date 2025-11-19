import React, {useEffect, useState} from 'react';
import { useEmpresas } from '../../../../hooks/useEmpresas';
import { useNotifications } from '../../../../hooks/useNotifications';
import EmpresaCard from '../sections/EmpresaCard';
import styles from './afiliaciones.module.css';

const AfiliacionesAprobadasSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { empresas, loading, error, fetchEmpresas } = useEmpresas();
  const { notification, showNotification } = useNotifications();

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const empresasAprobadas = empresas.filter(e => e.estado === 1);

  const filteredEmpresas = empresasAprobadas.filter(empresa =>
    empresa.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nit?.includes(searchTerm)
  );

  const handleRetry = () => {
    fetchEmpresas();
  };

  return (
    <div className={styles.container}>
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <div className={styles.notificationContent}>
            <div className={styles.notificationIcon}>
              {notification.type === 'success' ? '✓' : '✗'}
            </div>
            <p className={styles.notificationMessage}>{notification.message}</p>
            <button
              className={styles.notificationClose}
              onClick={() => showNotification(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Afiliaciones Aprobadas</h1>
        <div className={styles.stats}>
          <span className={styles.statsLabel}>Total aprobadas:</span>
          <span className={styles.statsValue}>{empresasAprobadas.length}</span>
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
            <circle cx="8" cy="8" r="6" stroke="#757575" strokeWidth="2"/>
            <path d="M13 13l5 5" stroke="#757575" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.btnRetry}>
            Reintentar
          </button>
        </div>
      )}

      {loading && (
        <div className={styles.loading}>Cargando empresas...</div>
      )}

      {!loading && filteredEmpresas.length === 0 && (
        <div className={styles.noResults}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#4caf50" strokeWidth="2" fill="none"/>
            <path d="M20 32l8 8 16-16" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>{searchTerm ? 'No se encontraron empresas con ese criterio' : 'No hay empresas aprobadas'}</p>
        </div>
      )}

      {!loading && filteredEmpresas.length > 0 && (
        <div className={styles.empresasList}>
          {filteredEmpresas.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              status="aprobada"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AfiliacionesAprobadasSection;