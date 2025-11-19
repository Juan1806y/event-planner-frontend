import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gerenteService } from '../../../services/gerenteService';

export const useGerenteDashboard = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    user: null,
    equipo: [],
    stats: {
      totalEmpleados: 0,
      totalEventos: 0
    },
    loading: true,
    error: null
  });

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');

      if (!userData || !token) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(userData);
      setState(prev => ({ ...prev, user }));

      await loadTeam(user);
      await loadStats(user);

      setState(prev => ({ ...prev, loading: false }));

    } catch (error) {
      console.error('Error inicializando dashboard:', error);
      setState(prev => ({
        ...prev,
        error: 'Error al cargar los datos del dashboard',
        loading: false
      }));
    }
  };

  const loadTeam = async (user) => {
    try {
      if (!user?.rolData?.id_empresa) {
        console.log('No hay id_empresa disponible');
        setState(prev => ({ ...prev, equipo: [] }));
        return;
      }

      const equipo = await gerenteService.getTeam(user.rolData.id_empresa);
      setState(prev => ({
        ...prev,
        equipo
      }));
    } catch (error) {
      console.error('Error cargando equipo:', error);
      setState(prev => ({ ...prev, equipo: [] }));
    }
  };

  const loadStats = async (user) => {
    try {
      if (!user?.rolData?.id_empresa) {
        return;
      }

      const stats = await gerenteService.getDashboardStats(user.rolData.id_empresa);
      setState(prev => ({
        ...prev,
        stats: {
          totalEmpleados: stats.totalEmpleados,
          totalEventos: stats.totalEventos
        }
      }));
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setState(prev => ({
        ...prev,
        stats: {
          totalEmpleados: 0,
          totalEventos: 0
        }
      }));
    }
  };

  const reloadTeam = () => {
    if (state.user) {
      loadTeam(state.user);
    }
  };

  return {
    ...state,
    reloadTeam
  };
};