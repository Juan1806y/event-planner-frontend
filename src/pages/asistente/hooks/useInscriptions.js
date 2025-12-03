import { useState, useEffect } from 'react';
import { inscriptionService } from '../../../services/inscriptionService';
import { attendanceService } from '../../../services/attendanceService';

export const useInscriptions = () => {
    const [misInscripciones, setMisInscripciones] = useState([]);
    const [eventosInscritos, setEventosInscritos] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [asistenciasRegistradas, setAsistenciasRegistradas] = useState(new Set());
    const [registrandoAsistencia, setRegistrandoAsistencia] = useState(false);
    const [inscripcionRegistrando, setInscripcionRegistrando] = useState(null);

    const getToken = () => {
        const accessToken = localStorage.getItem('access_token');
        const token = localStorage.getItem('token');
        const authToken = localStorage.getItem('auth_token');
        return accessToken || token || authToken;
    };

    const cargarMisInscripciones = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken();

            if (!token) {
                throw new Error('No se encontró token de autenticación.');
            }

            const inscripcionesConAsistencias = await attendanceService.getMyAttendances(token);

            const inscripcionesFormateadas = inscripcionesConAsistencias.map(item => {
                const inscripcion = {
                    id: item.id,
                    codigo: item.codigo,
                    estado: item.estado || 'Confirmada',
                    fecha_inscripcion: item.fecha,
                    asistencias: item.asistencias || []
                };

                if (item.evento) {
                    inscripcion.evento = {
                        id: item.evento.id,
                        titulo: item.evento.titulo,
                        fecha_inicio: item.evento.fecha_inicio,
                        fecha_fin: item.evento.fecha_fin,
                        modalidad: item.evento.modalidad,
                        hora: item.evento.hora,
                        lugar: item.evento.lugar
                    };
                }

                return inscripcion;
            });

            setMisInscripciones(inscripcionesFormateadas);

            const eventosInscritosIds = new Set(inscripcionesFormateadas.map(insc => insc.evento?.id).filter(Boolean));
            setEventosInscritos(eventosInscritosIds);

            const hoy = new Date().toISOString().split('T')[0];
            const nuevasAsistencias = new Set();

            inscripcionesFormateadas.forEach(inscripcion => {
                if (inscripcion.asistencias && Array.isArray(inscripcion.asistencias)) {
                    const tieneAsistenciaHoy = inscripcion.asistencias.some(asistencia => {
                        const esHoy = asistencia.fecha === hoy;
                        const esPresente = asistencia.estado === 'Presente';
                        return esHoy && esPresente;
                    });

                    if (tieneAsistenciaHoy) {
                        nuevasAsistencias.add(inscripcion.id);
                    }
                }
            });

            setAsistenciasRegistradas(nuevasAsistencias);

            return inscripcionesFormateadas;

        } catch (error) {
            setError(error.message);
            setMisInscripciones([]);
            setEventosInscritos(new Set());
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrarAsistencia = async (inscripcion) => {
        try {
            setRegistrandoAsistencia(true);
            setInscripcionRegistrando(inscripcion.id);

            const token = getToken();
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }

            await attendanceService.registerAttendance(inscripcion.codigo, token);

            setAsistenciasRegistradas(prev => {
                return new Set([...prev, inscripcion.id]);
            });

            await cargarMisInscripciones();

        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setRegistrandoAsistencia(false);
            setInscripcionRegistrando(null);
        }
    };

    const puedeRegistrarAsistencia = (inscripcion) => {
        const hoy = new Date().toISOString().split('T')[0];

        if (asistenciasRegistradas.has(inscripcion.id)) {
            return false;
        }

        if (inscripcion.estado !== 'Confirmada') {
            return false;
        }

        const evento = inscripcion.evento;
        if (!evento) {
            return false;
        }

        const dentroDelRango = hoy >= evento.fecha_inicio && hoy <= evento.fecha_fin;
        return dentroDelRango;
    };

    const inscribirseEnEvento = async (eventId) => {
        const token = getToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        const result = await inscriptionService.createInscription(eventId, token);
        await cargarMisInscripciones();
        return result;
    };

    useEffect(() => {
        cargarMisInscripciones();
    }, []);

    return {
        misInscripciones,
        eventosInscritos,
        asistenciasRegistradas,
        loading,
        error,
        registrandoAsistencia,
        inscripcionRegistrando,
        cargarMisInscripciones,
        inscribirseEnEvento,
        handleRegistrarAsistencia,
        puedeRegistrarAsistencia
    };
};