import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Building2,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Save,
} from 'lucide-react';
import Sidebar from '../Sidebar';
import './CrearEventoPage.css';

const CrearEventoPage = () => {
    const [loading, setLoading] = useState(true);
    const [empresa, setEmpresa] = useState(null);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [enviando, setEnviando] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion_adicional: '',
        modalidad: 'Presencial',
        fecha_inicio: '',
        fecha_fin: '',
        id_lugar: ''
    });
    const [mostrarModalExito, setMostrarModalExito] = useState(false);

    useEffect(() => {
        const obtenerDatosEmpresa = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('http://localhost:3000/api/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const result = await response.json();
                    const empresaData = result.data.usuario.rolData.empresa;
                    setEmpresa({
                        id: empresaData.id,
                        nombre: empresaData.nombre || 'Mi Empresa'
                    });
                } else {
                    setMensaje({ tipo: 'error', texto: 'No se pudo cargar la información de la empresa' });
                }
            } catch (error) {
                console.error(error);
                setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor' });
            } finally {
                setLoading(false);
            }
        };

        obtenerDatosEmpresa();
    }, []);

    const handleInputChange = (campo, valor) => {
        setFormData((prev) => ({ ...prev, [campo]: valor }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            const token = localStorage.getItem('access_token');
            const eventoData = {
                ...formData,
                id_empresa: empresa.id
            };

            const response = await fetch('http://localhost:3000/api/eventos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventoData)
            });

            if (response.ok) {
                setMensaje({ tipo: 'exito', texto: 'Evento creado exitosamente' });
                setMostrarModalExito(true);
                setFormData({
                    titulo: '',
                    descripcion_adicional: '',
                    modalidad: 'Presencial',
                    fecha_inicio: '',
                    fecha_fin: '',
                });
            } else {
                const error = await response.json();
                setMensaje({ tipo: 'error', texto: error.message || 'Error al crear el evento' });
            }
        } catch (error) {
            setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor' });
        } finally {
            setEnviando(false);
        }
    };

    const handleVolver = () => {
        window.history.back();
    };

    const handleCerrarModal = () => {
        setMostrarModalExito(false);
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

    if (!empresa) {
        return (
            <div className="crear-evento-page">
                <div className="crear-evento-container">
                    <div className="error-container">
                        <AlertCircle size={64} color="#dc3545" />
                        <h2>Error al Cargar Información</h2>
                        <p>No se pudo obtener la información de tu empresa.</p>

                        {mensaje.texto && (
                            <div className={`mensaje-alert alert-error`}>
                                <span>{mensaje.texto}</span>
                            </div>
                        )}

                        <div className="error-actions">
                            <button onClick={handleVolver} className="btn-cancelar-crear">
                                Volver
                            </button>
                            <button onClick={() => window.location.reload()} className="btn-submit-crear">
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
            <Sidebar />
            <div className="crear-evento-container">
                <div className="page-header-crear">
                    <button onClick={handleVolver} className="btn-back">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-content-crear">
                        <Calendar size={28} className="header-icon" />
                        <h1 className="page-title-crear">Crear Nuevo Evento</h1>
                    </div>
                </div>

                <div className="empresa-info-header">
                    <Building2 size={20} />
                    <span>Organizando para: <strong>{empresa.nombre}</strong></span>
                </div>

                {mensaje.texto && (
                    <div className={`mensaje-alert ${mensaje.tipo === 'exito' ? 'alert-exito' : 'alert-error'}`}>
                        {mensaje.tipo === 'exito' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-crear-evento">
                    <div className="form-group-crear">
                        <label className="form-label-crear">Nombre del Evento *</label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => handleInputChange('titulo', e.target.value)}
                            placeholder="Ej: Conferencia 2025"
                            className="form-input-crear"
                            required
                        />
                    </div>

                    <div className="form-group-crear">
                        <label className="form-label-crear">Modalidad *</label>
                        <select
                            value={formData.modalidad}
                            onChange={(e) => handleInputChange('modalidad', e.target.value)}
                            className="form-select-crear"
                        >
                            <option value="Presencial">Presencial</option>
                            <option value="Virtual">Virtual</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                    </div>

                    <div className="form-row-crear">
                        <div className="form-group-crear">
                            <label className="form-label-crear">Fecha de Inicio *</label>
                            <input
                                type="date"
                                value={formData.fecha_inicio}
                                onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                                className="form-input-crear"
                                required
                            />
                        </div>

                        <div className="form-group-crear">
                            <label className="form-label-crear">Fecha de Fin *</label>
                            <input
                                type="date"
                                value={formData.fecha_fin}
                                onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                                className="form-input-crear"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group-crear">
                        <label className="form-label-crear">Descripción Adicional</label>
                        <textarea
                            value={formData.descripcion_adicional}
                            onChange={(e) => handleInputChange('descripcion_adicional', e.target.value)}
                            className="form-textarea-crear"
                            rows="5"
                        />
                    </div>

                    <div className="form-actions-crear">
                        <button type="button" onClick={handleVolver} className="btn-cancelar-crear">
                            Cancelar
                        </button>
                        <button type="submit" disabled={enviando} className="btn-submit-crear">
                            <Save size={20} /> {enviando ? 'Creando...' : 'Crear Evento'}
                        </button>
                    </div>
                </form>
            </div>

            {mostrarModalExito && (
                <div className="modal-overlay">
                    <div className="modal-exito">
                        <CheckCircle size={48} color="#28a745" />
                        <h2>¡Evento creado exitosamente!</h2>
                        <button className="btn-submit-crear" onClick={handleCerrarModal}>
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrearEventoPage;
