import { useState, useEffect } from 'react';
import { placesAPI } from '../../../services/api/placesAPI';
import { useNotifications } from './useNotifications';

export const usePlaces = () => {
  const { showNotification, closeNotification, notifications } = useNotifications();

  const [state, setState] = useState({
    lugares: [],
    empresas: [],
    ubicaciones: [],
    searchTerm: '',
    filterEmpresa: '',
    selectedEmpresaId: '',
    empresaSeleccionada: null,
    loading: true,
    sidebarCollapsed: false
  });

  const [modalState, setModalState] = useState({
    showModal: false,
    showEditModal: false,
    showDeleteModal: false,
    editingLugar: null,
    deletingLugar: null
  });

  const [formData, setFormData] = useState({
    empresaId: '',
    nombre: '',
    descripcion: '',
    id_ubicacion: '',
    capacidad:''
  });

  useEffect(() => {
    loadEmpresas();
  }, []);

  useEffect(() => {
    if (state.empresas.length > 0 && !state.filterEmpresa) {
      const primeraEmpresa = state.empresas[0];
      handleEmpresaSeleccionada(primeraEmpresa);
    }
  }, [state.empresas]);

  const loadEmpresas = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const empresas = await placesAPI.getEmpresas();
      setState(prev => ({ ...prev, empresas, loading: false }));
    } catch (error) {
      console.error('Error cargando empresas:', error);
      showNotification('error', 'Error', 'Error al cargar las empresas');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchLugaresByEmpresa = async (empresaId) => {
    try {
      const lugares = await placesAPI.getLugaresByEmpresa(empresaId);
      const ubicacionesEmpresa = await placesAPI.getUbicacionesByEmpresa(empresaId);

      const lugaresConUbicaciones = lugares.map(lugar => {
        const ubicacion = Array.isArray(ubicacionesEmpresa)
          ? ubicacionesEmpresa.find(u => u.id === lugar.id_ubicacion)
          : null;
        return {
          ...lugar,
          ubicacion_nombre: ubicacion ? `${ubicacion.lugar} - ${ubicacion.direccion}` : 'Sin ubicación',
          ubicacion_data: ubicacion
        };
      });

      setState(prev => ({
        ...prev,
        lugares: lugaresConUbicaciones,
        ubicaciones: Array.isArray(ubicacionesEmpresa) ? ubicacionesEmpresa : []
      }));
    } catch (error) {
      console.error('Error al obtener lugares:', error);
      showNotification('error', 'Error', 'Error al cargar los lugares de la empresa');
    }
  };

  const fetchUbicacionesByEmpresa = async (empresaId) => {
    try {
      const ubicacionesEmpresa = await placesAPI.getUbicacionesByEmpresa(empresaId);
      setState(prev => ({
        ...prev,
        ubicaciones: Array.isArray(ubicacionesEmpresa) ? ubicacionesEmpresa : []
      }));
      return ubicacionesEmpresa;
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      return [];
    }
  };

  const handleEmpresaSeleccionada = async (empresa) => {
    setState(prev => ({
      ...prev,
      empresaSeleccionada: empresa,
      filterEmpresa: empresa.nombre,
      selectedEmpresaId: empresa.id
    }));

    setFormData(prev => ({
      ...prev,
      empresaId: empresa.id,
      id_ubicacion: ''
    }));

    await Promise.all([
      fetchLugaresByEmpresa(empresa.id),
      fetchUbicacionesByEmpresa(empresa.id)
    ]);
  };

  const handleFilterChange = async (e) => {
    const selectedEmpresaNombre = e.target.value;
    const empresaSeleccionada = state.empresas.find(emp => emp.nombre === selectedEmpresaNombre);

    if (empresaSeleccionada) {
      await handleEmpresaSeleccionada(empresaSeleccionada);
    } else {
      setState(prev => ({
        ...prev,
        lugares: [],
        selectedEmpresaId: '',
        empresaSeleccionada: null,
        filterEmpresa: selectedEmpresaNombre
      }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!state.empresaSeleccionada?.id) {
        throw new Error('No se pudo determinar la empresa');
      }

      await placesAPI.createLugar(state.empresaSeleccionada.id, formData);
      showNotification('success', 'Éxito', 'Lugar creado exitosamente');
      closeAllModals();
      await fetchLugaresByEmpresa(state.empresaSeleccionada.id);
    } catch (error) {
      showNotification('error', 'Error', error.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (!modalState.editingLugar) {
        throw new Error('No hay lugar seleccionado para editar');
      }

      await placesAPI.updateLugar(modalState.editingLugar.id, formData);
      showNotification('success', 'Éxito', 'Lugar actualizado exitosamente');
      closeAllModals();

      if (state.selectedEmpresaId) {
        await fetchLugaresByEmpresa(state.selectedEmpresaId);
      }
    } catch (error) {
      showNotification('error', 'Error', error.message);
    }
  };

  const handleDelete = async () => {
    try {
      if (!modalState.deletingLugar) {
        throw new Error('No hay lugar seleccionado para eliminar');
      }

      await placesAPI.deleteLugar(modalState.deletingLugar.id);
      showNotification('success', 'Éxito', 'Lugar eliminado exitosamente');
      closeAllModals();

      if (state.selectedEmpresaId) {
        await fetchLugaresByEmpresa(state.selectedEmpresaId);
      }
    } catch (error) {
      showNotification('error', 'Error', error.message);
    }
  };

  const openCreateModal = () => {
    if (!state.empresaSeleccionada) {
      showNotification('warning', 'Seleccione empresa', 'Primero seleccione una empresa del filtro.');
      return;
    }
    setFormData({
      empresaId: state.empresaSeleccionada.id,
      nombre: '',
      descripcion: '',
      id_ubicacion: '',
      capacidad:''
    });
    setModalState(prev => ({ ...prev, showModal: true }));
  };

  const openEditModal = async (lugar) => {
    try {
      setModalState(prev => ({ ...prev, editingLugar: lugar }));

      const ubicacionesEmpresa = await fetchUbicacionesByEmpresa(lugar.empresaId || state.selectedEmpresaId);

      setFormData({
        empresaId: lugar.empresaId || state.selectedEmpresaId,
        nombre: lugar.nombre || '',
        descripcion: lugar.descripcion || '',
        id_ubicacion: lugar.id_ubicacion || '',
        capacidad: lugar.capacidad || ''
      });

      setModalState(prev => ({ ...prev, showEditModal: true }));
    } catch (error) {
      showNotification('error', 'Error', 'Error al cargar datos para editar.');
    }
  };

  const openDeleteModal = (lugar) => {
    setModalState(prev => ({ ...prev, showDeleteModal: true, deletingLugar: lugar }));
  };

  const closeAllModals = () => {
    setModalState({
      showModal: false,
      showEditModal: false,
      showDeleteModal: false,
      editingLugar: null,
      deletingLugar: null
    });
    setFormData({
      empresaId: '',
      nombre: '',
      descripcion: '',
      id_ubicacion: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (value) => {
    setState(prev => ({ ...prev, searchTerm: value }));
  };

  const handleSidebarToggle = (collapsed) => {
    setState(prev => ({ ...prev, sidebarCollapsed: collapsed }));
  };

  // Filtrar lugares
  const filteredLugares = state.lugares.filter(lugar => {
    const matchesSearch = state.searchTerm === '' ||
      lugar.nombre?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      lugar.descripcion?.toLowerCase().includes(state.searchTerm.toLowerCase());
    return matchesSearch;
  });

  return {
    ...state,
    filteredLugares,
    ...modalState,
    formData,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleEmpresaSeleccionada,
    handleFilterChange,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeAllModals,
    handleInputChange,
    handleSearchChange,
    handleSidebarToggle,
    notifications,
    closeNotification
  };
};