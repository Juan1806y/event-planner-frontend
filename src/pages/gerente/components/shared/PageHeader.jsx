import React from 'react';
import styles from '../../styles/eventosPage.module.css';

const PageHeader = ({ title, subtitle, actionButton }) => {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.headerInfo}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {actionButton && (
        <button
          className={styles.btnCreate}
          onClick={actionButton.onClick}
          disabled={actionButton.disabled}
        >
          {actionButton.icon && <span>{actionButton.icon}</span>}
          {actionButton.label}
        </button>
      )}
    </div>
  );
};

export default PageHeader;