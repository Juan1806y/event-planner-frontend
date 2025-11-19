import React, { useState } from 'react';
import styles from './admin.module.css';

const ConfiguracionSection = () => {
    const [settings, setSettings] = useState({
        notificaciones: true,
        auditoria: true,
        autoBackup: false,
        modoMantenimiento: false,
        limiteUsuarios: 100,
        tiempoSesion: 60
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        setMessage('');

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage('✅ Configuración guardada exitosamente');
        } catch (error) {
            setMessage('❌ Error al guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSettings = () => {
        if (window.confirm('¿Estás seguro de que quieres restaurar la configuración por defecto?')) {
            setSettings({
                notificaciones: true,
                auditoria: true,
                autoBackup: false,
                modoMantenimiento: false,
                limiteUsuarios: 100,
                tiempoSesion: 60
            });
            setMessage('🔄 Configuración restaurada a valores por defecto');
        }
    };

    return (
        <div className={styles.configuracionContainer}>
            <div className={styles.configuracionHeader}>
                <h1 className={styles.configuracionTitle}>Configuración del Sistema</h1>
                <p className={styles.configuracionSubtitle}>
                    Gestiona los ajustes y preferencias del sistema
                </p>
            </div>

            {message && (
                <div className={`${styles.message} ${message.includes('✅') ? styles.success : styles.error}`}>
                    {message}
                </div>
            )}

            <div className={styles.configuracionGrid}>
                <div className={styles.configCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIcon}>⚙️</div>
                        <h3 className={styles.cardTitle}>Configuración General</h3>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.settingGroup}>
                            <label className={styles.settingLabel}>
                                <input
                                    type="checkbox"
                                    checked={settings.notificaciones}
                                    onChange={(e) => handleSettingChange('notificaciones', e.target.checked)}
                                    className={styles.settingCheckbox}
                                />
                                <span className={styles.settingText}>
                                    Notificaciones del sistema
                                    <small>Recibir alertas y notificaciones importantes</small>
                                </span>
                            </label>

                            <label className={styles.settingLabel}>
                                <input
                                    type="checkbox"
                                    checked={settings.auditoria}
                                    onChange={(e) => handleSettingChange('auditoria', e.target.checked)}
                                    className={styles.settingCheckbox}
                                />
                                <span className={styles.settingText}>
                                    Registro de auditoría
                                    <small>Mantener registro de todas las actividades</small>
                                </span>
                            </label>

                            <label className={styles.settingLabel}>
                                <input
                                    type="checkbox"
                                    checked={settings.autoBackup}
                                    onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                                    className={styles.settingCheckbox}
                                />
                                <span className={styles.settingText}>
                                    Backup automático
                                    <small>Realizar copias de seguridad automáticas</small>
                                </span>
                            </label>

                            <label className={styles.settingLabel}>
                                <input
                                    type="checkbox"
                                    checked={settings.modoMantenimiento}
                                    onChange={(e) => handleSettingChange('modoMantenimiento', e.target.checked)}
                                    className={styles.settingCheckbox}
                                />
                                <span className={styles.settingText}>
                                    Modo mantenimiento
                                    <small>Restringir acceso durante mantenimiento</small>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className={styles.configCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIcon}>📊</div>
                        <h3 className={styles.cardTitle}>Límites del Sistema</h3>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.settingGroup}>
                            <div className={styles.settingRow}>
                                <label className={styles.settingLabel}>
                                    Límite de usuarios
                                    <small>Número máximo de usuarios permitidos</small>
                                </label>
                                <input
                                    type="number"
                                    value={settings.limiteUsuarios}
                                    onChange={(e) => handleSettingChange('limiteUsuarios', parseInt(e.target.value))}
                                    className={styles.settingInput}
                                    min="1"
                                    max="1000"
                                />
                            </div>

                            <div className={styles.settingRow}>
                                <label className={styles.settingLabel}>
                                    Tiempo de sesión (minutos)
                                    <small>Tiempo máximo de inactividad antes de cerrar sesión</small>
                                </label>
                                <input
                                    type="number"
                                    value={settings.tiempoSesion}
                                    onChange={(e) => handleSettingChange('tiempoSesion', parseInt(e.target.value))}
                                    className={styles.settingInput}
                                    min="5"
                                    max="480"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.configCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardIcon}>ℹ️</div>
                        <h3 className={styles.cardTitle}>Información del Sistema</h3>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.systemInfo}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Versión:</span>
                                <span className={styles.infoValue}>v2.1.0</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Última actualización:</span>
                                <span className={styles.infoValue}>15 Nov 2024</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Base de datos:</span>
                                <span className={styles.infoValue}>MySQL 8.0</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Servidor:</span>
                                <span className={styles.infoValue}>Node.js 18</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.configuracionActions}>
                <button
                    onClick={handleResetSettings}
                    className={styles.btnSecondary}
                    disabled={loading}
                >
                    Restaurar por Defecto
                </button>
                <button
                    onClick={handleSaveSettings}
                    className={styles.btnPrimary}
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Guardar Configuración'}
                </button>
            </div>
        </div>
    );
};

export default ConfiguracionSection;