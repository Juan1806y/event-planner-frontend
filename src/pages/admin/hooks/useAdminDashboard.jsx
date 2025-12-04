import { useState, useEffect, useCallback } from 'react';

export const useAdminDashboard = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  const [dashboardData, setDashboardData] = useState({
    afiliaciones: {
      pendientes: 0,
      aprobadas: 0,
      rechazadas: 0
    },
    auditoria: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarTodosRegistros, setMostrarTodosRegistros] = useState(false);

  const fetchWithErrorHandling = useCallback(async (url, options = {}) => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        return { success: false, error: 'No hay token de autenticación' };
      }

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
        }

        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const fetchAfiliacionesData = useCallback(async () => {
    const result = await fetchWithErrorHandling(`${API_URL}/empresas?incluir_pendientes=true`);

    if (result.success && result.data) {
      let empresasData = [];

      if (Array.isArray(result.data)) {
        empresasData = result.data;
      } else if (result.data && Array.isArray(result.data.data)) {
        empresasData = result.data.data;
      } else if (result.data && result.data.data) {
        empresasData = [result.data.data];
      }

      const pendientes = empresasData.filter(e =>
        e.estado === 0 || e.estado === '0' || e.estado === 'pendiente'
      ).length;

      const aprobadas = empresasData.filter(e =>
        e.estado === 1 || e.estado === '1' || e.estado === 'aprobado'
      ).length;

      const rechazadas = empresasData.filter(e =>
        e.estado === 2 || e.estado === '2' || e.estado === 'rechazado'
      ).length;

      return { pendientes, aprobadas, rechazadas };
    }

    return { pendientes: 0, aprobadas: 0, rechazadas: 0 };
  }, [fetchWithErrorHandling]);

  const fetchAuditoriaData = useCallback(async () => {
    const result = await fetchWithErrorHandling(`${API_URL}/auditoria`);

    if (result.success && result.data) {
      let auditoriaData = [];

      if (result.data && Array.isArray(result.data.data)) {
        auditoriaData = result.data.data;
      } else if (Array.isArray(result.data)) {
        auditoriaData = result.data;
      }

      auditoriaData.sort((a, b) => b.id - a.id);

      return auditoriaData;
    }

    return [];
  }, [fetchWithErrorHandling]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [afiliacionesData, auditoriaData] = await Promise.all([
        fetchAfiliacionesData(),
        fetchAuditoriaData()
      ]);

      setDashboardData({
        afiliaciones: {
          pendientes: afiliacionesData.pendientes,
          aprobadas: afiliacionesData.aprobadas,
          rechazadas: afiliacionesData.rechazadas
        },
        auditoria: auditoriaData
      });

    } catch (error) {
      setError('Error inesperado al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [fetchAfiliacionesData, fetchAuditoriaData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    mostrarTodosRegistros,
    setMostrarTodosRegistros,
    fetchDashboardData
  };
};