import React from 'react';
import styles from '../../styles/GerenteDashboard.module.css';

const TeamCard = ({ equipo, onReload }) => {
    const TeamMember = ({ miembro }) => (
        <div className={styles.teamMember}>
            <div className={styles.memberAvatar}>
                {miembro.usuario.nombre.charAt(0).toUpperCase()}
            </div>
            <div className={styles.memberInfo}>
                <p className={styles.memberName}>{miembro.usuario.nombre}</p>
                <span className={styles.memberRole}>
                    {miembro.rol === 'gerente' ? '🔑 Gerente' : '📋 Organizador'}
                </span>
            </div>
            <div className={styles.memberContact}>
                <span className={styles.memberEmail}>{miembro.usuario.correo}</span>
                {miembro.usuario.telefono && (
                    <span className={styles.memberPhone}>📞 {miembro.usuario.telefono}</span>
                )}
            </div>
        </div>
    );

    const EmptyState = () => (
        <div className={styles.emptyState}>
            <p>No hay miembros en el equipo</p>
        </div>
    );

    return (
        <div className={styles.infoCard}>
            <h3>👥 Equipo de Trabajo</h3>
            {equipo.length === 0 ? (
                <EmptyState />
            ) : (
                <div className={styles.teamList}>
                    {equipo.map((miembro) => (
                        <TeamMember key={miembro.id} miembro={miembro} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamCard;