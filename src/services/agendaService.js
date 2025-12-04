const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const agendaService = {
    async obtenerActividadesAgenda(misInscripciones, token) {
        try {
            if (!misInscripciones || misInscripciones.length === 0) {
                return [];
            }

            const actividadesPromises = misInscripciones.map(async (inscripcion) => {
                try {
                    const actividadesEvento = await this.obtenerActividadesEvento(inscripcion.evento.id, token);

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
                    return [];
                }
            });

            const todasActividades = await Promise.all(actividadesPromises);
            const actividadesPlanas = todasActividades.flat();

            const actividadesOrdenadas = actividadesPlanas.sort((a, b) => {
                const fechaA = new Date(`${a.fecha_actividad}T${a.hora_inicio}`);
                const fechaB = new Date(`${b.fecha_actividad}T${b.hora_inicio}`);
                return fechaA - fechaB;
            });

            return actividadesOrdenadas;

        } catch (error) {
            throw error;
        }
    },

    async obtenerActividadesEvento(eventoId, token) {
        try {
            const response = await fetch(`${API_URL}/eventos/${eventoId}/actividades`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Error al obtener actividades del evento');
            }

            return this.formatearActividadesEvento(result.data || []);
        } catch (error) {
            throw error;
        }
    },

    async obtenerActividadesPorFecha(misInscripciones, token, filtro = 'todas') {
        try {
            const todasActividades = await this.obtenerActividadesAgenda(misInscripciones, token);

            const hoy = new Date();
            const hoyFormateado = hoy.toISOString().split('T')[0];

            const hoyInicio = new Date(hoyFormateado);
            const hoyFin = new Date(hoyFormateado);
            hoyFin.setHours(23, 59, 59, 999);

            let actividadesFiltradas = todasActividades;

            switch (filtro) {
                case 'hoy':
                    actividadesFiltradas = todasActividades.filter(actividad => {
                        return actividad.fecha_actividad === hoyFormateado;
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
            }

            return actividadesFiltradas;

        } catch (error) {
            throw error;
        }
    },

    async obtenerAgendaAgrupada(misInscripciones, token) {
        try {
            const actividades = await this.obtenerActividadesAgenda(misInscripciones, token);

            const agendaPorFecha = {};
            actividades.forEach(actividad => {
                const fecha = actividad.fecha_actividad;
                if (!agendaPorFecha[fecha]) {
                    agendaPorFecha[fecha] = [];
                }
                agendaPorFecha[fecha].push(actividad);
            });

            const fechasOrdenadas = Object.keys(agendaPorFecha).sort();

            fechasOrdenadas.forEach(fecha => {
                agendaPorFecha[fecha].sort((a, b) => {
                    const horaA = new Date(`1970-01-01T${a.hora_inicio}`);
                    const horaB = new Date(`1970-01-01T${b.hora_inicio}`);
                    return horaA - horaB;
                });
            });

            return agendaPorFecha;

        } catch (error) {
            throw error;
        }
    },

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

    estaEnCurso(actividad) {
        const ahora = new Date();
        const inicio = new Date(`${actividad.fecha_actividad}T${actividad.hora_inicio}`);
        const fin = new Date(`${actividad.fecha_actividad}T${actividad.hora_fin}`);

        return ahora >= inicio && ahora <= fin;
    },

    esProxima(actividad) {
        const ahora = new Date();
        const fechaActividad = new Date(`${actividad.fecha_actividad}T${actividad.hora_inicio}`);
        return fechaActividad >= ahora;
    }
};

export default agendaService;