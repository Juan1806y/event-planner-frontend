const API_BASE = 'http://localhost:3000/api';

export const agendaService = {
    async obtenerActividadesAgenda(misInscripciones, token) {
        try {
            console.log('📅 Obteniendo actividades de la agenda para', misInscripciones.length, 'eventos...');

            if (!misInscripciones || misInscripciones.length === 0) {
                return [];
            }

            // Obtener actividades de todos los eventos en paralelo
            const actividadesPromises = misInscripciones.map(async (inscripcion) => {
                try {
                    const actividadesEvento = await this.obtenerActividadesEvento(inscripcion.evento.id, token);

                    // Agregar información del evento padre a cada actividad
                    return actividadesEvento.map(actividad => ({
                        ...actividad,
                        evento: {
                            id: inscripcion.evento.id,
                            titulo: inscripcion.evento.titulo,
                            modalidad: inscripcion.evento.modalidad,
                            descripcion: inscripcion.evento.descripcion,
                            estado_evento: inscripcion.evento.estado_evento,
                            empresa: inscripcion.evento.empresa,
                            creador: inscripcion.evento.creador
                        },
                        inscripcion: {
                            id: inscripcion.id,
                            codigo: inscripcion.codigo,
                            estado: inscripcion.estado,
                            fecha_inscripcion: inscripcion.fecha_inscripcion
                        }
                    }));
                } catch (error) {
                    console.error(`Error obteniendo actividades para evento ${inscripcion.evento.id}:`, error);
                    return [];
                }
            });

            const todasActividades = await Promise.all(actividadesPromises);
            const actividadesPlanas = todasActividades.flat();

            // Ordenar actividades por fecha y hora
            const actividadesOrdenadas = actividadesPlanas.sort((a, b) => {
                const fechaA = new Date(`${a.fecha_actividad}T${a.hora_inicio}`);
                const fechaB = new Date(`${b.fecha_actividad}T${b.hora_inicio}`);
                return fechaA - fechaB;
            });

            console.log(`✅ Se obtuvieron ${actividadesOrdenadas.length} actividades de la agenda`);

            // Debug: mostrar todas las actividades obtenidas
            console.log('📋 Todas las actividades obtenidas:');
            actividadesOrdenadas.forEach((act, index) => {
                console.log(`   ${index + 1}. ${act.titulo} - ${act.fecha_actividad} ${act.hora_inicio}`);
            });

            return actividadesOrdenadas;

        } catch (error) {
            console.error('💥 Error en obtenerActividadesAgenda:', error);
            throw error;
        }
    },

    /**
     * Obtiene actividades de un evento específico
     */
    async obtenerActividadesEvento(eventoId, token) {
        try {
            console.log(`🔍 Obteniendo actividades del evento: ${eventoId}`);

            const response = await fetch(`${API_BASE}/eventos/${eventoId}/actividades`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status actividades:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response actividades:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`📦 Actividades del evento ${eventoId}:`, result);

            if (!result.success) {
                throw new Error(result.message || 'Error al obtener actividades del evento');
            }

            return this.formatearActividadesEvento(result.data || []);
        } catch (error) {
            console.error('💥 Error en obtenerActividadesEvento:', error);
            throw error;
        }
    },

    async obtenerActividadesPorFecha(misInscripciones, token, filtro = 'todas') {
        try {
            const todasActividades = await this.obtenerActividadesAgenda(misInscripciones, token);

            // Crear fecha de hoy en formato YYYY-MM-DD para comparación exacta
            const hoy = new Date();
            const hoyFormateado = hoy.toISOString().split('T')[0]; // "2024-01-15"

            // Para filtros de rango, usar fecha completa
            const hoyInicio = new Date(hoyFormateado);
            const hoyFin = new Date(hoyFormateado);
            hoyFin.setHours(23, 59, 59, 999);

            let actividadesFiltradas = todasActividades;

            switch (filtro) {
                case 'hoy':
                    actividadesFiltradas = todasActividades.filter(actividad => {
                        // Comparar solo la parte de la fecha (YYYY-MM-DD)
                        const fechaActividadFormateada = actividad.fecha_actividad;
                        console.log('🔍 Comparando fechas:', {
                            actividad: actividad.titulo,
                            fechaActividad: fechaActividadFormateada,
                            hoy: hoyFormateado,
                            coincide: fechaActividadFormateada === hoyFormateado
                        });
                        return fechaActividadFormateada === hoyFormateado;
                    });
                    break;

                case 'semana':
                    const finSemana = new Date(hoy);
                    finSemana.setDate(hoy.getDate() + 7);
                    finSemana.setHours(23, 59, 59, 999);

                    actividadesFiltradas = todasActividades.filter(actividad => {
                        const fechaActividad = new Date(actividad.fecha_actividad + 'T00:00:00');
                        return fechaActividad >= hoyInicio && fechaActividad <= finSemana;
                    });
                    break;

                case 'mes':
                    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                    finMes.setHours(23, 59, 59, 999);

                    actividadesFiltradas = todasActividades.filter(actividad => {
                        const fechaActividad = new Date(actividad.fecha_actividad + 'T00:00:00');
                        return fechaActividad >= hoyInicio && fechaActividad <= finMes;
                    });
                    break;

                case 'proximas':
                    actividadesFiltradas = todasActividades.filter(actividad => {
                        const fechaActividad = new Date(actividad.fecha_actividad + 'T' + actividad.hora_inicio);
                        return fechaActividad >= new Date();
                    });
                    break;

                case 'pasadas':
                    actividadesFiltradas = todasActividades.filter(actividad => {
                        const fechaActividad = new Date(actividad.fecha_actividad + 'T' + actividad.hora_fin);
                        return fechaActividad < new Date();
                    });
                    break;

                // 'todas' no filtra
            }

            console.log(`📊 Filtro "${filtro}": ${actividadesFiltradas.length} actividades de ${todasActividades.length} totales`);

            // Debug detallado para filtro "hoy"
            if (filtro === 'hoy') {
                console.log('🐛 Debug filtro HOY:');
                console.log('📅 Hoy:', hoyFormateado);
                console.log('📋 Actividades totales:', todasActividades.map(a => ({
                    titulo: a.titulo,
                    fecha: a.fecha_actividad,
                    coincide: a.fecha_actividad === hoyFormateado
                })));
            }

            return actividadesFiltradas;

        } catch (error) {
            console.error('💥 Error en obtenerActividadesPorFecha:', error);
            throw error;
        }
    },

    /**
     * Obtiene actividades agrupadas por fecha
     */
    async obtenerAgendaAgrupada(misInscripciones, token) {
        try {
            const actividades = await this.obtenerActividadesAgenda(misInscripciones, token);

            // Agrupar por fecha
            const agendaPorFecha = {};
            actividades.forEach(actividad => {
                const fecha = actividad.fecha_actividad;
                if (!agendaPorFecha[fecha]) {
                    agendaPorFecha[fecha] = [];
                }
                agendaPorFecha[fecha].push(actividad);
            });

            // Ordenar fechas
            const fechasOrdenadas = Object.keys(agendaPorFecha).sort();

            // Ordenar actividades dentro de cada fecha por hora
            fechasOrdenadas.forEach(fecha => {
                agendaPorFecha[fecha].sort((a, b) => {
                    const horaA = new Date(`1970-01-01T${a.hora_inicio}`);
                    const horaB = new Date(`1970-01-01T${b.hora_inicio}`);
                    return horaA - horaB;
                });
            });

            return agendaPorFecha;

        } catch (error) {
            console.error('💥 Error en obtenerAgendaAgrupada:', error);
            throw error;
        }
    },

    /**
     * Formatea actividades de un evento específico
     */
    formatearActividadesEvento(actividades) {
        return actividades.map(actividad => ({
            id_actividad: actividad.id_actividad,
            titulo: actividad.titulo,
            descripcion: actividad.descripcion,
            hora_inicio: actividad.hora_inicio,
            hora_fin: actividad.hora_fin,
            fecha_actividad: actividad.fecha_actividad,
            url: actividad.url,
            id_evento: actividad.id_evento,
            lugares: actividad.lugares || []
        }));
    },

    /**
     * Verifica si una actividad está en curso
     */
    estaEnCurso(actividad) {
        const ahora = new Date();
        const inicio = new Date(`${actividad.fecha_actividad}T${actividad.hora_inicio}`);
        const fin = new Date(`${actividad.fecha_actividad}T${actividad.hora_fin}`);

        return ahora >= inicio && ahora <= fin;
    },

    /**
     * Verifica si una actividad es próxima (hoy o futuro)
     */
    esProxima(actividad) {
        const ahora = new Date();
        const fechaActividad = new Date(`${actividad.fecha_actividad}T${actividad.hora_inicio}`);
        return fechaActividad >= ahora;
    }
};

export default agendaService;