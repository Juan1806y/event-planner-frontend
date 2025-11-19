import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import AffiliationMetrics from './AffiliationMetrics';
import AuditMetrics from './AuditMetrics';
import styles from '../../admin.module.css';

const AdminDashboard = () => {
    const {
        dashboardData,
        loading,
        error,
        mostrarTodosRegistros,
        fetchDashboardData,
        setMostrarTodosRegistros
    } = useAdminDashboard();

    return (
        <div className={styles.dashboardContainer}>
            <h1 className={styles.dashboardTitle}>Panel de Administración</h1>
            <p className={styles.dashboardSubtitle}>
                Gestión integral del sistema y supervisión de actividades
            </p>

            <div className={styles.dashboardGrid}>
                <AffiliationMetrics
                    data={dashboardData.afiliaciones}
                    loading={loading}
                    error={error}
                    onRefresh={fetchDashboardData}
                />

                <AuditMetrics
                    data={dashboardData.auditoria}
                    loading={loading}
                    error={error}
                    mostrarTodosRegistros={mostrarTodosRegistros}
                    onRefresh={fetchDashboardData}
                    onToggleMostrarTodos={() => setMostrarTodosRegistros(!mostrarTodosRegistros)}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;