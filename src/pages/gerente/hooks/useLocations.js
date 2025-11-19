import { useState, useEffect } from 'react';
import { locationsAPI } from '../../../services/api/locationsAPI';
import { useNotifications } from './useNotifications';

export const useLocations = () => {
  const { showNotification, closeNotification, notifications } = useNotifications();
  
  const [state, setState] = useState({
    ubicaciones: [],
    empresa: null,
    ciudades: [],
    searchTerm: '',
    loading: true,
    sidebarCollapsed: false
  });

  const [modalState, setModalState] = useState({
    showModal: false,
    showEditModal: false,
    showDeleteModal: false,
    editingUbicacion: null,
    deletingUbicacion: null
  });

  const [formData, setFormData] = useState({
    lugar: '',
    direccion: '',
    capacidad: '',
    descripcion: '',
    id_ciudad: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await Promise.all([
        fetchCiudades(),
        fetchEmpresaUsuario()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      showNotification('error', 'Error', 'Error al cargar los datos iniciales');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchEmpresaUsuario = async () => {
    try {
      const empresa = await locationsAPI.getEmpresaUsuario();
      setState(prev => ({ ...prev, empresa }));
      
      if (empresa?.id) {
        await fetchUbicacionesByEmpresa(empresa.id);
      }
    } catch (error) {
      console.error('Error al obtener empresa:', error);
      throw error;
    }
  };

  const fetchUbicacionesByEmpresa = async (empresaId) => {
    try {
      const ubicaciones = await locationsAPI.getUbicacionesByEmpresa(empresaId);
      setState(prev => ({ ...prev, ubicaciones }));
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      throw error;
    }
  };

  const fetchCiudades = async () => {
    try {
      const ciudades = await locationsAPI.getCiudades();
      setState(prev => ({ ...prev, ciudades }));
    } catch (error) {
      console.error('Error al obtener ciudades:', error);
      throw error;
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const resultado = await locationsAPI.createUbicacion(state.empresa.id, formData);
      showNotification('success', 'Éxito', 'Ubicación creada exitosamente');
      closeAllModals();
      await fetchUbicacionesByEmpresa(state.empresa.id);
    } catch (error) {
      showNotification('error', 'Error', error.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const resultado = await locationsAPI.updateUbicacion(modalState.editingUbicacion.id, formData);
      showNotification('success', 'Éxito', 'Ubicación actualizada exitosamente');
      closeAllModals();
      await fetchUbicacionesByEmpresa(state.empresa.id);
    } catch (error) {
      showNotification('error', 'Error', error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const resultado = await locationsAPI.deleteUbicacion(modalState.deletingUbicacion.id);
      showNotification('success', 'Éxito', 'Ubicación eliminada exitosamente');
      closeAllModals();
      await fetchUbicacionesByEmpresa(state.empresa.id);
    } catch (error) {
      showNotification('error', 'Error', error.message);
    }
  };

  const openCreateModal = () => {
    setFormData({
      lugar: '',
      direccion: '',
      capacidad: '',
      descripcion: '',
      id_ciudad: ''
    });
    setModalState(prev => ({ ...prev, showModal: true }));
  };

  const openEditModal = (ubicacion) => {
    setFormData({
      lugar: ubicacion.lugar || '',
      direccion: ubicacion.direccion || '',
      capacidad: ubicacion.capacidad || '',
      descripcion: ubicacion.descripcion || '',
      id_ciudad: ubicacion.id_ciudad || ''
    });
    setModalState(prev => ({ 
      ...prev, 
      showEditModal: true, 
      editingUbicacion: ubicacion 
    }));
  };

  const openDeleteModal = (ubicacion) => {
    setModalState(prev => ({ 
      ...prev, 
      showDeleteModal: true, 
      deletingUbicacion: ubicacion 
    }));
  };

  const closeAllModals = () => {
    setModalState({
      showModal: false,
      showEditModal: false,
      showDeleteModal: false,
      editingUbicacion: null,
      deletingUbicacion: null
    });
    setFormData({
      lugar: '',
      direccion: '',
      capacidad: '',
      descripcion: '',
      id_ciudad: ''
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

  const filteredUbicaciones = state.ubicaciones.filter(ubicacion => {
    const matchesSearch = state.searchTerm === '' ||
      ubicacion.lugar?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      ubicacion.direccion?.toLowerCase().includes(state.searchTerm.toLowerCase());
    return matchesSearch;
  });

  return {
    ...state,
    filteredUbicaciones,
    ...modalState,
    formData,
    handleCreate,
    handleUpdate,
    handleDelete,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeAllModals,
    handleInputChange,
    handleSearchChange,
    handleSidebarToggle,
    notifications: Array.isArray(notifications) ? notifications : [],
    closeNotification
  };
};