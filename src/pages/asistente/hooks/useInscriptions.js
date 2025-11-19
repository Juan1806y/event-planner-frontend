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

            console.log('🔄 Cargando inscripciones CON asistencias...');

            // Cargar desde el endpoint que incluye asistencias
            const inscripcionesConAsistencias = await attendanceService.getMyAttendances(token);
            console.log('✅ Inscripciones con asistencias cargadas:', inscripcionesConAsistencias);

            // Formatear manualmente para asegurar estructura consistente
            const inscripcionesFormateadas = inscripcionesConAsistencias.map(item => {
                // Crear objeto con estructura esperada
                const inscripcion = {
                    id: item.id,
                    codigo: item.codigo,
                    estado: item.estado || 'Confirmada',
                    fecha_inscripcion: item.fecha,
                    asistencias: item.asistencias || []
                };

                // Formatear evento si existe
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

            console.log('📦 Inscripciones formateadas:', inscripcionesFormateadas);
            setMisInscripciones(inscripcionesFormateadas);

            // Actualizar eventos inscritos
            const eventosInscritosIds = new Set(inscripcionesFormateadas.map(insc => insc.evento?.id).filter(Boolean));
            setEventosInscritos(eventosInscritosIds);

            // ACTUALIZAR ASISTENCIAS REGISTRADAS HOY
            const hoy = new Date().toISOString().split('T')[0];
            const nuevasAsistencias = new Set();

            inscripcionesFormateadas.forEach(inscripcion => {
                if (inscripcion.asistencias && Array.isArray(inscripcion.asistencias)) {
                    const tieneAsistenciaHoy = inscripcion.asistencias.some(asistencia => {
                        const esHoy = asistencia.fecha === hoy;
                        const esPresente = asistencia.estado === 'Presente';

                        if (esHoy && esPresente) {
                            console.log(`✅ Asistencia HOY para inscripción ${inscripcion.id} - Evento: ${inscripcion.evento?.titulo}`);
                            return true;
                        }
                        return false;
                    });

                    if (tieneAsistenciaHoy) {
                        nuevasAsistencias.add(inscripcion.id);
                    }
                }
            });

            console.log('📋 Asistencias registradas HOY:', Array.from(nuevasAsistencias));
            setAsistenciasRegistradas(nuevasAsistencias);

            return inscripcionesFormateadas;

        } catch (error) {
            console.error('❌ Error al cargar inscripciones:', error);
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

            console.log('📝 Registrando asistencia para:', {
                inscripcionId: inscripcion.id,
                eventoTitulo: inscripcion.evento?.titulo,
                codigo: inscripcion.codigo,
                fechaInicio: inscripcion.evento?.fecha_inicio,
                fechaFin: inscripcion.evento?.fecha_fin
            });

            // 1. Registrar en el backend (el backend valida las fechas)
            await attendanceService.registerAttendance(inscripcion.codigo, token);

            // 2. Actualizar INMEDIATAMENTE el estado local
            setAsistenciasRegistradas(prev => {
                const nuevoSet = new Set([...prev, inscripcion.id]);
                console.log('🔄 Estado local actualizado:', Array.from(nuevoSet));
                return nuevoSet;
            });

            console.log('✅ Asistencia registrada exitosamente');

            // 3. Recargar para sincronizar completamente
            await cargarMisInscripciones();

        } catch (error) {
            console.error('❌ Error al registrar asistencia:', error);
            setError(error.message);
            throw error;
        } finally {
            setRegistrandoAsistencia(false);
            setInscripcionRegistrando(null);
        }
    };

    const puedeRegistrarAsistencia = (inscripcion) => {
        const hoy = new Date().toISOString().split('T')[0];

        console.log(`🔍 Verificando inscripción ${inscripcion.id} (${inscripcion.evento?.titulo}):`, {
            estado: inscripcion.estado,
            yaRegistroHoy: asistenciasRegistradas.has(inscripcion.id),
            fechaInicio: inscripcion.evento?.fecha_inicio,
            fechaFin: inscripcion.evento?.fecha_fin,
            hoy: hoy,
            dentroRango: hoy >= inscripcion.evento?.fecha_inicio && hoy <= inscripcion.evento?.fecha_fin
        });

        // 1. Si ya registró asistencia hoy, no puede registrar de nuevo
        if (asistenciasRegistradas.has(inscripcion.id)) {
            console.log(`❌ Ya tiene asistencia registrada hoy`);
            return false;
        }

        // 2. Si la inscripción no está confirmada, no puede registrar
        if (inscripcion.estado !== 'Confirmada') {
            console.log(`❌ Inscripción no confirmada: ${inscripcion.estado}`);
            return false;
        }

        const evento = inscripcion.evento;
        if (!evento) {
            console.log(`❌ No hay información del evento`);
            return false;
        }

        // 3. Solo puede registrar si hoy está dentro del rango del evento
        const dentroDelRango = hoy >= evento.fecha_inicio && hoy <= evento.fecha_fin;
        console.log(`📅 Puede registrar: ${dentroDelRango} (${evento.fecha_inicio} a ${evento.fecha_fin})`);

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