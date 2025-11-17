import React, { useState, useEffect } from 'react';
import { useEmpresas } from '../../../../hooks/useEmpresas';
import { useNotifications } from '../../../../hooks/useNotifications';
import EmpresaCard from '../sections/EmpresaCard';
import styles from './afiliaciones.module.css';

const AfiliacionesPendientesSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', 
    empresa: null,
    motivo: ''
  });

  const { empresas, loading, error, fetchEmpresas, handleAprobarEmpresa, handleRechazarEmpresa } = useEmpresas();
  const { notification, showNotification } = useNotifications();

  useEffect(() => {
    fetchEmpresas('empresas/pendientes');
  }, [fetchEmpresas]);

  const empresasPendientes = empresas.filter(e => e.estado === 0);

  const filteredEmpresas = empresasPendientes.filter(empresa =>
    empresa.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nit?.includes(searchTerm)
  );

  const cleanNotificationMessage = (message) => {
    if (!message) return 'Error en el sistema';

    return message
      .replace(/http:\/\/localhost:\d+/g, 'el sistema')
      .replace(/localhost:\d+/g, 'el servidor')
      .replace(/Error de conexión con el servidor/g, 'Error de conexión')
      .replace(/Error al cargar empresas/g, 'Error al cargar la información');
  };

  const handleApproveClick = (empresa) => {
    setModal({
      isOpen: true,
      type: 'approve',
      empresa: empresa,
      motivo: ''
    });
  };

  const handleRejectClick = (empresa) => {
    setModal({
      isOpen: true,
      type: 'reject',
      empresa: empresa,
      motivo: ''
    });
  };

  const confirmApprove = async () => {
    if (!modal.empresa) return;

    try {
      await handleAprobarEmpresa(modal.empresa.id, modal.empresa.nombre);
      showNotification('success', `✅ Empresa "${modal.empresa.nombre}" aprobada exitosamente`);
      fetchEmpresas('empresas/pendientes');
    } catch (error) {
      const cleanError = cleanNotificationMessage(error.message || 'Error al aprobar empresa');
      showNotification('error', cleanError);
    } finally {
      closeModal();
    }
  };

  const confirmReject = async () => {
    if (!modal.empresa || !modal.motivo.trim()) {
      showNotification('error', 'Debe proporcionar un motivo para el rechazo');
      return;
    }

    try {
      await handleRechazarEmpresa(modal.empresa.id, modal.empresa.nombre, modal.motivo);
      showNotification('success', `❌ Empresa "${modal.empresa.nombre}" rechazada`);
      fetchEmpresas('empresas/pendientes');
    } catch (error) {
      const cleanError = cleanNotificationMessage(error.message || 'Error al rechazar empresa');
      showNotification('error', cleanError);
    } finally {
      closeModal();
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', empresa: null, motivo: '' });
  };

  const handleRetry = () => {
    fetchEmpresas('empresas/pendientes');
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

      {modal.isOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {modal.type === 'approve' && (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.modalIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#4caf50" strokeWidth="2" />
                      <path d="M8 12l3 3 5-5" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className={styles.modalTitle}>Confirmar Aprobación</h3>
                </div>

                <div className={styles.modalBody}>
                  <p>¿Está seguro de aprobar la empresa <strong>"{modal.empresa?.nombre}"</strong>?</p>
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    Esta acción no se puede deshacer.
                  </p>
                </div>

                <div className={styles.modalActions}>
                  <button
                    className={styles.btnCancel}
                    onClick={closeModal}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.btnConfirm}
                    onClick={confirmApprove}
                    type="button"
                  >
                    Aprobar
                  </button>
                </div>
              </>
            )}

            {modal.type === 'reject' && (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.modalIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#f44336" strokeWidth="2" />
                      <path d="M15 9l-6 6M9 9l6 6" stroke="#f44336" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className={styles.modalTitle}>Confirmar Rechazo</h3>
                </div>

                <div className={styles.modalBody}>
                  <p>¿Por qué rechaza la empresa <strong>"{modal.empresa?.nombre}"</strong>?</p>
                  <textarea
                    className={styles.motivoInput}
                    placeholder="Ingrese el motivo del rechazo..."
                    value={modal.motivo}
                    onChange={(e) => setModal(prev => ({ ...prev, motivo: e.target.value }))}
                    rows="4"
                  />
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    Esta acción notificará al solicitante y no se puede deshacer.
                  </p>
                </div>

                <div className={styles.modalActions}>
                  <button
                    className={styles.btnCancel}
                    onClick={closeModal}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.btnDanger}
                    onClick={confirmReject}
                    disabled={!modal.motivo.trim()}
                    type="button"
                  >
                    Rechazar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Afiliaciones Pendientes</h1>
      </div>

      {filteredEmpresas.length > 0 && (
        <div className={styles.alertBanner}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.alertIcon}>
            <circle cx="12" cy="12" r="10" stroke="#ff9800" strokeWidth="2" fill="none" />
            <path d="M12 8v4M12 16h.01" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className={styles.alertText}>
            Solicitudes de Afiliación Pendientes ({filteredEmpresas.length})
          </span>
        </div>
      )}

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
          <p>{cleanNotificationMessage(error)}</p>
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
            <circle cx="32" cy="32" r="30" stroke="#ddd" strokeWidth="2" fill="none" />
            <path d="M32 20v16M32 44h.01" stroke="#ddd" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p>{searchTerm ? 'No se encontraron empresas con ese criterio' : 'No hay solicitudes pendientes'}</p>
        </div>
      )}

      {!loading && filteredEmpresas.length > 0 && (
        <div className={styles.empresasList}>
          {filteredEmpresas.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              status="pendiente"
              showActions={true}
              onApprove={() => handleApproveClick(empresa)}
              onReject={() => handleRejectClick(empresa)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AfiliacionesPendientesSection;