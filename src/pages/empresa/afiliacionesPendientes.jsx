import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { API_PREFIX } from '../../config/apiConfig';
import styles from './afiliaciones.module.css';

const AfiliacionesPendientes = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingIds, setApprovingIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('No hay sesión activa');
        return;
      }

      const response = await fetch(`${API_PREFIX}/empresas/pendientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          const empresasPendientes = result.data.filter(e => e.estado === 0);
          setEmpresas(empresasPendientes);
        } else {
          setEmpresas([]);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cargar empresas');
      }
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      setError('Error de conexión con el servidor');
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };


  const attemptFallbackPromotion = async (requesterId, empresaId, token) => {
    try {
      const promoteResp = await fetch(`${API_PREFIX}/promover-gerente/${requesterId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rol: 'gerente', roleData: { empresa_id: empresaId } })
      });

      if (promoteResp.ok) {
        const promoteResult = await promoteResp.json().catch(() => ({}));
        if (promoteResult.success) {
          alert('🔔 El usuario solicitante ha sido promovido a Gerente (fallback).');
        } else {
          console.warn('Fallback promoción fallida:', promoteResult);
          alert('⚠️ Empresa aprobada, pero no se pudo promover al usuario solicitante (fallback).');
        }
      } else {
        console.warn('Fallback promote API responded with status', promoteResp.status);
        alert('⚠️ Empresa aprobada, pero la promoción del usuario falló en el servidor (fallback).');
      }
    } catch (err) {
      console.error('Error en fallback promotion:', err);
      alert('⚠️ Empresa aprobada, pero hubo un error al promover al usuario solicitante (fallback).');
    }
  };

  const extractRequesterId = (empresa) => {
    if (!empresa) return null;
    return (
      empresa.usuario?.id ||
      empresa.usuario_id ||
      empresa.id_usuario ||
      empresa.creado_por ||
      empresa.creador_id ||
      empresa.solicitante?.id ||
      empresa.solicitante_id ||
      empresa.user_id ||
      empresa.usuario_solicitante?.id ||
      empresa.solicitante_usuario_id ||
      null
    );
  };

  // Obtener detalles de una empresa por id (para recuperar solicitante si no viene en la respuesta de aprobar)
  const fetchEmpresaById = async (empresaId) => {
    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch(`${API_PREFIX}/empresas/${empresaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!resp.ok) {
        console.warn('No se pudo obtener empresa por id', empresaId, resp.status);
        return null;
      }

      const json = await resp.json().catch(() => null);
      return json?.data || null;
    } catch (err) {
      console.error('Error fetchEmpresaById:', err);
      return null;
    }
  };

  const handleApprove = async (id, nombre) => {
    if (!window.confirm(`¿Aprobar la empresa "${nombre}"?`)) return;

    // Evitar reintentos concurrentes
    if (approvingIds.includes(id)) return;

    setApprovingIds(prev => [...prev, id]);

    try {
      const result = await adminService.aprobarEmpresaYPromover(id);

      // Mostrar feedback al usuario
      alert('✅ Empresa aprobada exitosamente');

      // Si hubo promoción, notificar
      if (result?.promote?.success) {
        alert('🔔 El usuario solicitante ha sido promovido a Gerente.');
      } else if (result?.promote && !result.promote.success) {
        console.warn('Promoción fallida o no disponible:', result.promote);
        if (result.promote.status === 404) {
          console.info('Endpoint de promoción no disponible.');
        }
      }

      // Actualizar UI: remover empresa aprobada
      setEmpresas(prev => prev.filter(e => e.id !== id));
      fetchEmpresas();
    } catch (error) {
      console.error('Error aprobando empresa:', error);
      alert(error.message || 'Error al aprobar empresa');
      fetchEmpresas();
    } finally {
      setApprovingIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleReject = async (id, nombre) => {
    const motivo = prompt(`¿Por qué rechazas la empresa "${nombre}"?`);
    if (motivo === null) return;
    
    if (!motivo.trim()) {
      alert('Debes proporcionar un motivo para el rechazo');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
        const response = await fetch(`${API_PREFIX}/empresas/${id}/aprobar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          aprobar: false,
          motivo: motivo 
        })
      });

      if (response.ok) {
        alert('❌ Empresa rechazada');
        fetchEmpresas(); 
      } else {
        const result = await response.json();
        alert(result.message || 'Error al rechazar empresa');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al rechazar empresa');
    }
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nit?.includes(searchTerm)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Afiliaciones Pendientes</h1>
      </div>

      {filteredEmpresas.length > 0 && (
        <div className={styles.alertBanner}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.alertIcon}>
            <circle cx="12" cy="12" r="10" stroke="#ff9800" strokeWidth="2" fill="none"/>
            <path d="M12 8v4M12 16h.01" stroke="#ff9800" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className={styles.alertText}>
            Solicitudes de Afiliación Pendientes ({filteredEmpresas.length})
          </span>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre o NIT"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.searchIcon}>
            <circle cx="8" cy="8" r="6" stroke="#757575" strokeWidth="2"/>
            <path d="M13 13l5 5" stroke="#757575" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={fetchEmpresas} className={styles.btnRetry}>
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Cargando empresas...</div>
      ) : filteredEmpresas.length === 0 ? (
        <div className={styles.noResults}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{margin: '0 auto 16px'}}>
            <circle cx="32" cy="32" r="30" stroke="#ddd" strokeWidth="2" fill="none"/>
            <path d="M32 20v16M32 44h.01" stroke="#ddd" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p>{searchTerm ? 'No se encontraron empresas con ese criterio' : 'No hay solicitudes pendientes'}</p>
        </div>
      ) : (
        <div className={styles.empresasList}>
          {filteredEmpresas.map((empresa) => (
            <div key={empresa.id} className={styles.empresaCard}>
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

              <div className={styles.empresaActions}>
                <button
                  className={styles.btnAprobar}
                  onClick={() => handleApprove(empresa.id, empresa.nombre)}
                  disabled={approvingIds.includes(empresa.id)}
                >
                  {approvingIds.includes(empresa.id) ? 'Procesando...' : '✓ Aprobar'}
                </button>
                <button
                  className={styles.btnRechazar}
                  onClick={() => handleReject(empresa.id, empresa.nombre)}
                  disabled={approvingIds.includes(empresa.id)}
                >
                  {approvingIds.includes(empresa.id) ? 'Procesando...' : '✗ Rechazar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AfiliacionesPendientes;