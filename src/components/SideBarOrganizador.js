import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, CalendarCheck, Settings } from 'lucide-react';

export const useSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(true);
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('eventos');
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
        { id: 'eventos', label: 'Eventos', icon: Calendar, path: '/eventos' },
        { id: 'asistentes', label: 'Asistentes', icon: Users, path: '/organizador/asistentes' },
        { id: 'actividades', label: 'Agenda', icon: CalendarCheck, path: '/organizador/agenda' },
        { id: 'configuracion', label: 'Configuración', icon: Settings, path: '/organizador/configuracion' }
    ];


    // Cargar usuario al montar
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            setUser(userData);
            setPasswordData(prev => ({ ...prev, correo: userData.correo || '' }));
        }
    }, []);

    // Detectar sección activa desde la URL
    useEffect(() => {
        const path = location.pathname;
        const section = path.split('/').pop();
        if (section && menuItems.some(item => item.id === section)) {
            setActiveSection(section);
        }
    }, [location]);

    const handleMenuClick = (sectionId) => {
        setActiveSection(sectionId);

        const item = menuItems.find(m => m.id === sectionId);
        if (item) {
            navigate(item.path);
        }
    };


    const toggleSidebar = () => setIsOpen(!isOpen);

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

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return {
        isOpen,
        user,
        activeSection,
        menuItems,
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
        handleLogout
    };
};
