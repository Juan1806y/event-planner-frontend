import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Save,
    User,
    Clock,
    MapPin,
    FileText,
    Tag
} from 'lucide-react';
import {
    obtenerEventoPorId,
    crearActividad,
    obtenerPerfil
} from '../../components/eventosService';
import './CrearActividadPage.css';

const TIPOS_ACTIVIDAD = [
    'Conferencia',
    'Taller',
    'Panel',
    'Networking',
    'Keynote',
    'Workshop'
];

const CrearActividadPage = () => {
    const navigate = useNavigate();
    const { eventoId } = useParams();

    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        ponente: '',
        tipo_actividad: '',
        fecha_actividad: '',
        hora_inicio: '',
        hora_fin: '',
    });

    const [errores, setErrores] = useState({});

    useEffect(() => {
        cargarDatos();
    }, [eventoId]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const eventoData = await obtenerEventoPorId(eventoId);
            setEvento(eventoData.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (campo, valor) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio';
        if (!formData.descripcion.trim()) nuevosErrores.descripcion = 'La descripción es obligatoria';
        if (!formData.fecha_actividad) nuevosErrores.fecha_actividad = 'La fecha es obligatoria';
        if (!formData.hora_inicio) nuevosErrores.hora_inicio = 'La hora de inicio es obligatoria';
        if (!formData.hora_fin) nuevosErrores.hora_fin = 'La hora de fin es obligatoria';

        if (formData.hora_inicio && formData.hora_fin && formData.hora_inicio >= formData.hora_fin) {
            nuevosErrores.hora_fin = 'La hora de fin debe ser posterior a la hora de inicio';
        }

        if (formData.fecha_actividad && evento) {
            const fecha = new Date(formData.fecha_actividad);
            const inicio = new Date(evento.fecha_inicio);
            const fin = new Date(evento.fecha_fin);

            if (fecha < inicio || fecha > fin) {
                nuevosErrores.fecha_actividad = 'La fecha debe estar dentro del rango del evento';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        try {
            setGuardando(true);
            await crearActividad(eventoId, formData);
            navigate(`/organizador/eventos/${eventoId}/agenda`);
        } catch (error) {
            console.error('Error al crear actividad:', error);
            alert('Error al crear la actividad. Intenta nuevamente.');
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return <p>Cargando...</p>;
    }

    return (
        <div className="crear-actividad-page">

            <div className="actividad-container">
                <div className="page-header-actividad">
                    <Calendar size={28} className="header-icon-actividad" />
                    <h1>Crear Nueva Actividad</h1>
                </div>

                <div className="info-banner">
                    <FileText size={20} />
                    <p>
                        Completa los datos para agregar una actividad a la agenda del evento.
                        El sistema validará que las horas y fechas estén dentro del rango del evento.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="form-actividad">

                    <div className="form-section-actividad">
                        <h2 className="section-title-actividad">Información de la Actividad</h2>

                        <div className="form-group-actividad">
                            <label className="form-label-actividad">
                                <FileText size={18} />
                                Título <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => handleInputChange('titulo', e.target.value)}
                                placeholder="Ej: Introducción a React 19"
                                className={`form-input-actividad ${errores.titulo ? 'input-error' : ''}`}
                            />
                            {errores.titulo && <span className="error-message">{errores.titulo}</span>}
                        </div>

                        <div className="form-group-actividad">
                            <label className="form-label-actividad">
                                <FileText size={18} />
                                Descripción <span className="required">*</span>
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                placeholder="Describe el contenido y objetivos de la actividad..."
                                className={`form-textarea-actividad ${errores.descripcion ? 'input-error' : ''}`}
                                rows="4"
                            />
                            {errores.descripcion && <span className="error-message">{errores.descripcion}</span>}
                        </div>

                        <div className="form-row-actividad">
                            <div className="form-group-actividad">
                                <label className="form-label-actividad">
                                    <User size={18} />
                                    Ponente
                                </label>
                                <input
                                    type="text"
                                    value={formData.ponente}
                                    onChange={(e) => handleInputChange('ponente', e.target.value)}
                                    placeholder="Selecciona un ponente..."
                                    className="form-input-actividad"
                                />
                            </div>
                        </div>

                        <div className="form-row-actividad">
                            <div className="form-group-actividad">
                                <label className="form-label-actividad">
                                    <Calendar size={18} />
                                    Fecha <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_actividad}
                                    onChange={(e) => handleInputChange('fecha_actividad', e.target.value)}
                                    min={evento?.fecha_inicio?.split('T')[0]}
                                    max={evento?.fecha_fin?.split('T')[0]}
                                    className={`form-input-actividad ${errores.fecha_actividad ? 'input-error' : ''}`}
                                />
                                {errores.fecha_actividad && <span className="error-message">{errores.fecha_actividad}</span>}
                            </div>

                            <div className="form-group-actividad">
                                <label className="form-label-actividad">
                                    <Clock size={18} />
                                    Hora Inicio <span className="required">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.hora_inicio}
                                    onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
                                    className={`form-input-actividad ${errores.hora_inicio ? 'input-error' : ''}`}
                                />
                                {errores.hora_inicio && <span className="error-message">{errores.hora_inicio}</span>}
                            </div>

                            <div className="form-group-actividad">
                                <label className="form-label-actividad">
                                    <Clock size={18} />
                                    Hora Fin <span className="required">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.hora_fin}
                                    onChange={(e) => handleInputChange('hora_fin', e.target.value)}
                                    className={`form-input-actividad ${errores.hora_fin ? 'input-error' : ''}`}
                                />
                                {errores.hora_fin && <span className="error-message">{errores.hora_fin}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions-actividad">
                        <button
                            type="button"
                            onClick={() => navigate(`/organizador/eventos/${eventoId}/agenda`)}
                            className="btn-cancelar-actividad"
                            disabled={guardando}
                        >
                            <ArrowLeft size={18} />
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={guardando}
                            className="btn-submit-actividad"
                        >
                            <Save size={18} />
                            {guardando ? 'Creando Actividad...' : 'Crear Actividad'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CrearActividadPage;
