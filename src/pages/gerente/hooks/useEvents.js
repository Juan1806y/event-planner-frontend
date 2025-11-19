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

  // Función auxiliar para obtener texto del estado
  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 0: return 'Borrador';
      case 1: return 'Publicado';
      case 2: return 'Cancelado';
      case 3: return 'Finalizado';
      default: return 'Desconocido';
    }
  };

  // Función auxiliar para obtener clase CSS según estado
  const getClaseEstado = (estado) => {
    switch (estado) {
      case 0: return 'statusDraft'; // Borrador
      case 1: return 'statusAvailable'; // Publicado
      case 2: return 'statusCancelled'; // Cancelado
      case 3: return 'statusFinished'; // Finalizado
      default: return 'statusUnknown';
    }
  };

  const cargarEventos = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Obtener TODOS los eventos de la empresa
      const todosLosEventos = await eventsAPI.obtenerEventos();
      console.log('🏢 Todos los eventos de la empresa:', todosLosEventos);

      if (!todosLosEventos.success) {
        throw new Error(todosLosEventos.message || 'Error al obtener eventos');
      }

      // Obtener eventos disponibles (solo publicados con cupos calculados)
      let eventosDisponibles = [];
      try {
        console.log('🔄 Solicitando eventos disponibles...');
        const disponiblesData = await eventsAPI.obtenerEventosDisponibles();
        eventosDisponibles = disponiblesData.data || [];
        console.log('📊 Eventos disponibles obtenidos:', eventosDisponibles);

        // Debug: mostrar IDs de eventos disponibles
        if (eventosDisponibles.length > 0) {
          console.log('🎯 IDs de eventos disponibles:', eventosDisponibles.map(ed => ed.id));
        } else {
          console.log('ℹ️ No se encontraron eventos disponibles');
        }
      } catch (error) {
        console.warn('No se pudieron cargar eventos disponibles:', error);
        eventosDisponibles = [];
      }

      // Combinar datos
      const eventosCombinados = todosLosEventos.data.map(evento => {
        // Buscar si este evento está en la lista de disponibles (publicados)
        const eventoDisponible = eventosDisponibles.find(ed => ed.id === evento.id);

        // Debug por evento
        console.log(`🔍 Evento ${evento.id} - "${evento.titulo}":`, {
          estado: evento.estado,
          estado_texto: getEstadoTexto(evento.estado),
          cupos_totales: evento.cupos,
          encontrado_en_disponibles: !!eventoDisponible,
          cupos_disponibles: eventoDisponible?.cupos_disponibles
        });

        const eventoProcesado = {
          id: evento.id,
          titulo: evento.titulo,
          descripcion: evento.descripcion || 'Sin descripción disponible',
          modalidad: evento.modalidad,
          hora: evento.hora,
          fecha_inicio: evento.fecha_inicio,
          fecha_fin: evento.fecha_fin,
          lugar: evento.lugar,
          cupo_total: evento.cupos, // Campo importante: cupos totales
          estado: evento.estado,
          estado_texto: getEstadoTexto(evento.estado),
          empresa: evento.empresa?.nombre || 'No especificada',
          creador: evento.creador?.nombre || 'No especificado',
          correo_organizador: evento.creador?.correo || '',
          fecha_creacion: evento.fecha_creacion,
          fecha_actualizacion: evento.fecha_actualizacion,
          actividades: evento.actividades || []
        };

        // Si el evento está publicado (estado = 1) y encontramos información de cupos disponibles
        if (evento.estado === 1 && eventoDisponible) {
          eventoProcesado.cupos_disponibles = eventoDisponible.cupos_disponibles;
          eventoProcesado.inscritos = eventoDisponible.inscritos || 0;

          console.log(`✅ Evento ${evento.id} marcado como publicado con cupos:`, {
            cupos_disponibles: eventoDisponible.cupos_disponibles,
            inscritos: eventoDisponible.inscritos,
            cupo_total: evento.cupos
          });
        }

        return eventoProcesado;
      });

      console.log('🔄 Eventos combinados finales:', eventosCombinados);

      // Extraer organizadores únicos
      const organizadoresUnicos = [...new Set(todosLosEventos.data
        .filter(evento => evento.creador?.nombre)
        .map(evento => evento.creador.nombre)
      )].map((nombre, index) => ({
        id: index,
        nombre: nombre
      }));

      setState(prev => ({
        ...prev,
        eventos: eventosCombinados,
        eventosFiltrados: eventosCombinados,
        organizadores: organizadoresUnicos,
        loading: false
      }));

    } catch (error) {
      console.error("Error al cargar eventos:", error);
      setState(prev => ({ ...prev, loading: false }));

      if (error.message?.includes("Token inválido")) {
        showNotification('error', 'Sesión expirada', 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
      } else {
        showNotification('error', 'Error', 'Error al cargar los eventos: ' + error.message);
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

  const verDetallesEvento = async (evento) => {
    try {
      // Para detalles completos, obtener información adicional del endpoint /eventos
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        const response = await fetch(`http://localhost:3000/api/eventos/${evento.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Combinar datos
            const eventoCompleto = {
              ...evento, // Mantener datos básicos incluyendo cupos_disponibles
              ...result.data, // Agregar detalles completos
              estado_texto: getEstadoTexto(result.data.estado)
            };
            setModalState({ showModal: true, eventoSeleccionado: eventoCompleto });
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error cargando detalles completos:', error);
    }

    // Fallback: usar solo los datos básicos
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

  // Función para calcular el estado del evento
  const getEstadoEvento = (evento) => {
    const cuposTotales = evento.cupo_total || 0;

    console.log('📈 Calculando estado para evento:', {
      titulo: evento.titulo,
      estado: evento.estado,
      estado_texto: evento.estado_texto,
      cupo_total: cuposTotales,
      cupos_disponibles: evento.cupos_disponibles,
      tieneCuposDisponibles: evento.cupos_disponibles !== undefined
    });

    // Si el evento no está publicado (estado !== 1), mostrar estado general
    if (evento.estado !== 1) {
      return {
        texto: evento.estado_texto || getEstadoTexto(evento.estado),
        clase: getClaseEstado(evento.estado),
        porcentaje: 0,
        cuposTotales,
        cuposDisponibles: null,
        cuposOcupados: null,
        tieneProgreso: false
      };
    }

    // Para eventos publicados CON información de cupos disponibles
    if (evento.cupos_disponibles !== undefined && evento.cupos_disponibles !== null) {
      const cuposDisponibles = parseInt(evento.cupos_disponibles);
      const cuposOcupados = cuposTotales - cuposDisponibles;

      let porcentaje = 0;
      if (cuposTotales > 0) {
        porcentaje = Math.round((cuposOcupados / cuposTotales) * 100);
      }

      let texto, clase;

      if (cuposDisponibles === 0) {
        texto = 'EVENTO LLENO';
        clase = 'statusFull';
      } else if (porcentaje >= 80) {
        texto = 'CASI LLENO';
        clase = 'statusWarning';
      } else if (porcentaje >= 50) {
        texto = 'MODERADO';
        clase = 'statusModerate';
      } else {
        texto = 'PUBLICADO';
        clase = 'statusAvailable';
      }

      return {
        texto,
        clase,
        porcentaje,
        cuposTotales,
        cuposDisponibles,
        cuposOcupados,
        tieneProgreso: true
      };
    }

    // Evento publicado pero SIN información de cupos disponibles
    return {
      texto: 'PUBLICADO',
      clase: 'statusAvailable',
      porcentaje: 0,
      cuposTotales,
      cuposDisponibles: null,
      cuposOcupados: null,
      tieneProgreso: false
    };
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
    getEstadoEvento,
    showNotification,
    closeNotification
  };
};