// components/DashboardOrganizador.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, Settings, CalendarCheck } from 'lucide-react';
import { obtenerPerfil, obtenerEventos } from './eventosService';

export const useOrganizerDashboard = () => {
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('inicio');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const [passwordData, setPasswordData] = useState({
        correo: '',
        contraseñaNueva: '',
        confirmarContraseña: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        nueva: false,
        confirmar: false
    });

    // 🔹 Estados para los eventos dinámicos
    const [stats, setStats] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);

    const menuItems = [
        { id: 'eventos', label: 'Eventos', icon: Calendar },
        { id: 'asistentes', label: 'Asistentes', icon: Users },
        { id: 'actividades', label: 'Agenda', icon: CalendarCheck },
        { id: 'configuracion', label: 'Configuración', icon: Settings }
    ];

    // 🔹 Cargar usuario del localStorage
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            setUser(userData);
            setPasswordData(prev => ({ ...prev, correo: userData.correo || '' }));
        }
    }, []);

    // Mueve fetchEventos fuera del useEffect
    const fetchEventos = async () => {
        try {
            const perfil = await obtenerPerfil();
            const idCreador = perfil?.data?.usuario?.id
            if (!idCreador) return;

            const data = await obtenerEventos();
            const eventos = Array.isArray(data?.data) ? data.data : [];

            const eventosDelCreador = eventos.filter(ev =>
                String(ev.id_creador) === String(idCreador)
            );

            const eventosPublicados = eventosDelCreador.filter(ev => ev.estado === 1);

            const now = new Date();
            const mesActual = now.getMonth();
            const anioActual = now.getFullYear();

            const eventosMes = eventosDelCreador.filter(ev => {
                if (!ev.fecha_inicio) return false;
                const fecha = new Date(ev.fecha_inicio);
                return (
                    fecha.getUTCMonth() === mesActual &&
                    fecha.getUTCFullYear() === anioActual
                );
            });

            const eventosRecientes = [...eventosPublicados]
                .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
                .slice(0, 5);

            setStats([
                { label: 'Eventos Activos', value: eventosPublicados.length, color: 'bg-blue' },
                { label: 'Eventos del Mes', value: eventosMes.length, color: 'bg-purple' }
            ]);

            setRecentEvents(
                eventosRecientes.map(ev => ({
                    name: ev.nombre || ev.titulo,
                    date: new Date(ev.fecha_inicio).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }),
                    status: ev.estado === 1 ? 'Publicado' : 'Borrador'
                }))
            );
        } catch (error) {
            console.error('❌ Error al cargar los eventos:', error);
        }
    };


    // Llamada automática al montar
    useEffect(() => {
        fetchEventos();
    }, []);


    // ---------------- CONTRASEÑA ----------------
    const openPasswordModal = () => {
        setShowPasswordModal(true);
        setPasswordError('');
        setPasswordSuccess('');
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordData({
            correo: user?.correo || '',
            contraseñaNueva: '',
            confirmarContraseña: ''
        });
        setShowPasswords({ nueva: false, confirmar: false });
        setPasswordError('');
        setPasswordSuccess('');
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
        setPasswordError('');
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmitPassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (!passwordData.correo) {
            setPasswordError('El correo es requerido');
            return;
        }

        if (passwordData.contraseñaNueva.length < 8) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (passwordData.contraseñaNueva !== passwordData.confirmarContraseña) {
            setPasswordError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/cambiar-contrasena', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    correo: passwordData.correo,
                    contraseñaNueva: passwordData.contraseñaNueva
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cambiar contraseña');
            }

            setPasswordSuccess('Contraseña cambiada exitosamente');
            setTimeout(() => {
                closePasswordModal();
            }, 2000);

        } catch (error) {
            setPasswordError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------- LOGOUT ----------------
    const onLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return {
        activeSection,
        isSidebarOpen,
        user,
        menuItems,
        stats,
        recentEvents,
        showPasswordModal,
        passwordData,
        showPasswords,
        passwordError,
        passwordSuccess,
        isLoading,
        handleMenuClick: setActiveSection,
        toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
        openPasswordModal,
        closePasswordModal,
        handlePasswordChange,
        togglePasswordVisibility,
        handleSubmitPassword,
        onLogout,
        fetchEventos
    };
};
