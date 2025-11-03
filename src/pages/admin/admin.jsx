import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';
import Menu from '../../layouts/MenuAdmin/menu';
import Header from '../../layouts/Header/header';
import Roles from './roles';
import Usuarios from './usuarios';
import AfiliacionesPendientes from '../empresa/afiliacionesPendientes';
import AfiliacionesAprobadas from '../empresa/afiliacionesAprobadas';
import AfiliacionesRechazadas from '../empresa/afiliacionesRechazadas';

const Admin = () => {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [afiliacionesPendientes, setAfiliacionesPendientes] = useState(0);
  const [afiliacionesAprobadas, setAfiliacionesAprobadas] = useState(0);
  const [afiliacionesRechazadas, setAfiliacionesRechazadas] = useState(0);
  const [auditoriaRegistros, setAuditoriaRegistros] = useState([]);
  const [loadingDash, setLoadingDash] = useState(false);
  const [errorDash, setErrorDash] = useState(null);
  const [mostrarTodosRegistros, setMostrarTodosRegistros] = useState(false);


  const fetchWithErrorHandling = async (url, token, options = {}) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        ...options
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;

        if (response.status === 401) {
          errorMessage = 'No autorizado. Token inválido o expirado.';
        } else if (response.status === 403) {
          errorMessage = 'Acceso denegado. No tienes permisos de administrador.';
        }

        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Si no se puede parsear como JSON, usar el mensaje por defecto
        }

        return { success: false, error: errorMessage, data: null };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  };

  const fetchAfiliacionesData = async (token) => {
    const result = await fetchWithErrorHandling('http://localhost:3000/api/empresas?incluir_pendientes=true', token);

    if (result.success && result.data) {
      let empresasData = [];
      if (Array.isArray(result.data)) {
        empresasData = result.data;
      } else if (result.data && Array.isArray(result.data.data)) {
        empresasData = result.data.data;
      } else if (result.data && result.data.data) {
        empresasData = [result.data.data];
      }

      const pendientes = empresasData.filter(e => e.estado === 0 || e.estado === '0' || e.estado === 'pendiente').length;
      const aprobadas = empresasData.filter(e => e.estado === 1 || e.estado === '1' || e.estado === 'aprobado').length;
      const rechazadas = empresasData.filter(e => e.estado === 2 || e.estado === '2' || e.estado === 'rechazado').length;

      setAfiliacionesPendientes(pendientes);
      setAfiliacionesAprobadas(aprobadas);
      setAfiliacionesRechazadas(rechazadas);

      return true;
    }

    setAfiliacionesPendientes(0);
    setAfiliacionesAprobadas(0);
    setAfiliacionesRechazadas(0);
    return false;
  };

  const fetchAuditoriaData = async (token) => {
    const result = await fetchWithErrorHandling('http://localhost:3000/api/auditoria', token);

    if (result.success && result.data) {
      let auditoriaData = [];

      if (result.data && Array.isArray(result.data.data)) {
        auditoriaData = result.data.data;
      } else if (Array.isArray(result.data)) {
        auditoriaData = result.data;
      }

      // Ordenar por ID, más reciente primero (ID más alto primero)
      auditoriaData.sort((a, b) => b.id - a.id);

      setAuditoriaRegistros(auditoriaData);
      return true;
    }

    setAuditoriaRegistros([]);
    return false;
  };

  const fetchDashboardData = async () => {
    setLoadingDash(true);
    setErrorDash(null);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setErrorDash('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
        setLoadingDash(false);
        return;
      }

      await Promise.all([
        fetchAfiliacionesData(token),
        fetchAuditoriaData(token)
      ]);

    } catch (error) {
      setErrorDash('Error inesperado al cargar el dashboard');
    } finally {
      setLoadingDash(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchDashboardData();
      setMostrarTodosRegistros(false);
    }
  }, [activeSection]);

  const getAuditoriaDisplayData = (registro) => {
    return {
      usuario: registro.usuario?.nombre || registro.usuario?.email || 'Sistema',
      mensaje: registro.mensaje || registro.accion || 'Acción no especificada',
      tipo: registro.tipo || 'Sistema',
      fecha: registro.fecha || 'Fecha no disponible',
      hora: registro.hora || ''
    };
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className={styles.dashboardGrid}>
            {/* Tarjeta de Gestión de Afiliaciones*/}
            <div className={`${styles.card} ${styles.affiliationCard}`}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleSection}>
                  <h3 className={styles.cardTitle}>Gestión de Afiliaciones</h3>
                </div>
                <button
                  className={styles.refreshBtn}
                  onClick={fetchDashboardData}
                  title="Actualizar datos"
                  disabled={loadingDash}
                >
                  {loadingDash ? '⏳' : '🔄'}
                </button>
              </div>
              <div className={styles.cardContent}>
                {loadingDash ? (
                  <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando datos de afiliaciones...</p>
                  </div>
                ) : errorDash ? (
                  <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <p className={styles.error}>{errorDash}</p>
                    <button
                      className={styles.retryButton}
                      onClick={fetchDashboardData}
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <div className={styles.affiliationDashboard}>
                    <div className={styles.statsGrid}>
                      <div className={`${styles.statCard} ${styles.pendingStat}`}>
                        <div className={styles.statHeader}>
                          <div className={styles.statIcon}>⏳</div>
                          <div className={styles.statInfo}>
                            <div className={styles.statNumber}>{afiliacionesPendientes}</div>
                            <div className={styles.statLabel}>Pendientes</div>
                          </div>
                        </div>
                        <div className={styles.statProgress}>
                          <div
                            className={styles.progressBar}
                            style={{
                              width: `${(afiliacionesPendientes / (afiliacionesPendientes + afiliacionesAprobadas + afiliacionesRechazadas)) * 100 || 0}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className={`${styles.statCard} ${styles.approvedStat}`}>
                        <div className={styles.statHeader}>
                          <div className={styles.statIcon}>✅</div>
                          <div className={styles.statInfo}>
                            <div className={styles.statNumber}>{afiliacionesAprobadas}</div>
                            <div className={styles.statLabel}>Aprobadas</div>
                          </div>
                        </div>
                        <div className={styles.statProgress}>
                          <div
                            className={styles.progressBar}
                            style={{
                              width: `${(afiliacionesAprobadas / (afiliacionesPendientes + afiliacionesAprobadas + afiliacionesRechazadas)) * 100 || 0}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className={`${styles.statCard} ${styles.rejectedStat}`}>
                        <div className={styles.statHeader}>
                          <div className={styles.statIcon}>❌</div>
                          <div className={styles.statInfo}>
                            <div className={styles.statNumber}>{afiliacionesRechazadas}</div>
                            <div className={styles.statLabel}>Rechazadas</div>
                          </div>
                        </div>
                        <div className={styles.statProgress}>
                          <div
                            className={styles.progressBar}
                            style={{
                              width: `${(afiliacionesRechazadas / (afiliacionesPendientes + afiliacionesAprobadas + afiliacionesRechazadas)) * 100 || 0}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.totalSection}>
                      <div className={styles.totalCard}>
                        <div className={styles.totalInfo}>
                          <div className={styles.totalLabel}>Total Empresas</div>
                          <div className={styles.totalNumber}>
                            {afiliacionesPendientes + afiliacionesAprobadas + afiliacionesRechazadas}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta de Auditoría*/}
            <div className={`${styles.card} ${styles.auditCard}`}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleSection}>
                  <h3 className={styles.cardTitle}>Registros de Auditoría</h3>
                </div>
                <div className={styles.headerActions}>
                  <span className={styles.recordCount}>
                    {auditoriaRegistros.length} registros
                  </span>
                  <button
                    className={styles.refreshBtn}
                    onClick={fetchDashboardData}
                    title="Actualizar datos"
                    disabled={loadingDash}
                  >
                    {loadingDash ? '⏳' : '🔄'}
                  </button>
                </div>
              </div>
              <div className={styles.cardContent}>
                {loadingDash ? (
                  <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Cargando auditoría...</p>
                  </div>
                ) : auditoriaRegistros.length > 0 ? (
                  <div className={styles.auditTimeline}>
                    {auditoriaRegistros.slice(0, mostrarTodosRegistros ? auditoriaRegistros.length : 8).map((r, i) => {
                      const displayData = getAuditoriaDisplayData(r);
                      return (
                        <div key={i} className={styles.timelineItem}>
                          <div className={styles.timelineMarker}></div>
                          <div className={styles.timelineContent}>
                            <div className={styles.auditHeader}>
                              <div className={styles.userSection}>
                                <div className={styles.userInfo}>
                                  <strong className={styles.auditUser}>
                                    {displayData.usuario}
                                  </strong>
                                  <span className={`${styles.auditType} ${styles[displayData.tipo?.toLowerCase()] || ''}`}>
                                    {displayData.tipo}
                                  </span>
                                </div>
                              </div>
                              <div className={styles.timeInfo}>
                                <span className={styles.auditDate}>
                                  {displayData.fecha} {displayData.hora}
                                </span>
                              </div>
                            </div>
                            <div className={styles.auditAction}>
                              {displayData.mensaje}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {auditoriaRegistros.length > 8 && (
                      <div className={styles.viewMoreSection}>
                        <button
                          className={styles.viewMoreBtn}
                          onClick={() => setMostrarTodosRegistros(!mostrarTodosRegistros)}
                        >
                          {mostrarTodosRegistros
                            ? 'Ver menos'
                            : `Ver ${auditoriaRegistros.length - 8} registros más`
                          }
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.noData}>
                    <div className={styles.noDataIcon}>📝</div>
                    <p>No hay registros de auditoría disponibles</p>
                    <p className={styles.noDataSubtext}>
                      Los registros de actividad del sistema aparecerán aquí
                    </p>
                    <button
                      className={styles.retryButton}
                      onClick={fetchDashboardData}
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'roles':
        return <Roles />;
      case 'usuarios':
        return <Usuarios />;
      case 'afiliaciones-pendientes':
        return <AfiliacionesPendientes />;
      case 'afiliaciones-aprobadas':
        return <AfiliacionesAprobadas />;
      case 'afiliaciones-rechazadas':
        return <AfiliacionesRechazadas />;
      case 'configuracion':
        return (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Configuración del Sistema</h2>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Configuración General</h3>
              </div>
              <div className={styles.cardContent}>
                <p>Aquí se mostrarán las opciones de configuración</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={styles.sectionContent}>
            <p>Sección no encontrada: {activeSection}</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.adminLayout}>
      <div className={styles.sidebar}>
        <Menu
          onToggle={setIsMenuCollapsed}
          onSectionChange={setActiveSection}
          activeSection={activeSection}
        />
      </div>

      <div className={`${styles.mainContent} ${isMenuCollapsed ? styles.menuCollapsed : ''}`}>
        <Header isSidebarCollapsed={isMenuCollapsed} />
        <div className={styles.dashboardContent}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;