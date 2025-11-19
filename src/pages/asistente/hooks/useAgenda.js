import { useState, useEffect, useMemo } from 'react';

export const useAgenda = (misInscripciones = []) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const actividades = useMemo(() => {
        if (!misInscripciones || misInscripciones.length === 0) {
            return [];
        }

        const todasActividades = [];

        misInscripciones.forEach(inscripcion => {
            const evento = inscripcion.evento;

            if (evento && evento.actividades && Array.isArray(evento.actividades)) {
                evento.actividades.forEach(actividad => {
                    // Solo incluir actividades de eventos confirmados
                    if (inscripcion.estado === 'Confirmada') {
                        todasActividades.push({
                            id: actividad.id_actividad || actividad.id,
                            titulo: actividad.titulo,
                            descripcion: actividad.descripcion,
                            hora_inicio: actividad.hora_inicio,
                            hora_fin: actividad.hora_fin,
                            fecha_actividad: actividad.fecha_actividad,
                            url: actividad.url,
                            evento: {
                                id: evento.id,
                                titulo: evento.titulo,
                                modalidad: evento.modalidad,
                                empresa: evento.empresa
                            },
                            lugares: actividad.lugares || [],
                            inscripcion_id: inscripcion.id
                        });
                    }
                });
            }
        });

        return todasActividades;
    }, [misInscripciones]);

    // Agrupar actividades por fecha
    const actividadesAgrupadas = useMemo(() => {
        return actividades.reduce((agrupadas, actividad) => {
            const fecha = actividad.fecha_actividad;
            if (!agrupadas[fecha]) {
                agrupadas[fecha] = [];
            }
            agrupadas[fecha].push(actividad);
            return agrupadas;
        }, {});
    }, [actividades]);

    // Ordenar fechas
    const fechasOrdenadas = useMemo(() => {
        return Object.keys(actividadesAgrupadas).sort();
    }, [actividadesAgrupadas]);

    // Filtrar actividades futuras y pasadas
    const actividadesFuturas = useMemo(() => {
        const hoy = new Date().toISOString().split('T')[0];
        return actividades.filter(actividad => actividad.fecha_actividad >= hoy);
    }, [actividades]);

    const actividadesPasadas = useMemo(() => {
        const hoy = new Date().toISOString().split('T')[0];
        return actividades.filter(actividad => actividad.fecha_actividad < hoy);
    }, [actividades]);

    return {
        actividades,
        actividadesAgrupadas,
        fechasOrdenadas,
        actividadesFuturas,
        actividadesPasadas,
        loading,
        error,
        tieneActividades: actividades.length > 0
    };
};