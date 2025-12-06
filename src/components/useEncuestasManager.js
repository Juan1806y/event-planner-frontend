import { useState, useEffect } from 'react';
import { obtenerEventos, obtenerPerfil, obtenerActividadesEvento } from '../../src/components/eventosService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';


export const useEncuestasManager = () => {
    const [encuestas, setEncuestas] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [mostrarEnvioEncuesta, setMostrarEnvioEncuesta] = useState(false);
    const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
    const [errores, setErrores] = useState({});
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [cargando, setCargando] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        tipo_encuesta: 'satisfaccion_evento',
        momento: 'despues',
        url_google_form: '',
        url_respuestas: '',
        estado: 'borrador',
        fecha_inicio: '',
        fecha_fin: '',
        id_evento: '',
        id_actividad: null,
        obligatoria: false,
        descripcion: ''
    });

    const getAuthToken = () => {
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    };

    const getHeaders = () => ({
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        cargarEventos();
    }, []);

    const cargarEventos = async () => {
        try {
            const perfil = await obtenerPerfil();
            const idCreador = perfil?.data?.usuario?.id
                || perfil?.data?.id
                || perfil?.usuario?.id
                || perfil?.id
                || perfil?.usuario_id
                || null;

            const data = await obtenerEventos();
            const listaEventos = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);

            const eventosDelCreador = listaEventos.filter((e) => {
                if (!idCreador) return false;
                const creadorFields = [
                    e.id_creador,
                    e.creador?.id,
                    e.creador_id,
                    e.usuario?.id,
                    e.usuario_id,
                    e.idCreador,
                    e.owner_id,
                    e.owner?.id
                ];

                return creadorFields.some(field => String(field) === String(idCreador));
            });

            setEventos(eventosDelCreador);
        } catch (error) {
            mostrarMensaje('error', 'Error al cargar eventos.');
        }
    };

    const cargarEncuestas = async (eventoId) => {
    try {
        setCargando(true);
        const response = await fetch(`${API_URL}/encuestas?evento_id=${eventoId}`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response. ok) {
            throw new Error(`Error al obtener encuestas: ${response. status}`);
        }

        const data = await response.json();

        let listaEncuestas = [];
        if (Array.isArray(data)) {
            listaEncuestas = data;
        } else if (data.data && Array.isArray(data.data)) {
            listaEncuestas = data.data;
        } else if (data.encuestas && Array. isArray(data. encuestas)) {
            listaEncuestas = data. encuestas;
        }

        // Obtener estadísticas para cada encuesta
        const encuestasConEstadisticas = await Promise.all(
            listaEncuestas.map(async (encuesta) => {
                try {
                    const statsResponse = await fetch(
                        `${API_URL}/encuestas/${encuesta.id}/estadisticas`,
                        { method: 'GET', headers: getHeaders() }
                    );
                    if (statsResponse.ok) {
                        const stats = await statsResponse. json();
                        return {
                            ... encuesta,
                            total_completadas: stats.total_completadas || stats.data?. total_completadas || 0
                        };
                    }
                } catch (error) {
                    console.error(`Error obteniendo estadísticas para encuesta ${encuesta.id}:`, error);
                }
                return { ...encuesta, total_completadas: 0 };
            })
        );

        setEncuestas(encuestasConEstadisticas);
    } catch (error) {
        setEncuestas([]);
        mostrarMensaje('error', 'Error al cargar las encuestas.');
    } finally {
        setCargando(false);
    }
};

    const cargarActividades = async (eventoId) => {
        try {
            const data = await obtenerActividadesEvento(eventoId);
            console.log('Datos de actividades recibidos:', data);

            const lista = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.actividades)
                        ? data.actividades
                        : [];

            const actividadesMapeadas = lista.map(actividad => ({
                ...actividad,
                id: actividad.id || actividad.id_actividad
            }));

            console.log('Actividades mapeadas:', actividadesMapeadas);
            setActividades(actividadesMapeadas);
        } catch (error) {
            console.error('Error cargando actividades:', error);
            setActividades([]);
        }
    };

    const seleccionarEvento = async (evento) => {
        setEventoSeleccionado(evento);
        await cargarEncuestas(evento.id);
        await cargarActividades(evento.id);
    };

    const volverAEventos = () => {
        setEventoSeleccionado(null);
        setEncuestas([]);
        setActividades([]);
        setMostrarFormulario(false);
        setMostrarResultados(false);
        setMostrarEnvioEncuesta(false);
        setMostrarEstadisticas(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        let valorFinal = type === 'checkbox' ? checked : value;

        if (name === 'id_actividad') {
            valorFinal = value === '' ? null : value;
        }

        setFormData(prev => ({
            ...prev,
            [name]: valorFinal
        }));

        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'id_evento') {
            cargarActividades(value);
            setFormData(prev => ({ ...prev, id_actividad: null }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.titulo.trim()) {
            nuevosErrores.titulo = 'El título es obligatorio.';
        }

        if (!formData.url_google_form.trim()) {
            nuevosErrores.url_google_form = 'La URL del formulario es obligatoria.';
        }

        if (!formData.id_evento) {
            nuevosErrores.id_evento = 'Debes seleccionar un evento.';
        }

        if (formData.fecha_inicio && formData.fecha_fin) {
            if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
                nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio.';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const esValido = validarFormulario();

        if (!esValido) {
            mostrarMensaje('error', 'Por favor corrige los errores en el formulario.');
            return;
        }

        try {
            setCargando(true);
            console.log('Datos enviados en formData:', formData);

            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion
                ? `${API_URL}/encuestas/${encuestaSeleccionada.id}`
                : `${API_URL}/encuestas`;

            const response = await fetch(url, {
                method: metodo,
                headers: getHeaders(),
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.message
                    || errorData?.error
                    || errorData?.errors
                    || `Error ${response.status}: ${response.statusText}`;

                throw new Error(errorMessage);
            }

            mostrarMensaje('success', modoEdicion ? 'Encuesta actualizada correctamente' : 'Encuesta creada correctamente');
            cerrarFormulario();
            cargarEncuestas(eventoSeleccionado.id);
        } catch (error) {
            mostrarMensaje('error', error.message || 'Error al guardar la encuesta.');
        } finally {
            setCargando(false);
        }
    };

    const mostrarMensaje = (tipo, texto) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
    };

    const abrirEstadisticas = (encuesta) => {
        setEncuestaSeleccionada(encuesta);
        setMostrarEstadisticas(true);
    };

    const cerrarEstadisticas = () => {
        setMostrarEstadisticas(false);
        setEncuestaSeleccionada(null);
    };

    const abrirFormularioNuevo = () => {
        const nuevoFormData = {
            titulo: '',
            tipo_encuesta: 'satisfaccion_evento',
            momento: 'despues',
            url_google_form: '',
            url_respuestas: '',
            estado: 'borrador',
            fecha_inicio: '',
            fecha_fin: '',
            id_evento: eventoSeleccionado.id,
            id_actividad: null,
            obligatoria: false,
            descripcion: ''
        };

        setFormData(nuevoFormData);
        setModoEdicion(false);
        setEncuestaSeleccionada(null);
        setErrores({});
        setMostrarFormulario(true);
    };

    const editarEncuesta = async (encuesta) => {
        setFormData({
            titulo: encuesta.titulo,
            tipo_encuesta: encuesta.tipo_encuesta,
            momento: encuesta.momento,
            url_google_form: encuesta.url_google_form || '',
            url_respuestas: encuesta.url_respuestas || '',
            estado: encuesta.estado,
            fecha_inicio: encuesta.fecha_inicio || '',
            fecha_fin: encuesta.fecha_fin || '',
            id_evento: encuesta.id_evento,
            id_actividad: encuesta.id_actividad,
            obligatoria: encuesta.obligatoria || false,
            descripcion: encuesta.descripcion || ''
        });

        if (encuesta.id_evento) {
            await cargarActividades(encuesta.id_evento);
        }

        setModoEdicion(true);
        setEncuestaSeleccionada(encuesta);
        setErrores({});
        setMostrarFormulario(true);
    };

    const cerrarFormulario = () => {
        setMostrarFormulario(false);
        setModoEdicion(false);
        setEncuestaSeleccionada(null);
        setErrores({});
    };

    const eliminarEncuesta = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta encuesta?')) {
            return;
        }

        try {
            setCargando(true);
            const response = await fetch(`${API_URL}/encuestas/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar encuesta: ${response.status}`);
            }

            mostrarMensaje('success', 'Encuesta eliminada correctamente');
            cargarEncuestas(eventoSeleccionado.id);
        } catch (error) {
            mostrarMensaje('error', 'Error al eliminar la encuesta.');
        } finally {
            setCargando(false);
        }
    };

    const activarEncuesta = async (id) => {
        try {
            setCargando(true);
            const response = await fetch(`${API_URL}/encuestas/${id}/activar`, {
                method: 'PUT',
                headers: getHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al activar encuesta: ${response.status}`);
            }

            mostrarMensaje('success', 'Encuesta activada y enviada a los asistentes');
            cargarEncuestas(eventoSeleccionado.id);
        } catch (error) {
            mostrarMensaje('error', error.message || 'Error al activar la encuesta.');
        } finally {
            setCargando(false);
        }
    };

    const abrirEnvioEncuesta = (encuesta) => {
        setEncuestaSeleccionada(encuesta);
        setMostrarEnvioEncuesta(true);
    };

    const cerrarEnvioEncuesta = () => {
        setMostrarEnvioEncuesta(false);
        setEncuestaSeleccionada(null);
    };

    const handleEnvioExitoso = (resultado) => {
        mostrarMensaje('success', `Encuesta enviada a ${resultado.total_enviadas} asistentes`);
        cargarEncuestas(eventoSeleccionado.id);
    };

    const verResultados = async (encuesta) => {
        setEncuestaSeleccionada(encuesta);
        setMostrarResultados(true);

        try {
            const response = await fetch(`${API_URL}/encuestas/${encuesta.id}/estadisticas`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (response.ok) {
                const estadisticas = await response.json();
                setEncuestaSeleccionada(prev => ({ ...prev, ...estadisticas }));
            }
        } catch (error) {
        }
    };

    return {
        encuestas,
        eventos,
        actividades,
        eventoSeleccionado,
        mostrarFormulario,
        modoEdicion,
        encuestaSeleccionada,
        mostrarResultados,
        mostrarEnvioEncuesta,
        mostrarEstadisticas,
        errores,
        mensaje,
        cargando,
        formData,
        seleccionarEvento,
        volverAEventos,
        handleInputChange,
        handleSubmit,
        abrirEstadisticas,
        cerrarEstadisticas,
        abrirFormularioNuevo,
        editarEncuesta,
        cerrarFormulario,
        eliminarEncuesta,
        activarEncuesta,
        abrirEnvioEncuesta,
        cerrarEnvioEncuesta,
        handleEnvioExitoso,
        verResultados,
        setMostrarResultados
    };
};
