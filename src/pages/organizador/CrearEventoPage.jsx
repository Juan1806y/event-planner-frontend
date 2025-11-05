import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, Users, FileText, MapPin, Building2,
    CheckCircle, AlertCircle, ArrowLeft, Plus, Trash2, Save
} from 'lucide-react';
import { crearEvento, obtenerPerfil } from '../../components/eventosService';
import './CrearEventoPage.css';

const CrearEventoPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [empresa, setEmpresa] = useState(null);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    // Listas desplegables
    // const [ponentes, setPonentes] = useState([]); // PENDIENTE: Funcionalidad de ponentes
    // const [especialidades, setEspecialidades] = useState([]); // PENDIENTE: Funcionalidad de especialidades
    const [lugares, setLugares] = useState([]);

    const [formData, setFormData] = useState({
        // Información Básica
        titulo: '',
        fecha_inicio: '',
        fecha_fin: '',
        // id_ponente: '', // PENDIENTE: Campo de ponente
        // id_especialidad: '', // PENDIENTE: Campo de especialidad

        // Ubicación
        modalidad: 'Presencial',
        id_lugar: '',

        // Agenda
        actividades: [
            { nombre: '', fecha_inicio: '', hora_inicio: '', fecha_fin: '', hora_fin: '', descripcion: '' }
        ],

        // Información Adicional
        cupos: '',
        descripcion_adicional: '',
        hora: '' // Hora general del evento
    });

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            // Verificar token primero
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }
            const resp = await obtenerPerfil();

            const userData =
                resp?.data?.usuario ||
                resp?.data ||
                resp;


            if (!userData) {
                throw new Error('No se recibieron datos del usuario');
            }

            const idEmpresa =
                userData.rolData?.id_empresa ?? // userData.id_empresa
                userData.empresa?.id ?? // userData.empresa.id
                userData.empresa_id ?? // otros nombres posibles
                userData.empresa?.id_empresa; // por si hay otra estructura

            if (!idEmpresa) {
                throw new Error('El usuario no tiene una empresa asociada. Verifica tu perfil.');
            }

            setEmpresa({
                id: idEmpresa,
                nombre:
                    userData.rolData?.empresa?.nombre ||
                    userData.empresa?.nombre ||
                    userData.empresa_nombre ||
                    'Mi Empresa'
            });

            await Promise.all([
                // cargarPonentes(idEmpresa),
                // cargarEspecialidades(),
                cargarLugares(idEmpresa),
            ]);


        } catch (error) {
            setMensaje({
                tipo: 'error',
                texto: error.message || 'No se pudo cargar la información necesaria'
            });

            if (error.message?.toLowerCase().includes('token') || error.message?.toLowerCase().includes('autenticación')) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // PENDIENTE: Función para obtener ponentes de la empresa
    /*
    const cargarPonentes = async (idEmpresa) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:3000/api/ponentes?id_empresa=${idEmpresa}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setPonentes(data.data || data);
            }
        } catch (error) {
            console.error('Error al cargar ponentes:', error);
        }
    };
    */

    // PENDIENTE: Función para obtener especialidades
    /*
    const cargarEspecialidades = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:3000/api/especialidades', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setEspecialidades(data.data || data);
            }
        } catch (error) {
            console.error('Error al cargar especialidades:', error);
        }
    };
    */

    // Función para obtener lugares físicos de la empresa
    const cargarLugares = async (idEmpresa) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:3000/api/lugares/${idEmpresa}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Si tu backend devuelve { success: true, data: [...] }
            const lugares = data.data || data;

            setLugares(lugares);
        } catch (error) {
            console.error('❌ Error al cargar lugares:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleActividadChange = (index, field, value) => {
        const nuevasActividades = [...formData.actividades];
        nuevasActividades[index][field] = value;
        setFormData(prev => ({ ...prev, actividades: nuevasActividades }));
    };

    const agregarActividad = () => {
        setFormData(prev => ({
            ...prev,
            actividades: [
                ...prev.actividades,
                { nombre: '', fecha_inicio: '', hora_inicio: '', fecha_fin: '', hora_fin: '', descripcion: '' }
            ]
        }));
    };

    const eliminarActividad = (index) => {
        if (formData.actividades.length > 1) {
            const nuevasActividades = formData.actividades.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, actividades: nuevasActividades }));
        }
    };

    const validarFormulario = () => {
        if (!formData.titulo.trim()) {
            setMensaje({ tipo: 'error', texto: 'El nombre del evento es obligatorio' });
            return false;
        }
        if (!formData.fecha_inicio || !formData.fecha_fin) {
            setMensaje({ tipo: 'error', texto: 'Las fechas de inicio y fin son obligatorias' });
            return false;
        }
        if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
            setMensaje({ tipo: 'error', texto: 'La fecha de fin no puede ser anterior a la fecha de inicio' });
            return false;
        }
        // PENDIENTE: Validación de ponente
        /*
        if (!formData.id_ponente) {
            setMensaje({ tipo: 'error', texto: 'Debe seleccionar un ponente' });
            return false;
        }
        */
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setEnviando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            // Verificar que tenemos el token
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
            }

            // Verificar que tenemos la empresa
            if (!empresa || !empresa.id) {
                throw new Error('No se pudo obtener la información de la empresa.');
            }

            const eventoData = {
                titulo: formData.titulo,
                descripcion: formData.descripcion_adicional || formData.titulo,
                modalidad: formData.modalidad,
                hora: formData.hora || '00:00',
                cupos: parseInt(formData.cupos) || 0,
                fecha_inicio: formData.fecha_inicio,
                fecha_fin: formData.fecha_fin,
                id_empresa: empresa.id,
                // PENDIENTE: Campos de ponente y especialidad
                // id_ponente: parseInt(formData.id_ponente),
                // id_especialidad: formData.id_especialidad ? parseInt(formData.id_especialidad) : null,
                id_lugar: formData.id_lugar ? parseInt(formData.id_lugar) : null,
                actividades: formData.actividades.filter(act => act.nombre.trim() !== '') // Solo enviar actividades con nombre
            };

            console.log('📤 Datos a enviar:', eventoData);
            console.log('🔑 Token disponible:', !!token);
            console.log('🏢 ID Empresa:', empresa.id);

            await crearEvento(eventoData);
            setMensaje({ tipo: 'exito', texto: 'Evento creado exitosamente' });

            setTimeout(() => {
                navigate('/organizador');
            }, 1500);
        } catch (error) {
            console.error('❌ Error completo al crear evento:', error);

            // Manejo específico de errores
            let mensajeError = 'Error al crear el evento';

            if (error.message?.includes('Token')) {
                mensajeError = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
                setTimeout(() => navigate('/login'), 2000);
            } else if (error.message?.includes('permisos')) {
                mensajeError = 'No tienes permisos para crear eventos. Contacta al administrador.';
            } else if (error.message) {
                mensajeError = error.message;
            }

            setMensaje({
                tipo: 'error',
                texto: mensajeError
            });
        } finally {
            setEnviando(false);
        }
    };

    if (loading) {
        return (
            <div className="crear-evento-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando información...</p>
                </div>
            </div>
        );
    }

    // Si hay un error crítico y no se pudo cargar la empresa
    if (!empresa) {
        return (
            <div className="crear-evento-page">
                <div className="crear-evento-container">
                    <div className="error-container">
                        <AlertCircle size={64} color="#dc3545" />
                        <h2>Error al Cargar Información</h2>
                        <p>No se pudo obtener la información de tu empresa.</p>
                        {mensaje.texto && (
                            <div className="mensaje-alert alert-error">
                                <span>{mensaje.texto}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                onClick={() => navigate('/eventos')}
                                className="btn-cancelar-crear"
                            >
                                Volver a Eventos
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-submit-crear"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="crear-evento-page">
            <div className="crear-evento-container">
                {/* Header */}
                <div className="page-header-crear">
                    <button onClick={() => navigate('/eventos')} className="btn-back">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-content-crear">
                        <Calendar size={28} className="header-icon" />
                        <h1 className="page-title-crear">Crear Nuevo Evento</h1>
                    </div>
                </div>

                {/* Empresa Info */}
                {empresa && (
                    <div className="empresa-info-header">
                        <Building2 size={20} />
                        <span>Organizando para: <strong>{empresa.nombre}</strong></span>
                    </div>
                )}

                {/* Mensajes */}
                {mensaje.texto && (
                    <div className={`mensaje-alert ${mensaje.tipo === 'exito' ? 'alert-exito' : 'alert-error'}`}>
                        {mensaje.tipo === 'exito' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-crear-evento">
                    <p className="form-hint">El evento debe incluir un nombre claro y una definición de la agenda o su asignación a fechas específicas antes del evento</p>

                    {/* Información Básica */}
                    <section className="form-section">
                        <h2 className="section-title">Información Básica</h2>

                        <div className="form-group-crear">
                            <label className="form-label-crear">
                                Nombre del Evento <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => handleInputChange('titulo', e.target.value)}
                                placeholder="Ej: Conferencia Anual de Tecnología 2025"
                                className="form-input-crear"
                                required
                            />
                        </div>

                        <div className="form-row-crear">
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Calendar size={18} />
                                    Fecha de Inicio <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                                    className="form-input-crear"
                                    required
                                />
                            </div>

                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Calendar size={18} />
                                    Fecha de Fin <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_fin}
                                    onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                                    className="form-input-crear"
                                    required
                                />
                            </div>
                        </div>
                        <p className="form-hint">El evento puede durar uno o varios días. Las actividades de la agenda se asignarán a fechas específicas dentro de este rango.</p>

                        {/* PENDIENTE: Sección de Ponente y Especialidad */}
                        {/*
                        <div className="form-section-subtitle">Ponente</div>

                        <div className="form-row-crear">
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Users size={18} />
                                    Seleccionar Ponente <span className="required">*</span>
                                </label>
                                <select
                                    value={formData.id_ponente}
                                    onChange={(e) => handleInputChange('id_ponente', e.target.value)}
                                    className="form-select-crear"
                                    required
                                >
                                    <option value="">-- Seleccione un ponente --</option>
                                    {ponentes.map(ponente => (
                                        <option key={ponente.id} value={ponente.id}>
                                            {ponente.nombre} {ponente.apellido}
                                        </option>
                                    ))}
                                </select>
                                {ponentes.length === 0 && (
                                    <p className="form-hint text-warning">No hay ponentes registrados para esta empresa</p>
                                )}
                            </div>

                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <FileText size={18} />
                                    Especialidad del Ponente
                                </label>
                                <select
                                    value={formData.id_especialidad}
                                    onChange={(e) => handleInputChange('id_especialidad', e.target.value)}
                                    className="form-select-crear"
                                >
                                    <option value="">-- Seleccione especialidad --</option>
                                    {especialidades.map(especialidad => (
                                        <option key={especialidad.id} value={especialidad.id}>
                                            {especialidad.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        */}
                    </section>

                    {/* Ubicación */}
                    <section className="form-section">
                        <h2 className="section-title">Ubicación</h2>

                        <div className="form-group-crear">
                            <label className="form-label-crear">
                                Tipo de Evento <span className="required">*</span>
                            </label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="Presencial"
                                        checked={formData.modalidad === 'Presencial'}
                                        onChange={(e) => handleInputChange('modalidad', e.target.value)}
                                    />
                                    <span>Presencial</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="Virtual"
                                        checked={formData.modalidad === 'Virtual'}
                                        onChange={(e) => handleInputChange('modalidad', e.target.value)}
                                    />
                                    <span>Virtual</span>
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        value="Híbrido"
                                        checked={formData.modalidad === 'Híbrido'}
                                        onChange={(e) => handleInputChange('modalidad', e.target.value)}
                                    />
                                    <span>Híbrido</span>
                                </label>
                            </div>
                        </div>

                        {(formData.modalidad === 'Presencial' || formData.modalidad === 'Híbrido') && (
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Building2 size={18} />
                                    Lugar Físico <span className="required">*</span>
                                </label>
                                <select
                                    value={formData.id_lugar}
                                    onChange={(e) => handleInputChange('id_lugar', e.target.value)}
                                    className="form-select-crear"
                                >
                                    <option value="">-- Seleccione un lugar --</option>
                                    {lugares.map(lugar => (
                                        <option key={lugar.id} value={lugar.id}>
                                            {lugar.nombre} - {lugar.direccion}
                                        </option>
                                    ))}
                                </select>
                                <p className="form-hint">Los lugares registrados incluyen capacidad y dirección</p>
                                {lugares.length === 0 && (
                                    <p className="form-hint text-warning">No hay lugares registrados para esta empresa</p>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Agenda del Evento */}
                    <section className="form-section">
                        <h2 className="section-title">Agenda del Evento</h2>
                        <p className="section-description">Actividades Programadas*</p>

                        {formData.actividades.map((actividad, index) => (
                            <div key={index} className="actividad-card">
                                <div className="actividad-header">
                                    <h3 className="actividad-title">Actividad {index + 1}</h3>
                                    {formData.actividades.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => eliminarActividad(index)}
                                            className="btn-eliminar-actividad"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="form-group-crear">
                                    <label className="form-label-crear">Nombre de la Actividad</label>
                                    <input
                                        type="text"
                                        value={actividad.nombre}
                                        onChange={(e) => handleActividadChange(index, 'nombre', e.target.value)}
                                        placeholder="Ej: Conferencia inaugural"
                                        className="form-input-crear"
                                    />
                                </div>

                                <div className="form-row-crear">
                                    <div className="form-group-crear">
                                        <label className="form-label-crear">Fecha de Inicio</label>
                                        <input
                                            type="date"
                                            value={actividad.fecha_inicio}
                                            onChange={(e) => handleActividadChange(index, 'fecha_inicio', e.target.value)}
                                            className="form-input-crear"
                                        />
                                    </div>
                                    <div className="form-group-crear">
                                        <label className="form-label-crear">Hora de Inicio</label>
                                        <input
                                            type="time"
                                            value={actividad.hora_inicio}
                                            onChange={(e) => handleActividadChange(index, 'hora_inicio', e.target.value)}
                                            className="form-input-crear"
                                        />
                                    </div>
                                </div>

                                <div className="form-row-crear">
                                    <div className="form-group-crear">
                                        <label className="form-label-crear">Fecha de Fin</label>
                                        <input
                                            type="date"
                                            value={actividad.fecha_fin}
                                            onChange={(e) => handleActividadChange(index, 'fecha_fin', e.target.value)}
                                            className="form-input-crear"
                                        />
                                    </div>
                                    <div className="form-group-crear">
                                        <label className="form-label-crear">Hora de Fin</label>
                                        <input
                                            type="time"
                                            value={actividad.hora_fin}
                                            onChange={(e) => handleActividadChange(index, 'hora_fin', e.target.value)}
                                            className="form-input-crear"
                                        />
                                    </div>
                                </div>

                                <div className="form-group-crear">
                                    <label className="form-label-crear">Descripción</label>
                                    <textarea
                                        value={actividad.descripcion}
                                        onChange={(e) => handleActividadChange(index, 'descripcion', e.target.value)}
                                        placeholder="Descripción breve de la actividad"
                                        className="form-textarea-crear"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={agregarActividad}
                            className="btn-agregar-actividad"
                        >
                            <Plus size={20} />
                            Agregar Actividad
                        </button>
                    </section>

                    {/* Información Adicional */}
                    <section className="form-section">
                        <h2 className="section-title">Información Adicional</h2>

                        <div className="form-row-crear">
                            <div className="form-group-crear">
                                <label className="form-label-crear">
                                    <Users size={18} />
                                    Cupos Disponibles <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.cupos}
                                    onChange={(e) => handleInputChange('cupos', e.target.value)}
                                    placeholder="Número máximo de participantes"
                                    className="form-input-crear"
                                    min="1"
                                />
                            </div>

                        </div>

                        <div className="form-group-crear">
                            <label className="form-label-crear">
                                Descripción Adicional
                            </label>
                            <textarea
                                value={formData.descripcion_adicional}
                                onChange={(e) => handleInputChange('descripcion_adicional', e.target.value)}
                                placeholder="Información adicional sobre el evento, requisitos, público objetivo, etc."
                                className="form-textarea-crear"
                                rows="5"
                            />
                        </div>
                    </section>

                    {/* Botones de Acción */}
                    <div className="form-actions-crear">
                        <button
                            type="button"
                            onClick={() => navigate('/eventos')}
                            className="btn-cancelar-crear"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={enviando}
                            className="btn-submit-crear"
                        >
                            <Save size={20} />
                            {enviando ? 'Creando Evento...' : 'Crear Evento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearEventoPage;