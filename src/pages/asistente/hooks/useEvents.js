// hooks/useEvents.js
import { useState, useEffect } from 'react';
import { eventService } from '../../../services/eventService';

export const useEvents = () => {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // Función para obtener el token disponible
  const getToken = () => {
    // Buscar en diferentes posibles ubicaciones del token
    const accessToken = localStorage.getItem('access_token');
    const token = localStorage.getItem('token');
    const authToken = localStorage.getItem('auth_token');

    console.log('🔍 Buscando token...');
    console.log('access_token:', accessToken);
    console.log('token:', token);
    console.log('auth_token:', authToken);

    // Devolver el primer token que encuentre
    return accessToken || token || authToken;
  };

  const cargarEventosDisponibles = async () => {
    setLoading(true);
    try {
      console.log('🔍 Iniciando carga de eventos...');
      const token = getToken(); // Usar la función mejorada

      console.log('📝 Token encontrado:', !!token);

      if (!token) {
        console.error('❌ No se encontró ningún token en localStorage');
        console.log('📍 Items en localStorage:', Object.keys(localStorage));
        throw new Error('No hay token disponible. Por favor, inicia sesión nuevamente.');
      }

      const eventosData = await eventService.getAvailableEvents(token);
      console.log('✅ Eventos cargados:', eventosData);

      setEventos(eventosData);

      // Extraer modalidades únicas para los filtros
      const modalidades = [...new Set(eventosData.map(evento => evento.modalidad))];
      setCategorias(modalidades);
      console.log('📊 Modalidades encontradas:', modalidades);

    } catch (error) {
      console.error('❌ Error en cargarEventosDisponibles:', error);
      console.error('🔧 Detalles del error:', error.message);
      setEventos([]);
    } finally {
      setLoading(false);
      console.log('🏁 Carga de eventos finalizada');
    }
  };

  const actualizarCuposEvento = async (eventoId) => {
    try {
      await cargarEventosDisponibles();
    } catch (error) {
      console.error('Error actualizando cupos:', error);
    }
  };

  // Filtrar eventos cuando cambia el filtro
  useEffect(() => {
    console.log('🔄 Filtrando eventos...', eventos.length, 'eventos disponibles');
    if (filtroCategoria === '') {
      setEventosFiltrados(eventos);
      console.log('📋 Mostrando todos los eventos:', eventos.length);
    } else {
      const filtrados = eventos.filter(evento =>
        evento.modalidad === filtroCategoria
      );
      setEventosFiltrados(filtrados);
      console.log('🎯 Eventos filtrados por', filtroCategoria + ':', filtrados.length);
    }
  }, [eventos, filtroCategoria]);

  return {
    eventos,
    eventosFiltrados,
    categorias,
    loading,
    filtroCategoria,
    setFiltroCategoria,
    cargarEventosDisponibles,
    actualizarCuposEvento
  };
};