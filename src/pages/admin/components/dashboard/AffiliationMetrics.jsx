import styles from '../../admin.module.css';

const AffiliationMetrics = ({
  data,
  loading,
  error,
  onRefresh
}) => {
  if (loading) {
    return (
      <div className={`${styles.card} ${styles.affiliationCard}`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Gestión de Afiliaciones</h3>
          <button className={styles.refreshBtn} disabled>⏳</button>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando datos de afiliaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.affiliationCard}`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Gestión de Afiliaciones</h3>
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

  if (!data) {
    return (
      <div className={`${styles.card} ${styles.affiliationCard}`}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Gestión de Afiliaciones</h3>
          <button className={styles.refreshBtn} onClick={onRefresh}>🔄</button>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>📊</div>
            <p className={styles.error}>Datos no disponibles</p>
            <button className={styles.retryButton} onClick={onRefresh}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    pendientes = 0,
    aprobadas = 0,
    rechazadas = 0
  } = data;

  const totalEmpresas = pendientes + aprobadas + rechazadas;

  const calculatePercentage = (value) => {
    return totalEmpresas > 0 ? (value / totalEmpresas) * 100 : 0;
  };

  return (
    <div className={`${styles.card} ${styles.affiliationCard}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleSection}>
          <h3 className={styles.cardTitle}>Gestión de Afiliaciones</h3>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={onRefresh}
          title="Actualizar datos"
        >
          🔄
        </button>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.affiliationDashboard}>
          <div className={styles.statsGrid}>
            <StatCard
              type="pending"
              count={pendientes}
              label="Pendientes"
              percentage={calculatePercentage(pendientes)}
              icon="⏳"
            />

            <StatCard
              type="approved"
              count={aprobadas}
              label="Aprobadas"
              percentage={calculatePercentage(aprobadas)}
              icon="✅"
            />

            <StatCard
              type="rejected"
              count={rechazadas}
              label="Rechazadas"
              percentage={calculatePercentage(rechazadas)}
              icon="❌"
            />
          </div>

          <div className={styles.totalSection}>
            <div className={styles.totalCard}>
              <div className={styles.totalInfo}>
                <div className={styles.totalLabel}>Total Empresas</div>
                <div className={styles.totalNumber}>{totalEmpresas}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ type, count, label, percentage, icon }) => (
  <div className={`${styles.statCard} ${styles[`${type}Stat`]}`}>
    <div className={styles.statHeader}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statInfo}>
        <div className={styles.statNumber}>{count}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
    <div className={styles.statProgress}>
      <div
        className={styles.progressBar}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

export default AffiliationMetrics;