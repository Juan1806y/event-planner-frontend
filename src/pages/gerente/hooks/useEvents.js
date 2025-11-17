import { useState, useEffect, useCallback } from 'react';
import { eventsAPI } from '../../../services/api/eventsAPI';
import { useNotifications } from './useNotifications';

export const useEvents = () => {
  const { showNotification, closeNotification } = useNotifications();
  
  const [state, setState] = useState({
    eventos: [],
    eventosFiltrados: [],
    organizadores: [],
    searchTerm: '',
    filtroOrganizador: '',
    loading: true,
    sidebarCollapsed: false
  });

  const [modalState, setModalState] = useState({
    showModal: false,
    eventoSeleccionado: null
  });

  const sanitizarEvento = useCallback((evento) => {
    const sanitizado = { ...evento };

    Object.keys(sanitizado).forEach(key => {
      let value = sanitizado[key];

      if (typeof value === 'object' && value !== null) {
        if (value.nombre !== undefined) {
          value = value.nombre;
        } else if (value.texto !== undefined) {
          value = value.texto;
        } else if (value.id !== undefined) {
          value = value.id;
        } else {
          const stringKeys = Object.keys(value).filter(k => typeof value[k] === 'string');
          value = stringKeys.length > 0 ? value[stringKeys[0]] : JSON.stringify(value);
        }
        sanitizado[key] = value;
      }
    });

    return sanitizado;
  }, []);

  const cargarEventos = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const data = await eventsAPI.obtenerEventos();

      const eventosSanitizados = data.data.map(sanitizarEvento);
      const organizadoresUnicos = data.data.reduce((acc, evento) => {
        if (evento.creador?.nombre) {
          const nombreOrganizador = evento.creador.nombre;
          if (!acc.find(org => org.nombre === nombreOrganizador)) {
            acc.push({
              id: evento.creador.id,
              nombre: nombreOrganizador,
              correo: evento.creador.correo
            });
          }
        }
        return acc;
      }, []);

      setState(prev => ({
        ...prev,
        eventos: eventosSanitizados,
        eventosFiltrados: eventosSanitizados,
        organizadores: organizadoresUnicos,
        loading: false
      }));

    } catch (error) {
      console.error("Error al cargar eventos:", error);
      setState(prev => ({ ...prev, loading: false }));
      
      if (error.message?.includes("Token inválido")) {
        showNotification('error', 'Sesión expirada', 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
      } else {
        showNotification('error', 'Error', 'Error al cargar los eventos');
      }
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [state.searchTerm, state.filtroOrganizador, state.eventos]);

  const aplicarFiltros = useCallback(() => {
    let filtered = state.eventos;

    if (state.searchTerm) {
      filtered = filtered.filter(evento =>
        evento.titulo?.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    if (state.filtroOrganizador) {
      filtered = filtered.filter(evento => evento.creador === state.filtroOrganizador);
    }

    setState(prev => ({ ...prev, eventosFiltrados: filtered }));
  }, [state.searchTerm, state.filtroOrganizador, state.eventos]);

  const verDetallesEvento = (evento) => {
    setModalState({ showModal: true, eventoSeleccionado: evento });
  };

  const cerrarModal = () => {
    setModalState({ showModal: false, eventoSeleccionado: null });
  };

  const handleSearchChange = (value) => {
    setState(prev => ({ ...prev, searchTerm: value }));
  };

  const handleOrganizadorFilterChange = (value) => {
    setState(prev => ({ ...prev, filtroOrganizador: value }));
  };

  const handleSidebarToggle = (collapsed) => {
    setState(prev => ({ ...prev, sidebarCollapsed: collapsed }));
  };

  const limpiarFiltros = () => {
    setState(prev => ({
      ...prev,
      searchTerm: '',
      filtroOrganizador: ''
    }));
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no definida';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHora = (hora) => {
    if (!hora || hora === '00:00:00') return '';
    return hora.substring(0, 5);
  };

  const getLugarTexto = (evento) => {
    return evento.lugar || evento.ubicacion || 'Lugar por definir';
  };

  const getEstadoEvento = (evento) => {
    const cuposDisponibles = evento.cupos_disponibles || evento.cupo_disponible || evento.cupos || 0;
    const cuposTotales = evento.cupos || cuposDisponibles;

    if (cuposDisponibles > 0) {
      const porcentaje = cuposTotales > 0 ? Math.round((cuposDisponibles / cuposTotales) * 100) : 0;
      return {
        texto: `${cuposDisponibles} CUPOS DISPONIBLES`,
        clase: 'statusAvailable',
        porcentaje
      };
    } else {
      return {
        texto: 'EVENTO LLENO',
        clase: 'statusFull',
        porcentaje: 0
      };
    }
  };

  return {
    ...state,
    ...modalState,
    verDetallesEvento,
    cerrarModal,
    handleSearchChange,
    handleOrganizadorFilterChange,
    handleSidebarToggle,
    limpiarFiltros,
    recargarEventos: cargarEventos,
    formatFecha,
    formatHora,
    getLugarTexto,
    getEstadoEvento,
    showNotification,
    closeNotification
  };
};