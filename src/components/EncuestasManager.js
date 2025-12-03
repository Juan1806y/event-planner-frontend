// EncuestasManager.js
import { useState, useEffect } from 'react';

const BASE_URL = '/api';

export const useEncuestasManager = () => {
    const [encuestas, setEncuestas] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
    const [filtroEvento, setFiltroEvento] = useState('');
    const [mostrarResultados, setMostrarResultados] = useState(false);
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

    const getAuthToken = () => localStorage.getItem('auth_token') || '';

    const getHeaders = () => ({
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        cargarEncuestas();
        cargarEventos();
    }, []);

    const cargarEncuestas = async () => {
        try {
            setCargando(true);
            const response = await fetch(`${BASE_URL}/encuestas`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error al obtener encuestas: ${response.status}`);
            }

            const data = await response.json();
            setEncuestas(data);
        } catch (error) {
            mostrarMensaje('error', 'Error al cargar encuestas');
        } finally {
            setCargando(false);
        }
    };

    const cargarEventos = async () => {
        try {
            const response = await fetch(`${BASE_URL}/eventos`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error al obtener eventos`);
            }

            const data = await response.json();
            setEventos(data);
        } catch (error) {
            mostrarMensaje('error', 'Error al cargar eventos');
        }
    };

    const cargarActividades = async (eventoId) => {
        if (!eventoId) return setActividades([]);

        try {
            const response = await fetch(`${BASE_URL}/eventos/${eventoId}/actividades`, {
                method: 'GET',
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Error al obtener actividades');

            const data = await response.json();
            setActividades(data);
        } catch (error) {
            setActividades([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'id_evento') {
            cargarActividades(value);
            setFormData(prev => ({ ...prev, id_actividad: null }));
        }

        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio.';
        if (!formData.url_google_form.includes('google.com/forms'))
            nuevosErrores.url_google_form = 'Debe ser una URL válida de Google Forms.';
        if (!formData.id_evento) nuevosErrores.id_evento = 'Debes seleccionar un evento.';
        if (formData.fecha_inicio && formData.fecha_fin) {
            if (new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
                nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior a la de inicio.';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return mostrarMensaje('error', 'Corrige los errores.');

        try {
            setCargando(true);

            const metodo = modoEdicion ? 'PUT' : 'POST';
            const url = modoEdicion
                ? `${BASE_URL}/encuestas/${encuestaSeleccionada.id}`
                : `${BASE_URL}/encuestas`;

            const response = await fetch(url, {
                method: metodo,
                headers: getHeaders(),
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Error al guardar la encuesta.');

            mostrarMensaje('success', modoEdicion ? 'Encuesta actualizada' : 'Encuesta creada');
            cerrarFormulario();
            cargarEncuestas();
        } catch (error) {
            mostrarMensaje('error', 'Error al guardar.');
        } finally {
            setCargando(false);
        }
    };

    const mostrarMensaje = (tipo, texto) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
    };

    const abrirFormularioNuevo = () => {
        setFormData({
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

        setModoEdicion(false);
        setEncuestaSeleccionada(null);
        setErrores({});
        setActividades([]);
        setMostrarFormulario(true);
    };

    const editarEncuesta = async (encuesta) => {
        setFormData(encuesta);
        await cargarActividades(encuesta.id_evento);
        setModoEdicion(true);
        setEncuestaSeleccionada(encuesta);
        setMostrarFormulario(true);
    };

    const cerrarFormulario = () => {
        setMostrarFormulario(false);
        setModoEdicion(false);
        setEncuestaSeleccionada(null);
        setErrores({});
        setActividades([]);
    };

    const eliminarEncuesta = async (id) => {
        if (!window.confirm('¿Eliminar encuesta?')) return;

        try {
            const response = await fetch(`${BASE_URL}/encuestas/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Error al eliminar');

            mostrarMensaje('success', 'Encuesta eliminada');
            cargarEncuestas();
        } catch (error) {
            mostrarMensaje('error', 'Error al eliminar');
        }
    };

    const activarEncuesta = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/encuestas/${id}/activar`, {
                method: 'PUT',
                headers: getHeaders()
            });

            if (!response.ok) throw new Error('Error al activar');

            mostrarMensaje('success', 'Encuesta activada');
            cargarEncuestas();
        } catch (error) {
            mostrarMensaje('error', 'Error al activar');
        }
    };

    const verResultados = async (encuesta) => {
        setEncuestaSeleccionada(encuesta);
        setMostrarResultados(true);
    };

    const encuestasFiltradas = filtroEvento
        ? encuestas.filter(e => e.id_evento == filtroEvento)
        : encuestas;

    return {
        encuestas,
        eventos,
        actividades,
        mostrarFormulario,
        modoEdicion,
        encuestaSeleccionada,
        filtroEvento,
        mostrarResultados,
        errores,
        mensaje,
        cargando,
        formData,
        encuestasFiltradas,
        handleInputChange,
        handleSubmit,
        abrirFormularioNuevo,
        cerrarFormulario,
        editarEncuesta,
        eliminarEncuesta,
        activarEncuesta,
        verResultados,
        setFiltroEvento,
        setMostrarResultados
    };
};
