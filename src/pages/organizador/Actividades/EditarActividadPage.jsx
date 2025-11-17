import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, ArrowLeft, Save, FileText } from 'lucide-react';
import {
    obtenerEventoPorId,
    actualizarActividad,
    obtenerActividadesEvento
} from '../../../components/eventosService';
import './CrearActividadPage.css';
import Sidebar from '../Sidebar';

const EditarActividadPage = () => {
    const navigate = useNavigate();
    const { idActividad } = useParams();

    const [setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        ponente: '',
        fecha_actividad: '',
        hora_inicio: '',
        hora_fin: '',
    });

    const [errores, setErrores] = useState({});
    const eventoId = sessionStorage.getItem("currentEventoId");

    const cargarActividad = useCallback(async () => {
        try {
            setLoading(true);

            if (!eventoId) return;

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

            setFormData({
                titulo: actividadActual.titulo || '',
                descripcion: actividadActual.descripcion || '',
                ponente: actividadActual.ponente || '',
                fecha_actividad: actividadActual.fecha_actividad || '',
                hora_inicio: actividadActual.hora_inicio || '',
                hora_fin: actividadActual.hora_fin || '',
            });

        } catch (error) {
            console.error("Error al cargar actividad:", error);
        } finally {
            setLoading(false);
        }
    }, [eventoId, idActividad, setFormData, setEvento]);


    useEffect(() => {
        cargarActividad();
    }, [cargarActividad]);

    const handleInputChange = (campo, valor) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.titulo.trim()) nuevosErrores.titulo = "El título es obligatorio";
        if (!formData.descripcion.trim()) nuevosErrores.descripcion = "La descripción es obligatoria";
        if (!formData.fecha_actividad) nuevosErrores.fecha_actividad = "La fecha es obligatoria";
        if (!formData.hora_inicio) nuevosErrores.hora_inicio = "La hora de inicio es obligatoria";
        if (!formData.hora_fin) nuevosErrores.hora_fin = "La hora de fin es obligatoria";

        if (formData.hora_inicio >= formData.hora_fin) {
            nuevosErrores.hora_fin = "La hora de fin debe ser posterior a la hora de inicio";
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        try {
            setGuardando(true);
            await actualizarActividad(idActividad, formData);
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

    return (
        <div className="crear-actividad-page">
            <Sidebar />
            <div className="actividad-container">

                <div className="page-header-actividad">
                    <Calendar size={28} className="header-icon-actividad" />
                    <h1>Editar Actividad</h1>
                </div>

                <div className="info-banner">
                    <FileText size={20} />
                    <p>Actualiza los datos de la actividad.</p>
                </div>

                <form onSubmit={handleSubmit} className="form-actividad">
                    <div className="form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => handleInputChange('titulo', e.target.value)}
                            className={errores.titulo ? 'input-error' : ''}
                        />
                        {errores.titulo && <span className="error-text">{errores.titulo}</span>}
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                            className={errores.descripcion ? 'input-error' : ''}
                        />
                        {errores.descripcion && <span className="error-text">{errores.descripcion}</span>}
                    </div>

                    <div className="form-group">
                        <label>Ponente</label>
                        <input
                            type="text"
                            value={formData.ponente}
                            onChange={(e) => handleInputChange('ponente', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Fecha de la actividad</label>
                        <input
                            type="date"
                            value={formData.fecha_actividad}
                            onChange={(e) => handleInputChange('fecha_actividad', e.target.value)}
                            className={errores.fecha_actividad ? 'input-error' : ''}
                        />
                        {errores.fecha_actividad && <span className="error-text">{errores.fecha_actividad}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Hora de inicio</label>
                            <input
                                type="time"
                                value={formData.hora_inicio}
                                onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
                                className={errores.hora_inicio ? 'input-error' : ''}
                            />
                            {errores.hora_inicio && <span className="error-text">{errores.hora_inicio}</span>}
                        </div>

                        <div className="form-group">
                            <label>Hora de fin</label>
                            <input
                                type="time"
                                value={formData.hora_fin}
                                onChange={(e) => handleInputChange('hora_fin', e.target.value)}
                                className={errores.hora_fin ? 'input-error' : ''}
                            />
                            {errores.hora_fin && <span className="error-text">{errores.hora_fin}</span>}
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
                            {guardando ? "Guardando Cambios..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default EditarActividadPage;
