import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, MapPin, Building2, CheckCircle, AlertCircle } from 'lucide-react';

const CrearEvento = () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        modalidad: 'Presencial',
        hora: '',
        cupos: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    useEffect(() => {
        obtenerDatosEmpresa();
    }, []);

    const obtenerDatosEmpresa = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const userData = await response.json();
                setEmpresa({
                    id: userData.id_empresa,
                    nombre: userData.nombre_empresa || 'Mi Empresa'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje({ tipo: 'error', texto: 'No se pudo cargar la información de la empresa' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje({ tipo: '', texto: '' });

        try {
            const token = localStorage.getItem('access_token');
            const eventoData = {
                ...formData,
                cupos: parseInt(formData.cupos),
                id_empresa: empresa.id
            };

            const response = await fetch(`${API_URL}/eventos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventoData)
            });

            if (response.ok) {
                setMensaje({ tipo: 'exito', texto: 'Evento creado exitosamente' });
                setFormData({
                    titulo: '',
                    descripcion: '',
                    modalidad: 'Presencial',
                    hora: '',
                    cupos: '',
                    fecha_inicio: '',
                    fecha_fin: ''
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Crear Nuevo Evento</h1>
                        <p className="text-gray-600">Organiza un evento para tu empresa</p>
                    </div>

                    {empresa && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                            <Building2 className="text-blue-600" size={24} />
                            <div>
                                <p className="text-sm text-gray-600">Organizando para:</p>
                                <p className="font-semibold text-gray-800">{empresa.nombre}</p>
                            </div>
                        </div>
                    )}

                    {mensaje.texto && (
                        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${mensaje.tipo === 'exito'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                            {mensaje.tipo === 'exito' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{mensaje.texto}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FileText size={18} />
                                Título del Evento
                            </label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                placeholder="Ej: Feria de Innovación 2025"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FileText size={18} />
                                Descripción
                            </label>
                            <textarea
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                rows="4"
                                placeholder="Describe el evento..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <MapPin size={18} />
                                    Modalidad
                                </label>
                                <select
                                    value={formData.modalidad}
                                    onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    <option value="Presencial">Presencial</option>
                                    <option value="Virtual">Virtual</option>
                                    <option value="Híbrido">Híbrido</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Clock size={18} />
                                    Hora de Inicio
                                </label>
                                <input
                                    type="time"
                                    value={formData.hora}
                                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar size={18} />
                                    Fecha de Inicio
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar size={18} />
                                    Fecha de Fin
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_fin}
                                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Users size={18} />
                                Cupos Disponibles
                            </label>
                            <input
                                type="number"
                                value={formData.cupos}
                                onChange={(e) => setFormData({ ...formData, cupos: e.target.value })}
                                min="1"
                                placeholder="Ej: 150"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={enviando}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {enviando ? 'Creando Evento...' : 'Crear Evento'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearEvento;