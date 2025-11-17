import styles from './afiliaciones.module.css';

const EmpresaCard = ({ 
  empresa, 
  status = 'aprobada',
  onApprove,
  onReject,
  showActions = false 
}) => {
  const renderStatusBadge = () => {
    const statusConfig = {
      aprobada: {
        className: styles.statusBadgeSuccess,
        icon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="#4caf50"/>
            <path d="M6 10l2 2 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        text: 'Aprobada'
      },
      pendiente: {
        className: styles.statusBadgeWarning,
        icon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="#ff9800"/>
            <path d="M10 6v6M10 14h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ),
        text: 'Pendiente'
      },
      rechazada: {
        className: styles.statusBadgeDanger,
        icon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="#f44336"/>
            <path d="M6 6l8 8M14 6l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ),
        text: 'Rechazada'
      }
    };

    const config = statusConfig[status];
    if (!config) return null;

    return (
      <div className={config.className}>
        {config.icon}
        <span>{config.text}</span>
      </div>
    );
  };

  const renderRejectionInfo = () => {
    if (status !== 'rechazada' || !empresa.motivo_rechazo) return null;

    return (
      <div className={styles.rejectionInfo}>
        <div className={styles.rejectionReason}>
          <strong>Motivo del rechazo:</strong>
          <p>{empresa.motivo_rechazo}</p>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className={styles.empresaActions}>
        <button
          className={styles.btnAprobar}
          onClick={() => onApprove(empresa.id, empresa.nombre)}
        >
          ✓ Aprobar
        </button>
        <button
          className={styles.btnRechazar}
          onClick={() => onReject(empresa.id, empresa.nombre)}
        >
          ✗ Rechazar
        </button>
      </div>
    );
  };

  return (
    <div className={styles.empresaCard}>
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

      {renderStatusBadge()}
      {renderRejectionInfo()}
      {renderActions()}
    </div>
  );
};

export default EmpresaCard;