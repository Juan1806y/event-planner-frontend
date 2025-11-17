import React, { useState } from 'react';
import styles from '../../admin.module.css';

const AuditMetrics = ({
  data,
  loading,
  error,
  mostrarTodosRegistros,
  onRefresh,
  onToggleMostrarTodos
}) => {
  const auditoriaRegistros = data || []; 

  const getAuditoriaDisplayData = (registro) => {
    return {
      usuario: registro.usuario?.nombre || registro.usuario?.email || 'Sistema',
      mensaje: registro.mensaje || registro.accion || 'Acción no especificada',
      tipo: registro.tipo || 'Sistema',
      fecha: registro.fecha || 'Fecha no disponible',
      hora: registro.hora || ''
    };
  };

  if (loading) {
    return (
      <div className={`${styles.card} ${styles.auditCard}`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Registros de Auditoría</h3>
          <button className={styles.refreshBtn} disabled>⏳</button>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando auditoría...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.auditCard}`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Registros de Auditoría</h3>
          <button className={styles.refreshBtn} onClick={onRefresh}>🔄</button>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <p className={styles.error}>{error}</p>
            <button className={styles.retryButton} onClick={onRefresh}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.auditCard}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleSection}>
          <h3 className={styles.cardTitle}>Registros de Auditoría</h3>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.recordCount}>
            {auditoriaRegistros.length} registros
          </span>
          <button
            className={styles.refreshBtn}
            onClick={onRefresh}
            title="Actualizar datos"
          >
            🔄
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        {auditoriaRegistros.length > 0 ? (
          <AuditTimeline
            registros={auditoriaRegistros}
            mostrarTodos={mostrarTodosRegistros}
            onToggleMostrarTodos={onToggleMostrarTodos}
            getDisplayData={getAuditoriaDisplayData}
          />
        ) : (
          <NoData onRetry={onRefresh} />
        )}
      </div>
    </div>
  );
};

const AuditTimeline = ({
  registros,
  mostrarTodos,
  onToggleMostrarTodos,
  getDisplayData
}) => {
  const registrosAMostrar = mostrarTodos ? registros : registros.slice(0, 8);

  return (
    <div className={styles.auditTimeline}>
      {registrosAMostrar.map((registro, index) => {
        const displayData = getDisplayData(registro);
        return (
          <AuditTimelineItem
            key={registro.id || index}
            displayData={displayData}
          />
        );
      })}

      {registros.length > 8 && (
        <div className={styles.viewMoreSection}>
          <button
            className={styles.viewMoreBtn}
            onClick={onToggleMostrarTodos}
          >
            {mostrarTodos
              ? 'Ver menos'
              : `Ver ${registros.length - 8} registros más`
            }
          </button>
        </div>
      )}
    </div>
  );
};

const AuditTimelineItem = ({ displayData }) => (
  <div className={styles.timelineItem}>
    <div className={styles.timelineMarker}></div>
    <div className={styles.timelineContent}>
      <div className={styles.auditHeader}>
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <strong className={styles.auditUser}>
              {displayData.usuario}
            </strong>
            <span className={`${styles.auditType} ${styles[displayData.tipo?.toLowerCase()] || ''}`}>
              {displayData.tipo}
            </span>
          </div>
        </div>
        <div className={styles.timeInfo}>
          <span className={styles.auditDate}>
            {displayData.fecha} {displayData.hora}
          </span>
        </div>
      </div>
      <div className={styles.auditAction}>
        {displayData.mensaje}
      </div>
    </div>
  </div>
);

const NoData = ({ onRetry }) => (
  <div className={styles.noData}>
    <div className={styles.noDataIcon}>📝</div>
    <p>No hay registros de auditoría disponibles</p>
    <p className={styles.noDataSubtext}>
      Los registros de actividad del sistema aparecerán aquí
    </p>
    <button className={styles.retryButton} onClick={onRetry}>
      Reintentar
    </button>
  </div>
);

export default AuditMetrics;