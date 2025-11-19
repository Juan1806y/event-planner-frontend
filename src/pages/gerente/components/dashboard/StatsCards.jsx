import React from 'react';
import styles from '../../styles/GerenteDashboard.module.css';
import Person from '../../../../assets/person.png';

const StatsCards = ({ stats }) => {
    const statItems = [
        {
            label: 'Total Empleados',
            value: stats.totalEmpleados || 0,
            icon: <img src={Person} alt="Personas" className={styles.statIconImage} />,
            color: styles.statBlue
        },
        {
            label: 'Eventos Publicados',
            value: stats.totalEventos || 0,
            icon: '📅',
            color: styles.statGreen
        }
    ];

    const StatBox = ({ item }) => (
        <div className={`${styles.statBox} ${item.color}`}>
            <div className={styles.statIcon}>
                {typeof item.icon === 'string' ? item.icon : item.icon}
            </div>
            <div className={styles.statDetails}>
                <span className={styles.statLabel}>{item.label}</span>
                <span className={styles.statValue}>{item.value}</span>
            </div>
        </div>
    );

    return (
        <div className={styles.statsContainer}>
            {statItems.map((item, index) => (
                <StatBox key={index} item={item} />
            ))}
        </div>
    );
};

export default StatsCards;