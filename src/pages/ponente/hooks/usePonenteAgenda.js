import { useState, useEffect, useCallback } from 'react';
import { ponenteAgendaService } from '../../../services/ponenteAgendaService';

export const usePonenteAgenda = () => {
    const [agenda, setAgenda] = useState({ actividades: [], eventos: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);

    const getToken = () => {
        const token = localStorage.getItem('access_token');
        console.log('🔐 Token encontrado:', token ? 'Sí' : 'No');
        return token;
    };

    const getPonenteId = () => {
        try {
            const userStr = localStorage.getItem('user');
            console.log('👤 User string del localStorage:', userStr);

            if (!userStr) {
                console.warn('❌ No se encontró usuario en localStorage');
                return null;
            }

            const user = JSON.parse(userStr);
            console.log('👤 Usuario completo del localStorage:', user);

            // CORREGIDO: Buscar el ID del ponente en rolData
            const ponenteId = user?.rolData?.id_ponente || user?.id_ponente;

            console.log('🔍 ID del ponente encontrado:', ponenteId);

            if (!ponenteId) {
                console.warn('⚠️ No se pudo encontrar un ID de ponente válido');
                console.log('Estructura del usuario:', JSON.stringify(user, null, 2));
            }

            return ponenteId;
        } catch (error) {
            console.error('💥 Error al obtener usuario del localStorage:', error);
            return null;
        }
    };

    // Cargar agenda completa del ponente
    const cargarAgenda = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const ponenteId = getPonenteId();
            if (!ponenteId) {
                throw new Error('No se pudo identificar al ponente. El usuario logueado no tiene un ID de ponente válido.');
            }

            console.log('🔄 Iniciando carga de agenda para ponente ID:', ponenteId);
            const data = await ponenteAgendaService.obtenerAgendaPonente(ponenteId, token);

            console.log('📊 Datos FINALES obtenidos del servicio:', data);
            console.log(`📈 Actividades: ${data.actividades?.length || 0}`);
            console.log(`📈 Eventos: ${data.eventos?.length || 0}`);

            setAgenda(data);

            return data;
        } catch (err) {
            console.error('❌ Error cargando agenda del ponente:', err);
            setError(err.message);
            setAgenda({ actividades: [], eventos: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        console.log('🎯 usePonenteAgenda - Montando hook');
        cargarAgenda();
    }, [cargarAgenda]);

    return {
        actividades: agenda.actividades || [],
        eventos: agenda.eventos || [],
        estadisticas,
        loading,
        error,
        cargarAgenda,
        refetch: cargarAgenda
    };
};