import React from 'react';
import styles from '../../styles/GerenteDashboard.module.css';

const ActivitiesCard = () => {
    const activities = [
        {
            text: "Actualización de información empresarial",
            time: "Hace 2 horas"
        },
        {
            text: "Nuevo proyecto asignado al equipo",
            time: "Hace 5 horas"
        },
        {
            text: "Revisión de solicitudes pendientes",
            time: "Ayer"
        }
    ];

    const ActivityItem = ({ activity }) => (
        <div className={styles.activityItem}>
            <span className={styles.activityDot}></span>
            <div className={styles.activityInfo}>
                <p className={styles.activityText}>{activity.text}</p>
                <span className={styles.activityTime}>{activity.time}</span>
            </div>
        </div>
    );

    return (
        <div className={styles.infoCard}>
            <h3>📌 Actividades Recientes</h3>
            <div className={styles.activityList}>
                {activities.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                ))}
            </div>
        </div>
    );
};

export default ActivitiesCard;