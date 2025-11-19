import { useState, useEffect, useCallback } from 'react';
import { ponenteAgendaService } from '../../../services/ponenteAgendaService';

export const usePonenteAgenda = () => {
    const [agenda, setAgenda] = useState({ actividades: [], eventos: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);

    const getToken = () => {
        return localStorage.getItem('access_token');
    };

    const getPonenteId = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.id_ponente || user?.id;
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

            const data = await ponenteAgendaService.obtenerAgendaPonente(token);
            console.log('📊 Datos obtenidos del servicio:', data);
            setAgenda(data);

            // Cargar estadísticas
            try {
                const stats = await ponenteAgendaService.obtenerEstadisticasPonente(token);
                setEstadisticas(stats);
            } catch (statsError) {
                console.warn('No se pudieron cargar las estadísticas:', statsError);
                // No romper el flujo por errores en estadísticas
            }

            return data;
        } catch (err) {
            console.error('❌ Error cargando agenda del ponente:', err);
            setError(err.message);
            // Asegurar que agenda tenga estructura válida incluso en error
            setAgenda({ actividades: [], eventos: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    // Responder invitación
    const responderInvitacion = useCallback(async (actividadId, aceptar, motivoRechazo = '') => {
        try {
            const token = getToken();
            const ponenteId = getPonenteId();

            if (!ponenteId) {
                throw new Error('No se pudo identificar al ponente');
            }

            await ponenteAgendaService.responderInvitacion(ponenteId, actividadId, aceptar, motivoRechazo, token);
            
            // Recargar agenda después de responder
            await cargarAgenda();
            
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, [cargarAgenda]);

    // Solicitar cambios
    const solicitarCambios = useCallback(async (actividadId, cambiosSolicitados, justificacion) => {
        try {
            const token = getToken();
            const ponenteId = getPonenteId();

            if (!ponenteId) {
                throw new Error('No se pudo identificar al ponente');
            }

            await ponenteAgendaService.solicitarCambios(ponenteId, actividadId, cambiosSolicitados, justificacion, token);
            
            // Recargar agenda después de solicitar cambios
            await cargarAgenda();
            
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    }, [cargarAgenda]);

    // Obtener agenda por evento
    const cargarAgendaPorEvento = useCallback(async (eventoId) => {
        try {
            setLoading(true);
            const token = getToken();
            const actividades = await ponenteAgendaService.obtenerAgendaPorEvento(eventoId, token);
            return actividades || [];
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar actividades por estado
    const cargarActividadesPorEstado = useCallback(async (estado = null) => {
        try {
            const token = getToken();
            const result = await ponenteAgendaService.obtenerActividadesPorEstado(token, estado);
            return result || [];
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Cargar al montar el componente
    useEffect(() => {
        cargarAgenda();
    }, [cargarAgenda]);

    return {
        actividades: agenda.actividades || [], // Asegurar que siempre sea array
        eventos: agenda.eventos || [], // Asegurar que siempre sea array
        estadisticas,
        loading,
        error,
        cargarAgenda,
        responderInvitacion,
        solicitarCambios,
        cargarAgendaPorEvento,
        cargarActividadesPorEstado,
        refetch: cargarAgenda
    };
};