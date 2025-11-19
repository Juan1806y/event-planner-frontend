import React from 'react';
import { useOrganizers } from '../hooks/useOrganizers';
import GerenteSidebar from '../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';
import Header from '../../../layouts/Header/header';
import CreateOrganizerForm from '../components/forms/CreateOrganizerForm';
import NotificationSystem from '../components/shared/NotificationSystem';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import styles from '../styles/CrearOrganizadorModal.module.css';

const CrearOrganizadorContainer = () => {
  const {
    loading,
    loadingEmpresa,
    empresaInfo,
    formData,
    errors,
    apiError,
    success,
    sidebarCollapsed,
    notifications,
    closeNotification,
    handleInputChange,
    handleSubmit,
    handleCancel,
    handleSidebarToggle
  } = useOrganizers();

  if (loadingEmpresa) {
    return (
      <div className={styles.crearOrganizadorPage}>
        <LoadingState message="Cargando información de la empresa..." />
      </div>
    );
  }

  if (!empresaInfo) {
    return (
      <div className={styles.crearOrganizadorPage}>
        <ErrorState
          message={apiError || 'No se pudo cargar la información de la empresa'}
          onRetry={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className={styles.crearOrganizadorPage}>
      <GerenteSidebar onToggle={handleSidebarToggle} />

      <NotificationSystem
        notifications={notifications}
        onClose={closeNotification}
      />

      <div className={`${styles.pageContainer} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
        <Header />

        <div className={styles.contentContainer}>
          <div className={styles.pageHeader}>
            <div className={styles.headerTitle}>
              <h1>👤 Crear Organizador</h1>
              <p className={styles.empresaInfo}>
                Empresa: <strong>{empresaInfo.nombre}</strong>
              </p>
            </div>
          </div>

          <CreateOrganizerForm
            formData={formData}
            errors={errors}
            apiError={apiError}
            success={success}
            loading={loading}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default CrearOrganizadorContainer;