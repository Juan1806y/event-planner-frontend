import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Save,
    User,
    Clock,
    FileText,
    MapPin,
    Building2,
    Video,
    Link as LinkIcon
} from 'lucide-react';
import {
    obtenerEventoPorId,
    actualizarActividad,
    obtenerActividadesEvento,
    obtenerPerfil,
    obtenerUbicaciones,
    obtenerLugares
} from '../../../components/eventosService';
import './CrearActividadPage.css';
import Sidebar from '../Sidebar';

const EditarActividadPage = () => {
    const navigate = useNavigate();
    const { idActividad } = useParams();

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
        tipo: 'presencial',
        id_lugares: [],
        link_virtual: '',
    });

    const [errores, setErrores] = useState({});
    const eventoId = sessionStorage.getItem("currentEventoId");

    const cargarActividad = useCallback(async () => {
        try {
            setLoading(true);

            if (!eventoId) return;

            const perfil = await obtenerPerfil();
            const empresaId = perfil.data?.usuario?.rolData?.id_empresa;
            const nombreEmpresa = perfil.data?.usuario?.rolData?.empresa?.nombre || "Mi Empresa";

            if (!empresaId) throw new Error("No se pudo obtener el ID de la empresa.");

            setEmpresa({ id: empresaId, nombre: nombreEmpresa });

            const ubicacionesData = await obtenerUbicaciones(empresaId);
            setUbicaciones(Array.isArray(ubicacionesData.data) ? ubicacionesData.data : [ubicacionesData.data]);

            const actividadesData = await obtenerActividadesEvento(eventoId);
            const listaActividades = Array.isArray(actividadesData.data)
                ? actividadesData.data
                : [actividadesData.data];

            const actividadActual = listaActividades.find(
                a => Number(a.id_actividad) === Number(idActividad)
            );

            if (!actividadActual) return;

            const eventoData = await obtenerEventoPorId(eventoId);
            setEvento(eventoData.data);

            const tieneLink = actividadActual.link_virtual || actividadActual.url;
            const tieneLugares = actividadActual.lugares && actividadActual.lugares.length > 0;

            let tipoActividad = 'presencial';
            if (tieneLink && tieneLugares) {
                tipoActividad = 'hibrida';
            } else if (tieneLink && !tieneLugares) {
                tipoActividad = 'virtual';
            }

            const idsLugares = actividadActual.lugares
                ? actividadActual.lugares.map(l => l.id)
                : [];

            if (tieneLugares && actividadActual.lugares[0].id_ubicacion) {
                const ubicacionId = actividadActual.lugares[0].id_ubicacion;
                setUbicacionSeleccionada(ubicacionId);

                const data = await obtenerLugares(empresaId, ubicacionId);
                const filtrados = Array.isArray(data.data)
                    ? data.data.filter(l => String(l.id_ubicacion) === String(ubicacionId))
                    : [];
                setLugares(filtrados);
            }

            setFormData({
                titulo: actividadActual.titulo || '',
                descripcion: actividadActual.descripcion || '',
                ponente: actividadActual.ponente || '',
                fecha_actividad: actividadActual.fecha_actividad || '',
                hora_inicio: actividadActual.hora_inicio || '',
                hora_fin: actividadActual.hora_fin || '',
                tipo: tipoActividad,
                id_lugares: idsLugares,
                link_virtual: actividadActual.link_virtual || actividadActual.url || '',
            });

        } catch (error) {
            console.error("Error al cargar actividad:", error);
        } finally {
            setLoading(false);
        }
    }, [eventoId, idActividad]);

    useEffect(() => {
        cargarActividad();
    }, [cargarActividad]);

    useEffect(() => {
        if (!empresa?.id || !ubicacionSeleccionada) {
            return;
        }

        const cargarLugares = async () => {
            try {
                const data = await obtenerLugares(empresa.id, ubicacionSeleccionada);
                const filtrados = Array.isArray(data.data)
                    ? data.data.filter(l => String(l.id_ubicacion) === String(ubicacionSeleccionada))
                    : [];
                setLugares(filtrados);
            } catch (error) {
                console.error('Error cargando lugares:', error);
                setLugares([]);
            }
        };
        cargarLugares();
    }, [ubicacionSeleccionada, empresa?.id]);

    const handleInputChange = (campo, valor) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: '' }));
    };

    const handleTipoChange = (valor) => {
        setFormData(prev => ({
            ...prev,
            tipo: valor,
            id_lugares: valor === 'virtual' ? [] : prev.id_lugares,
            link_virtual: valor === 'presencial' ? '' : prev.link_virtual
        }));
        if (valor === 'virtual') setUbicacionSeleccionada('');
    };

    const handleUbicacionChange = (valor) => {
        setUbicacionSeleccionada(valor);
        setFormData(prev => ({ ...prev, id_lugares: [] }));
    };

    const handleLugarToggle = (lugarId) => {
        setFormData(prev => {
            const nuevosLugares = prev.id_lugares.includes(lugarId)
                ? prev.id_lugares.filter(id => id !== lugarId)
                : [...prev.id_lugares, lugarId];
            return { ...prev, id_lugares: nuevosLugares };
        });
        if (errores.id_lugares) setErrores(prev => ({ ...prev, id_lugares: '' }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};
        const { titulo, descripcion, fecha_actividad, hora_inicio, hora_fin, tipo, id_lugares, link_virtual } = formData;

        if (!titulo.trim()) nuevosErrores.titulo = 'El título es obligatorio';
        if (!descripcion.trim()) nuevosErrores.descripcion = 'La descripción es obligatoria';
        if (!fecha_actividad) nuevosErrores.fecha_actividad = 'La fecha es obligatoria';
        if (!hora_inicio) nuevosErrores.hora_inicio = 'La hora de inicio es obligatoria';
        if (!hora_fin) nuevosErrores.hora_fin = 'La hora de fin es obligatoria';

        if (tipo === 'presencial' && id_lugares.length === 0) {
            nuevosErrores.id_lugares = 'Debes seleccionar al menos un lugar para actividades presenciales';
        }
        if (tipo === 'virtual' && !link_virtual.trim()) {
            nuevosErrores.link_virtual = 'El link es obligatorio para actividades virtuales';
        }
        if (tipo === 'hibrida') {
            if (id_lugares.length === 0) nuevosErrores.id_lugares = 'Debes seleccionar al menos un lugar para actividades híbridas';
            if (!link_virtual.trim()) nuevosErrores.link_virtual = 'El link es obligatorio para actividades híbridas';
        }

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
            const datosEnviar = {
                titulo: formData.titulo,
                descripcion: formData.descripcion,
                ponente: formData.ponente || null,
                fecha_actividad: formData.fecha_actividad,
                hora_inicio: formData.hora_inicio,
                hora_fin: formData.hora_fin,
                tipo: formData.tipo,
                lugares: (formData.tipo === 'virtual') ? null : formData.id_lugares,
                url: (formData.tipo === 'virtual' || formData.tipo === 'hibrida') ? formData.link_virtual : null,
            };

            console.log('Datos a actualizar:', datosEnviar);

            await actualizarActividad(idActividad, datosEnviar);
            navigate(`/organizador/eventos/${eventoId}/agenda`);
        } catch (error) {
            console.error("Error al actualizar actividad:", error);
            alert("Error al actualizar la actividad. Intenta nuevamente.");
        } finally {
            setGuardando(false);
        }
    };

    if (loading) {
        return (
            <div className="crear-actividad-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    const mostrarCampoLugar = formData.tipo === 'presencial' || formData.tipo === 'hibrida';
    const mostrarCampoLink = formData.tipo === 'virtual' || formData.tipo === 'hibrida';

    return (
        <div className="crear-actividad-page">
            <Sidebar />
            <div className="actividad-container">
                <div className="page-header-actividad">
                    <Calendar size={28} className="header-icon-actividad" />
                    <h1>Editar Actividad</h1>
                </div>
                <div className="evento-info-card">
                    <h2>Nombre del Evento: {evento?.titulo}</h2>
                    <p className="evento-fechas">
                        {evento.fecha_inicio?.split('-').reverse().join('/')} - {evento.fecha_fin?.split('-').reverse().join('/')}
                    </p>
                </div>
                <div className="info-banner">
                    <FileText size={20} />
                    <p>
                        Actualiza los datos de la actividad.
                        Puedes seleccionar múltiples lugares si la actividad se realizará en varios espacios simultáneamente.
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

                    <div className="form-section-actividad">
                        <h2 className="section-title-actividad">Tipo de Actividad</h2>

                        <div className="form-group-actividad">
                            <label className="form-label-actividad">
                                <Video size={18} />
                                Modalidad <span className="required">*</span>
                            </label>
                            <select
                                value={formData.tipo}
                                onChange={(e) => handleTipoChange(e.target.value)}
                                className="form-input-actividad"
                            >
                                <option value="presencial">Presencial</option>
                                <option value="virtual">Virtual</option>
                                <option value="hibrida">Híbrida</option>
                            </select>
                        </div>

                        {mostrarCampoLink && (
                            <div className="form-group-actividad">
                                <label className="form-label-actividad">
                                    <LinkIcon size={18} />
                                    Link Virtual <span className="required">*</span>
                                </label>
                                <input
                                    type="url"
                                    value={formData.link_virtual}
                                    onChange={(e) => handleInputChange('link_virtual', e.target.value)}
                                    className={`form-input-actividad ${errores.link_virtual ? 'input-error' : ''}`}
                                    placeholder="https://..."
                                />
                                {errores.link_virtual && <span className="error-message">{errores.link_virtual}</span>}
                            </div>
                        )}
                    </div>

                    {mostrarCampoLugar && (
                        <div className="form-section-actividad">
                            <h2 className="section-title-actividad">Ubicación y Lugares</h2>

                            <div className="form-group-actividad">
                                <label className="form-label-actividad">
                                    <MapPin size={18} />
                                    Ubicación <span className="required">*</span>
                                </label>
                                <select
                                    value={ubicacionSeleccionada}
                                    onChange={(e) => handleUbicacionChange(e.target.value)}
                                    className="form-input-actividad"
                                >
                                    <option value="">Selecciona una ubicación</option>
                                    {ubicaciones.map((ub) => (
                                        <option key={ub.id} value={ub.id}>{ub.lugar}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group-actividad">
                                <label className="form-label-actividad">
                                    <Building2 size={18} />
                                    Lugares <span className="required">*</span>
                                    <span style={{ fontSize: '0.85em', fontWeight: 'normal', marginLeft: '8px' }}>
                                        (Puedes seleccionar varios)
                                    </span>
                                </label>

                                {!ubicacionSeleccionada ? (
                                    <p style={{ color: '#666', fontSize: '0.9em', marginTop: '8px' }}>
                                        Primero selecciona una ubicación
                                    </p>
                                ) : lugares.length === 0 ? (
                                    <p style={{ color: '#666', fontSize: '0.9em', marginTop: '8px' }}>
                                        No hay lugares disponibles en esta ubicación
                                    </p>
                                ) : (
                                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {lugares.map((lugar) => (
                                            <label
                                                key={lugar.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '12px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    backgroundColor: formData.id_lugares.includes(lugar.id) ? '#e3f2fd' : '#fff',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.id_lugares.includes(lugar.id)}
                                                    onChange={() => handleLugarToggle(lugar.id)}
                                                    style={{ marginRight: '12px', width: '18px', height: '18px' }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{lugar.nombre}</div>
                                                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                                                        Capacidad: {lugar.ubicacion?.capacidad || 'N/A'}
                                                        {lugar.descripcion && ` - ${lugar.descripcion}`}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {errores.id_lugares && <span className="error-message">{errores.id_lugares}</span>}

                                {formData.id_lugares.length > 0 && (
                                    <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
                                        <strong>Lugares seleccionados:</strong> {formData.id_lugares.length}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="form-actions-actividad">
                        <button
                            type="button"
                            onClick={() => navigate(`/organizador/eventos/${eventoId}/agenda`)}
                            className="btn-cancelar-actividad"
                            disabled={guardando}
                        >
                            <ArrowLeft size={18} /> Cancelar
                        </button>

                        <button type="submit" disabled={guardando} className="btn-submit-actividad">
                            <Save size={18} /> {guardando ? 'Guardando Cambios...' : 'Guardar Cambios'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditarActividadPage;