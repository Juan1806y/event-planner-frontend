import { useNavigate } from 'react-router-dom';
import styles from './footer.module.css';

const Footer = () => {
  const navigate = useNavigate();

  const handleAffiliationClick = () => {
    navigate('/empresa');  
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.teGustaraRegistrarContainer}>
        <p className={styles.teGustaraRegistrarTuEmpre}>
          <i className={styles.teGustaraRegistrar}>
            ¿Te gustaría registrar tu empresa para organizar eventos?
          </i>
        </p>
        <p className={styles.teGustaraRegistrarTuEmpre}>
          <span className={styles.teGustaraRegistrar}>Haz</span>
          <span className={styles.span}>{` `}</span>
          <b 
            className={styles.clicAqu}
            onClick={handleAffiliationClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAffiliationClick();
              }
            }}
          >
            clic aquí
          </b>
          <span className={styles.span}>{` `}</span>
          <span className={styles.teGustaraRegistrar}>
            para solicitar el formulario de afiliación empresarial.
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;