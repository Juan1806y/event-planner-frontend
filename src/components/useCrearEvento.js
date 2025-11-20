import { useState, useEffect, useCallback } from 'react';
import {
    obtenerPerfil,
    obtenerEventoPorId,
    obtenerActividadesEvento,
    crearEvento,
    crearActividad,
    actualizarEvento,
    actualizarActividad,
} from './eventosService';
import { useNavigate } from 'react-router-dom';

export const useEvento = (idEvento = null) => {
    const navigate = useNavigate();

    const [empresa, setEmpresa] = useState(null);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        modalidad: 'Presencial',   // Ahora permitiremos "Hibrido"
        cupos: '',
        estado: 0,
        hora: "",
    });

    const [actividades, setActividades] = useState([
        { titulo: '', descripcion: '', fecha_actividad: '', hora_inicio: '', hora_fin: '' }
    ]);

    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [loading, setLoading] = useState(true);
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

    const formatearHora = (h) => {
        if (!h) return "";
        return h.slice(0, 5);
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

        // NO hay validación de lugar ni URL porque backend NO los pide

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
                cupos: evento.cupos ?? "",
                estado: evento.estado ?? 0,
                hora: formatearHora(evento.hora),
            });

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
                            ? new Date(a.fecha_actividad).toISOString().split("T")[0]
                            : "",
                        hora_inicio: a.hora_inicio ?? "",
                        hora_fin: a.hora_fin ?? "",
                        esExistente: true,
                    }))
                    : [{
                        titulo: "",
                        descripcion: "",
                        fecha_actividad: "",
                        hora_inicio: "",
                        hora_fin: "",
                        esExistente: false,
                    }]
            );
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo cargar el evento" });
        }
    }, []);

    const handleInputChange = (campo, valor) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
    };

    const guardarEvento = async () => {
        if (!validarFormulario()) return;

        setGuardando(true);
        setEnviando(true);

        const dataAEnviar = {
            ...formData,
            hora: formatearHora(formData.hora),
        };

        // Normalizamos modalidad para backend (sin tilde)
        if (dataAEnviar.modalidad === "Híbrida") {
            dataAEnviar.modalidad = "Híbrida";
        }
        console.log("ENVIANDO:", dataAEnviar);


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

                const perfil = await obtenerPerfil();
                const empresaId = perfil.data?.usuario?.rolData?.id_empresa;
                const nombreEmpresa =
                    perfil.data?.usuario?.rolData?.empresa?.nombre || "Mi Empresa";

                if (!empresaId)
                    throw new Error("No se pudo obtener el ID de la empresa.");

                setEmpresa({ id: empresaId, nombre: nombreEmpresa });

                if (idEvento) await cargarEvento(idEvento);
            } catch {
                setError("Error al cargar datos");
                setMensaje({ tipo: "error", texto: "Error al cargar datos" });
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [idEvento]);

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
        formData,
        setFormData,
        actividades,
        setActividades,
        mensaje,
        loading,
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
        handleVolver,
        handleCerrarModal
    };
};
