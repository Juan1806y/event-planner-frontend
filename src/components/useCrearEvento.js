import { useState, useEffect, useCallback } from 'react';
import {
    obtenerPerfil,
    obtenerEventoPorId,
    obtenerActividadesEvento,
    obtenerUbicaciones,
    obtenerLugares,
    crearEvento,
    crearActividad,
    actualizarEvento,
    actualizarActividad,
} from './eventosService';
import { useNavigate } from 'react-router-dom';

export const useEvento = (idEvento = null) => {
    const navigate = useNavigate();

    const [empresa, setEmpresa] = useState(null);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
    const [lugares, setLugares] = useState([]);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        modalidad: 'Presencial',
        id_lugar: '',
        cupos: '',
        estado: 0,
        url_virtual: '',
        descripcion_adicional: '',
        hora: "",
    });

    const [actividades, setActividades] = useState([
        { titulo: '', descripcion: '', fecha_actividad: '', hora_inicio: '', hora_fin: '' }
    ]);

    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [loading, setLoading] = useState(true);
    const [cargando, setCargando] = useState(true);
    const [errorCupos, setErrorCupos] = useState({ mostrar: false, mensaje: '', capacidadLugar: 0 });
    const [guardando, setGuardando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [mostrarModalExito, setMostrarModalExito] = useState(false);
    const [mostrarModalError, setMostrarModalError] = useState(false);
    const [error, setError] = useState(null);

    const handleVolver = () => navigate('/organizador');

    const handleCerrarModal = useCallback(() => {
        setMostrarModalExito(false);
        navigate("/organizador");
    }, [navigate]);

    const obtenerCapacidadLugar = (idLugar) => {
        const lugar = lugares.find(l => String(l.id) === String(idLugar));
        return lugar?.capacidad ?? null;
    };

    const formatearHora = (h) => {
        if (!h) return "";
        return h.slice(0, 5);
    };

    const validarCuposContraCapacidad = (idLugar, cupos) => {
        const capacidad = obtenerCapacidadLugar(idLugar);
        const excedido = capacidad && parseInt(cupos) > capacidad;

        setErrorCupos({
            mostrar: excedido,
            mensaje: excedido ? `Los cupos (${cupos}) exceden la capacidad del lugar (${capacidad}).` : '',
            capacidadLugar: excedido ? capacidad : 0
        });

        return !excedido;
    };

    const validarFormulario = () => {
        if (!formData.titulo.trim()) {
            setMensaje({ tipo: 'error', texto: 'El título es obligatorio' });
            return false;
        }

        if (!formData.fecha_inicio || !formData.fecha_fin) {
            setMensaje({ tipo: 'error', texto: 'Debes ingresar fechas válidas' });
            return false;
        }

        if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
            setMensaje({ tipo: 'error', texto: 'La fecha final no puede ser anterior' });
            return false;
        }

        const requiereLugar = ['Presencial', 'Híbrido'].includes(formData.modalidad);

        if (requiereLugar && formData.id_lugar && formData.cupos) {
            if (!validarCuposContraCapacidad(formData.id_lugar, formData.cupos)) {
                setMostrarModalError(true);
                return false;
            }
        }

        return true;
    };

    const cargarEvento = useCallback(async (id) => {
        try {
            const eventoRes = await obtenerEventoPorId(id);
            const evento = eventoRes.data;

            const formatearFecha = (f) =>
                f ? new Date(f).toISOString().split("T")[0] : "";

            setFormData({
                titulo: evento.titulo ?? "",
                descripcion: evento.descripcion ?? "",
                fecha_inicio: formatearFecha(evento.fecha_inicio),
                fecha_fin: formatearFecha(evento.fecha_fin),
                modalidad: evento.modalidad ?? "Presencial",
                id_lugar: evento.id_lugar ?? "",
                cupos: evento.cupos ?? "",
                estado: evento.estado ?? 0,
                url_virtual: evento.url_virtual ?? "",
                descripcion_adicional: evento.descripcion_adicional ?? "",
                hora: formatearHora(evento.hora),
            });


            if (evento.id_lugar && lugares.length) {
                const lugar = lugares.find(
                    (l) => String(l.id) === String(evento.id_lugar)
                );
                const posibleUbicacion =
                    lugar?.id_ubicacion ??
                    lugar?.ubicacion_id ??
                    lugar?.ubicacion?.id;

                if (posibleUbicacion) setUbicacionSeleccionada(posibleUbicacion);
            }

            const actsRes = await obtenerActividadesEvento(id);
            const acts = Array.isArray(actsRes.data)
                ? actsRes.data
                : [actsRes.data];

            setActividades(
                acts.length
                    ? acts.map((a) => ({
                        id: a.id,
                        titulo: a.titulo ?? "",
                        descripcion: a.descripcion ?? "",
                        fecha_actividad: a.fecha_actividad
                            ? new Date(a.fecha_actividad)
                                .toISOString()
                                .split("T")[0]
                            : "",
                        hora_inicio: a.hora_inicio ?? "",
                        hora_fin: a.hora_fin ?? "",
                        esExistente: true,
                    }))
                    : [
                        {
                            titulo: "",
                            descripcion: "",
                            fecha_actividad: "",
                            hora_inicio: "",
                            hora_fin: "",
                            esExistente: false,
                        },
                    ]
            );
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo cargar el evento" });
        }
    }, [lugares]);


    const handleInputChange = (campo, valor) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));

        if (['id_lugar', 'cupos'].includes(campo)) {
            const idLugar = campo === 'id_lugar' ? valor : formData.id_lugar;
            const cupos = campo === 'cupos' ? valor : formData.cupos;

            if (formData.modalidad !== 'Virtual' && idLugar && cupos) {
                validarCuposContraCapacidad(idLugar, cupos);
            }
        }

        if (campo === 'modalidad') {
            setFormData(prev => ({
                ...prev,
                id_lugar: valor === 'Virtual' ? '' : prev.id_lugar,
                url_virtual: valor === 'Presencial' ? '' : prev.url_virtual
            }));
        }
    };

    const guardarEvento = async () => {
        if (!validarFormulario()) return;

        setGuardando(true);
        setEnviando(true);

        const dataAEnviar = {
            ...formData,
            hora: formatearHora(formData.hora),
        };

        try {
            const eventoGuardado = idEvento
                ? await actualizarEvento(idEvento, dataAEnviar)
                : await crearEvento({ ...dataAEnviar, id_empresa: empresa.id });


            const eventoId = idEvento || eventoGuardado?.data?.id;

            for (const act of actividades) {
                if (!act.titulo?.trim()) continue;
                act.id
                    ? await actualizarActividad(act.id, act)
                    : await crearActividad(eventoId, act);
            }

            setMostrarModalExito(true);
        } catch {
            setMensaje({ tipo: 'error', texto: 'Error al guardar el evento' });
        } finally {
            setGuardando(false);
            setEnviando(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await guardarEvento();
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                setCargando(true);

                const perfil = await obtenerPerfil();
                const empresaId = perfil.data?.usuario?.rolData?.id_empresa;
                const nombreEmpresa =
                    perfil.data?.usuario?.rolData?.empresa?.nombre || "Mi Empresa";

                if (!empresaId) throw new Error("No se pudo obtener el ID de la empresa desde el perfil.");

                setEmpresa({ id: empresaId, nombre: nombreEmpresa });

                const ubicacionesData = await obtenerUbicaciones(empresaId);
                setUbicaciones(Array.isArray(ubicacionesData.data) ? ubicacionesData.data : [ubicacionesData.data]);

                const lugaresData = await obtenerLugares(empresaId);
                setLugares(Array.isArray(lugaresData.data) ? lugaresData.data : [lugaresData.data]);

                if (idEvento) await cargarEvento(idEvento);
            } catch {
                setError("Error al cargar datos");
                setMensaje({ tipo: "error", texto: "Error al cargar datos" });
            } finally {
                setLoading(false);
                setCargando(false);
            }
        };

        cargarDatos();
    }, [idEvento]);

    useEffect(() => {
        if (!empresa?.id) return;

        const cargar = async () => {
            if (!ubicacionSeleccionada) {
                setLugares([]);
                setFormData(prev => ({ ...prev, id_lugar: '' }));
                return;
            }

            try {
                const data = await obtenerLugares(empresa.id, ubicacionSeleccionada);

                const filtrados = Array.isArray(data.data)
                    ? data.data.filter(l => String(l.id_ubicacion) === String(ubicacionSeleccionada))
                    : [];

                setLugares(filtrados);
                setFormData(prev => ({ ...prev, id_lugar: '' }));
            } catch {
                setLugares([]);
                setFormData(prev => ({ ...prev, id_lugar: '' }));
            }
        };

        cargar();
    }, [ubicacionSeleccionada, empresa?.id]);

    useEffect(() => {
        if (mostrarModalExito) {
            const timer = setTimeout(() => {
                handleCerrarModal();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [mostrarModalExito, handleCerrarModal]);


    return {
        empresa,
        ubicaciones,
        ubicacionSeleccionada,
        setUbicacionSeleccionada,
        lugares,
        formData,
        setFormData,
        actividades,
        setActividades,
        mensaje,
        loading,
        cargando,
        guardando,
        enviando,
        error,
        mostrarModalExito,
        mostrarModalError,
        setMostrarModalExito,
        setMostrarModalError,
        handleInputChange,
        guardarEvento,
        handleSubmit,
        errorCupos,
        setErrorCupos,
        obtenerCapacidadLugar,
        handleVolver,
        handleCerrarModal
    };
};
