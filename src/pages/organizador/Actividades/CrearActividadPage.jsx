import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Save,
    User,
    Clock,
    FileText,
    MapPin,
    Building2
} from 'lucide-react';
import {
    obtenerEventoPorId,
    crearActividad,
    obtenerPerfil,
    obtenerUbicaciones,
    obtenerLugares
} from '../../../components/eventosService';
import './CrearActividadPage.css';
import Sidebar from '../Sidebar';

const CrearActividadPage = () => {
    const navigate = useNavigate();
    const { eventoId } = useParams();

    const [evento, setEvento] = useState(null);
    const [empresa, setEmpresa] = useState(null);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('');
    const [lugares, setLugares] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        ponente: '',
        fecha_actividad: '',
        hora_inicio: '',
        hora_fin: '',
        id_lugar: '',
    });

    const [errores, setErrores] = useState({});

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);

                const perfil = await obtenerPerfil();
                const empresaId = perfil.data?.usuario?.rolData?.id_empresa;
                const nombreEmpresa = perfil.data?.usuario?.rolData?.empresa?.nombre || "Mi Empresa";

                if (!empresaId) {
                    throw new Error("No se pudo obtener el ID de la empresa.");
                }

                setEmpresa({ id: empresaId, nombre: nombreEmpresa });

                const responseEvento = await obtenerEventoPorId(eventoId);
                setEvento(responseEvento.data);

                const ubicacionesData = await obtenerUbicaciones(empresaId);
                console.log(ubicacionesData)
                setUbicaciones(
                    Array.isArray(ubicacionesData.data)
                        ? ubicacionesData.data
                        : [ubicacionesData.data]
                );

            } catch (error) {
                console.error('Error cargando datos:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [eventoId]);

    useEffect(() => {
        if (!empresa?.id || !ubicacionSeleccionada) {
            setLugares([]);
            setFormData(prev => ({ ...prev, id_lugar: '' }));
            return;
        }

        const cargarLugares = async () => {
            try {
                const data = await obtenerLugares(empresa.id, ubicacionSeleccionada);
                console.log("lugares", data)
                const filtrados = Array.isArray(data.data)
                    ? data.data.filter(l => String(l.id_ubicacion) === String(ubicacionSeleccionada))
                    : [];

                setLugares(filtrados);
                setFormData(prev => ({ ...prev, id_lugar: '' }));
            } catch (error) {
                console.error('Error cargando lugares:', error);
                setLugares([]);
                setFormData(prev => ({ ...prev, id_lugar: '' }));
            }
        };

        cargarLugares();
    }, [ubicacionSeleccionada, empresa?.id]);

    const handleInputChange = (campo, valor) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));

        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }
    };

    const handleUbicacionChange = (valor) => {
        setUbicacionSeleccionada(valor);
        setFormData(prev => ({ ...prev, id_lugar: '' }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};
        const { titulo, descripcion, fecha_actividad, hora_inicio, hora_fin } = formData;

        if (!titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio';
        if (!descripcion.trim()) nuevosErrores.descripcion = 'La descripción es obligatoria';
        if (!fecha_actividad) nuevosErrores.fecha_actividad = 'La fecha es obligatoria';
        if (!hora_inicio) nuevosErrores.hora_inicio = 'La hora de inicio es obligatoria';
        if (!hora_fin) nuevosErrores.hora_fin = 'La hora de fin es obligatoria';

        if (hora_inicio && hora_fin && hora_inicio >= hora_fin) {
            nuevosErrores.hora_fin = 'La hora de fin debe ser posterior a la hora de inicio';
        }

        if (fecha_actividad && evento) {
            const fechaSel = new Date(fecha_actividad);
            const inicio = new Date(evento.fecha_inicio);
            const fin = new Date(evento.fecha_fin);

            if (fechaSel < inicio || fechaSel > fin) {
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
            console.error('Error creando actividad:', error);
            alert('Error al crear la actividad. Intenta nuevamente.');
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <div className="crear-actividad-page">
            <Sidebar />

            <div className="actividad-container">
                <div className="page-header-actividad">
                    <Calendar size={28} className="header-icon-actividad" />
                    <h1>Crear Nueva Actividad</h1>
                </div>

                <div className="info-banner">
                    <FileText size={20} />
                    <p>
                        Completa los datos para agregar una actividad al evento.
                        El sistema validará que las horas y fechas estén dentro del rango permitido.
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
                                placeholder="Ej: Taller de React Hooks"
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
                                onChange={(e) =>
                                    handleInputChange('descripcion', e.target.value)
                                }
                                placeholder="Describe brevemente la actividad..."
                                className={`form-textarea-actividad ${errores.descripcion ? 'input-error' : ''}`}
                                rows="4"
                            />

                            {errores.descripcion && <span className="error-message">{errores.descripcion}</span>}
                        </div>

                        <div className="form-group-actividad">
                            <label className="form-label-actividad">
                                <User size={18} />
                                Ponente
                            </label>

                            <input
                                type="text"
                                value={formData.ponente}
                                onChange={(e) => handleInputChange('ponente', e.target.value)}
                                placeholder="Nombre del ponente"
                                className="form-input-actividad"
                            />
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
                                    onChange={(e) =>
                                        handleInputChange('fecha_actividad', e.target.value)
                                    }
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

                    <div className="form-section-actividad">
                        <h2 className="section-title-actividad">Ubicación y Lugar</h2>

                        <div className="form-group-actividad">
                            <label className="form-label-actividad">
                                <MapPin size={18} />
                                Ubicación
                            </label>

                            <select
                                value={ubicacionSeleccionada}
                                onChange={(e) => handleUbicacionChange(e.target.value)}
                                className="form-input-actividad"
                            >
                                <option value="">Selecciona una ubicación</option>
                                {ubicaciones.map((ub) => (
                                    <option key={ub.id} value={ub.id}>
                                        {ub.lugar}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group-actividad">
                            <label className="form-label-actividad">
                                <Building2 size={18} />
                                Lugar
                            </label>

                            <select
                                value={formData.id_lugar}
                                onChange={(e) => handleInputChange('id_lugar', e.target.value)}
                                className="form-input-actividad"
                                disabled={!ubicacionSeleccionada}
                            >
                                <option value="">
                                    {!ubicacionSeleccionada
                                        ? 'Primero selecciona una ubicación'
                                        : 'Selecciona un lugar'}
                                </option>
                                {lugares.map((lugar) => (
                                    <option key={lugar.id} value={lugar.id}>
                                        {lugar.nombre} - Capacidad: {lugar.ubicacion?.capacidad}
                                    </option>
                                ))}
                            </select>
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

                        <button type="submit" disabled={guardando} className="btn-submit-actividad">
                            <Save size={18} />
                            {guardando ? 'Creando...' : 'Crear Actividad'}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default CrearActividadPage;
