// components/DashboardOrganizador.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, FileText, Settings } from 'lucide-react';

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

    const menuItems = [
        { id: 'inicio', label: 'Inicio', icon: FileText },
        { id: 'eventos', label: 'Eventos', icon: Calendar },
        { id: 'asistentes', label: 'Asistentes', icon: Users },
        { id: 'configuracion', label: 'Configuración', icon: Settings }
    ];

    const stats = [
        { label: 'Eventos Activos', value: '12', color: 'bg-blue' },
        { label: 'Total Asistentes', value: '1,234', color: 'bg-green' },
        { label: 'Eventos del Mes', value: '8', color: 'bg-purple' }
    ];

    const recentEvents = [
        { name: 'Conferencia Tech 2024', date: '15 Nov 2024', status: 'Activo' },
        { name: 'Workshop de React', date: '20 Nov 2024', status: 'Próximo' },
        { name: 'Networking Event', date: '10 Nov 2024', status: 'Finalizado' }
    ];

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            setUser(userData);
            setPasswordData(prev => ({ ...prev, correo: userData.correo || '' }));
        }
    }, []);

    const handleMenuClick = (section) => {
        setActiveSection(section);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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

        // Validaciones
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
        handleMenuClick,
        toggleSidebar,
        openPasswordModal,
        closePasswordModal,
        handlePasswordChange,
        togglePasswordVisibility,
        handleSubmitPassword,
        onLogout
    };
};