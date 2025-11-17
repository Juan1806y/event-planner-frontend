import React from 'react';
import styles from '../../styles/GerenteDashboard.module.css';

const WelcomeCard = ({ user }) => {
    return (
        <div className={styles.welcomeCard}>
            <h2>Bienvenido, {user?.nombre || user?.name || 'Gerente'}</h2>
            <p>Panel de control y gestión empresarial</p>
        </div>
    );
};

export default WelcomeCard;