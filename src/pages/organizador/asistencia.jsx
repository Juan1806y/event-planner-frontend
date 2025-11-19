import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Calendar, MapPin, Users, AlertCircle } from 'lucide-react';

// Simula el servicio - reemplaza con el import real
const asistenciaService = {
    async obtenerAsistenciasEvento(idEvento) {
        // Aquí iría la llamada real al API
        const response = await fetch(`/api/asistencias/evento/${idEvento}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    }
};

export default function GestionAsistentes({ idEvento = '1' }) {
    const [asistentes, setAsistentes] = useState([]);
    const [filteredAsistentes, setFilteredAsistentes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar datos del API
    useEffect(() => {
        cargarAsistentes();
    }, [idEvento]);

    useEffect(() => {
        let filtered = asistentes;

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.id.includes(searchTerm)
            );
        }

        if (filtroEstado !== 'todos') {
            filtered = filtered.filter(a => a.estado.toLowerCase() === filtroEstado);
        }

        setFilteredAsistentes(filtered);
    }, [searchTerm, filtroEstado, asistentes]);

    // Calcular estadísticas
    const totalInscritos = asistentes.length;
    const confirmados = asistentes.filter(a => a.estado === 'Confirmado').length;
    const pendientes = asistentes.filter(a => a.estado === 'Pendiente').length;
    const ausentes = asistentes.filter(a => a.estado === 'Ausente').length;
    const capacidad = 500;

    const getEstadoBadgeClass = (estado) => {
        switch (estado.toLowerCase()) {
            case 'confirmado':
                return 'bg-green-100 text-green-700';
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-700';
            case 'ausente':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const exportarExcel = () => {
        const csv = [
            ['ID', 'Nombre', 'Email', 'Tipo', 'Fecha Registro', 'Estado'].join(','),
            ...filteredAsistentes.map(a =>
                [a.id, a.nombre, a.email, a.tipo, a.fechaRegistro, a.estado].join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asistentes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando asistentes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">Error al cargar datos</h3>
                    <p className="text-gray-600 text-center mb-6">{error}</p>
                    <button
                        onClick={cargarAsistentes}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Event Planner</h1>
                            </div>
                            <p className="text-sm text-orange-600 font-medium">Gestión de Inscritos</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">AD</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">Organizador</p>
                                <p className="text-xs text-gray-500">admin@event.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Información del Evento */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 text-white">
                    <h2 className="text-2xl font-bold mb-4">Conferencia Anual de Tecnología 2025</h2>
                    <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Fecha: 15-17 de Marzo, 2025</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>Lugar: Centro de Convenciones Norte</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Capacidad: {capacidad} personas</span>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500 shadow-sm">
                        <p className="text-gray-500 text-sm uppercase mb-2">Total Inscritos</p>
                        <p className="text-3xl font-bold text-gray-900">{totalInscritos}</p>
                        <p className="text-sm text-gray-500 mt-1">de {capacidad} capacidad</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-l-4 border-green-500 shadow-sm">
                        <p className="text-gray-500 text-sm uppercase mb-2">Confirmados</p>
                        <p className="text-3xl font-bold text-gray-900">{confirmados}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {totalInscritos > 0 ? ((confirmados / totalInscritos) * 100).toFixed(1) : 0}% del total
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-l-4 border-yellow-500 shadow-sm">
                        <p className="text-gray-500 text-sm uppercase mb-2">Pendientes</p>
                        <p className="text-3xl font-bold text-gray-900">{pendientes}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {totalInscritos > 0 ? ((pendientes / totalInscritos) * 100).toFixed(1) : 0}% del total
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border-l-4 border-red-500 shadow-sm">
                        <p className="text-gray-500 text-sm uppercase mb-2">Ausentes</p>
                        <p className="text-3xl font-bold text-gray-900">{ausentes}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {totalInscritos > 0 ? ((ausentes / totalInscritos) * 100).toFixed(1) : 0}% del total
                        </p>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email o ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="ausente">Ausente</option>
                        </select>
                        <button
                            onClick={exportarExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Exportar Excel
                        </button>
                    </div>
                </div>

                {/* Tabla de asistentes */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Inscripción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAsistentes.map((asistente) => (
                                <tr key={asistente.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        #{asistente.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                                style={{ backgroundColor: asistente.color }}
                                            >
                                                {asistente.iniciales}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{asistente.nombre}</p>
                                                <p className="text-sm text-gray-500">{asistente.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {asistente.tipo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {asistente.fechaRegistro}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeClass(asistente.estado)}`}>
                                            {asistente.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button className="text-gray-600 hover:text-blue-600 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredAsistentes.length === 0 && (
                    <div className="bg-white rounded-lg p-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No se encontraron asistentes con los filtros aplicados</p>
                    </div>
                )}
            </div>
        </div>
    );
}