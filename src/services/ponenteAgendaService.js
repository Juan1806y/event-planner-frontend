import { API_PREFIX } from '../config/apiConfig';
const API_BASE = API_PREFIX;

export const ponenteAgendaService = {
    async obtenerAgendaPonente(token) {
        try {
            console.log('🎤 Obteniendo agenda del ponente...');

            const user = JSON.parse(localStorage.getItem('user'));
            const ponenteId = user?.id_ponente || user?.id;

            if (!ponenteId) {
                throw new Error('No se pudo identificar al ponente');
            }

            // Obtener actividades del ponente
            const actividades = await this.obtenerActividadesPonente(ponenteId, token);
            
            // Obtener eventos únicos para mostrar en el selector
            const eventos = await this.obtenerEventosPonente(ponenteId, token);

            console.log(`✅ Agenda del ponente: ${actividades.length} actividades en ${eventos.length} eventos`);

            return {
                actividades,
                eventos
            };

        } catch (error) {
            console.error('💥 Error en obtenerAgendaPonente:', error);
            throw error;
        }
    },

    /**
     * Obtiene las actividades asignadas al ponente
     */
    async obtenerActividadesPonente(ponenteId, token) {
        try {
            console.log(`🔍 Obteniendo actividades del ponente: ${ponenteId}`);

            const response = await fetch(`${API_BASE}/ponente-actividad/ponente/${ponenteId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status actividades ponente:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response actividades ponente:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`📦 Actividades del ponente ${ponenteId}:`, result);

            if (!result.success) {
                throw new Error(result.message || 'Error al obtener actividades del ponente');
            }

            return this.formatearActividadesPonente(result.data || []);
        } catch (error) {
            console.error('💥 Error en obtenerActividadesPonente:', error);
            throw error;
        }
    },

    /**
     * Obtiene los eventos donde el ponente tiene actividades
     */
    async obtenerEventosPonente(ponenteId, token) {
        try {
            const actividades = await this.obtenerActividadesPonente(ponenteId, token);
            
            // Extraer eventos únicos de las actividades
            const eventosMap = new Map();
            
            actividades.forEach(actividad => {
                if (actividad.evento && !eventosMap.has(actividad.evento.id)) {
                    eventosMap.set(actividad.evento.id, actividad.evento);
                }
            });

            return Array.from(eventosMap.values());
        } catch (error) {
            console.error('💥 Error en obtenerEventosPonente:', error);
            throw error;
        }
    },

    /**
     * Obtiene la agenda del ponente para un evento específico
     */
    async obtenerAgendaPorEvento(eventoId, token) {
        try {
            console.log(`📅 Obteniendo agenda del ponente para evento: ${eventoId}`);

            const user = JSON.parse(localStorage.getItem('user'));
            const ponenteId = user?.id_ponente || user?.id;

            if (!ponenteId) {
                throw new Error('No se pudo identificar al ponente');
            }

            const actividades = await this.obtenerActividadesPonente(ponenteId, token);
            
            // Filtrar actividades por evento y solo las aceptadas
            const actividadesEvento = actividades.filter(actividad => 
                actividad.evento?.id === eventoId && 
                actividad.estado === 'aceptado'
            );

            console.log(`✅ ${actividadesEvento.length} actividades para el evento ${eventoId}`);

            return actividadesEvento;
        } catch (error) {
            console.error('💥 Error en obtenerAgendaPorEvento:', error);
            throw error;
        }
    },

    /**
     * Formatea las actividades del ponente
     */
    formatearActividadesPonente(actividades) {
        return actividades.map(asignacion => ({
            id_asignacion: `${asignacion.id_ponente}-${asignacion.id_actividad}`,
            id_ponente: asignacion.id_ponente,
            id_actividad: asignacion.id_actividad,
            estado: asignacion.estado, // pendiente, aceptado, rechazado, solicitud_cambio
            fecha_asignacion: asignacion.fecha_asignacion,
            fecha_respuesta: asignacion.fecha_respuesta,
            notas: asignacion.notas,
            
            // Información de la actividad
            actividad: {
                id: asignacion.actividad?.id_actividad,
                titulo: asignacion.actividad?.titulo,
                descripcion: asignacion.actividad?.descripcion,
                hora_inicio: asignacion.actividad?.hora_inicio,
                hora_fin: asignacion.actividad?.hora_fin,
                fecha_actividad: asignacion.actividad?.fecha_actividad,
                tipo: asignacion.actividad?.tipo,
                ubicacion: asignacion.actividad?.ubicacion,
                materiales: asignacion.actividad?.materiales,
                url: asignacion.actividad?.url
            },

            // Información del evento
            evento: {
                id: asignacion.actividad?.evento?.id,
                nombre: asignacion.actividad?.evento?.nombre,
                descripcion: asignacion.actividad?.evento?.descripcion,
                fecha_inicio: asignacion.actividad?.evento?.fecha_inicio,
                fecha_fin: asignacion.actividad?.evento?.fecha_fin,
                estado: asignacion.actividad?.evento?.estado,
                modalidad: asignacion.actividad?.evento?.modalidad
            }
        }));
    },

    /**
     * Responde a una invitación (aceptar/rechazar)
     */
    async responderInvitacion(ponenteId, actividadId, aceptar, motivoRechazo = '', token) {
        try {
            console.log(`📝 Respondiendo invitación: ponente ${ponenteId}, actividad ${actividadId}, aceptar: ${aceptar}`);

            const payload = aceptar 
                ? { aceptar: true }
                : { 
                    aceptar: false, 
                    motivo_rechazo: motivoRechazo 
                };

            const response = await fetch(
                `${API_BASE}/ponente-actividad/${ponenteId}/${actividadId}/responder-invitacion`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            console.log('📡 Response status responder invitación:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response responder invitación:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Respuesta a invitación:', result);

            if (!result.success) {
                throw new Error(result.message || 'Error al responder invitación');
            }

            return result.data;
        } catch (error) {
            console.error('💥 Error en responderInvitacion:', error);
            throw error;
        }
    },

    /**
     * Solicita cambios en una actividad
     */
    async solicitarCambios(ponenteId, actividadId, cambiosSolicitados, justificacion, token) {
        try {
            console.log(`📋 Solicitando cambios: ponente ${ponenteId}, actividad ${actividadId}`, cambiosSolicitados);

            const response = await fetch(
                `${API_BASE}/ponente-actividad/${ponenteId}/${actividadId}/solicitar-cambio`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cambios_solicitados: cambiosSolicitados,
                        justificacion: justificacion
                    })
                }
            );

            console.log('📡 Response status solicitar cambios:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response solicitar cambios:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Solicitud de cambios enviada:', result);

            if (!result.success) {
                throw new Error(result.message || 'Error al solicitar cambios');
            }

            return result.data;
        } catch (error) {
            console.error('💥 Error en solicitarCambios:', error);
            throw error;
        }
    },

    /**
     * Obtiene actividades agrupadas por estado
     */
    async obtenerActividadesPorEstado(token, estado = null) {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const ponenteId = user?.id_ponente || user?.id;

            if (!ponenteId) {
                throw new Error('No se pudo identificar al ponente');
            }

            const actividades = await this.obtenerActividadesPonente(ponenteId, token);

            if (estado) {
                return actividades.filter(actividad => actividad.estado === estado);
            }

            // Agrupar por estado
            const agrupadas = {
                pendientes: actividades.filter(a => a.estado === 'pendiente'),
                aceptadas: actividades.filter(a => a.estado === 'aceptado'),
                rechazadas: actividades.filter(a => a.estado === 'rechazado'),
                con_solicitud: actividades.filter(a => a.estado === 'solicitud_cambio')
            };

            return agrupadas;
        } catch (error) {
            console.error('💥 Error en obtenerActividadesPorEstado:', error);
            throw error;
        }
    },

    /**
     * Verifica si una actividad está en curso (para el ponente)
     */
    estaEnCurso(actividad) {
        const ahora = new Date();
        const inicio = new Date(`${actividad.actividad.fecha_actividad}T${actividad.actividad.hora_inicio}`);
        const fin = new Date(`${actividad.actividad.fecha_actividad}T${actividad.actividad.hora_fin}`);

        return ahora >= inicio && ahora <= fin;
    },

    /**
     * Verifica si una actividad es próxima (para el ponente)
     */
    esProxima(actividad) {
        const ahora = new Date();
        const fechaActividad = new Date(`${actividad.actividad.fecha_actividad}T${actividad.actividad.hora_inicio}`);
        return fechaActividad >= ahora;
    },

    /**
     * Obtiene estadísticas del ponente
     */
    async obtenerEstadisticasPonente(token) {
        try {
            const actividades = await this.obtenerActividadesPorEstado(token);

            return {
                total: Object.values(actividades).flat().length,
                pendientes: actividades.pendientes.length,
                aceptadas: actividades.aceptadas.length,
                rechazadas: actividades.rechazadas.length,
                con_solicitud: actividades.con_solicitud.length,
                eventos: [...new Set(Object.values(actividades).flat().map(a => a.evento?.id))].length
            };
        } catch (error) {
            console.error('💥 Error en obtenerEstadisticasPonente:', error);
            throw error;
        }
    }
};

export default ponenteAgendaService;