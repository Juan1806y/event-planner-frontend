import React, { useState, useEffect } from 'react';
import { useEmpresas } from '../../../../hooks/useEmpresas';
import { useNotifications } from '../../../../hooks/useNotifications';
import EmpresaCard from '../sections/EmpresaCard';
import styles from './afiliaciones.module.css';

const AfiliacionesRechazadasSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { empresas, loading, error, fetchEmpresas } = useEmpresas();
  const { notification, showNotification } = useNotifications();

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const empresasRechazadas = empresas.filter(e => e.estado === 2);

  const filteredEmpresas = empresasRechazadas.filter(empresa =>
    empresa.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nit?.includes(searchTerm)
  );

  const handleRetry = () => {
    fetchEmpresas();
  };

  return (
    <div className={styles.container}>
      {/* Notification */}
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

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Afiliaciones Rechazadas</h1>
        <div className={styles.stats}>
          <span className={styles.statsLabel}>Total rechazadas:</span>
          <span className={styles.statsValue}>{empresasRechazadas.length}</span>
        </div>
      </div>

      {/* Search */}
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

      {/* Error State */}
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.btnRetry}>
            Reintentar
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>Cargando empresas...</div>
      )}

      {/* Empty State */}
      {!loading && filteredEmpresas.length === 0 && (
        <div className={styles.noResults}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#f44336" strokeWidth="2" fill="none"/>
            <path d="M20 20l24 24M44 20L20 44" stroke="#f44336" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p>{searchTerm ? 'No se encontraron empresas con ese criterio' : 'No hay empresas rechazadas'}</p>
        </div>
      )}

      {/* Results */}
      {!loading && filteredEmpresas.length > 0 && (
        <div className={styles.empresasList}>
          {filteredEmpresas.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              status="rechazada"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AfiliacionesRechazadasSection;