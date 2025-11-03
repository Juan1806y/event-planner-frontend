// hooks/useOrganizerDashboard.js
import { useState, useEffect } from 'react';
import { Home, Calendar, Users, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const useOrganizerDashboard = () => {
    const navigate = useNavigate();
    //const user = JSON.parse(localStorage.getItem('user') || '{}');
    //console.log(user);

    // Estados generales
    const [activeSection, setActiveSection] = useState('inicio');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);

    // Estados para el modal de contraseña
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        correo: user?.correo,
        contraseñaActual: '',
        contraseñaNueva: '',
        confirmarContraseña: ''
    });

    useEffect(() => {
        if (user && user.correo) {
            setPasswordData((prev) => ({ ...prev, correo: user.correo }));
        }
    }, [user]);

    const [showPasswords, setShowPasswords] = useState({
        actual: false,
        nueva: false,
        confirmar: false
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ✅ Obtener el usuario logueado desde localStorage (MEJORADO)
    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('access_token'); // CAMBIO AQUÍ

        console.log('User Data:', userData);

        if (!userData || !token) {
            console.log('No hay token o usuario, redirigiendo al login');
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
    }, [navigate]);
    // --- Menú lateral ---
    const menuItems = [
        { id: 'inicio', label: 'Inicio', icon: Home },
        { id: 'eventos', label: 'Eventos', icon: Calendar },
        { id: 'participantes', label: 'Participantes', icon: Users },
        { id: 'reportes', label: 'Reportes', icon: FileText },
        { id: 'configuracion', label: 'Configuración', icon: Settings }
    ];

    // --- Datos de ejemplo ---
    const stats = [
        { label: 'Eventos Activos', value: '12', color: 'bg-blue-500' },
        { label: 'Participantes', value: '248', color: 'bg-green-500' },
        { label: 'Pendientes', value: '5', color: 'bg-yellow-500' },
        { label: 'Completados', value: '38', color: 'bg-purple-500' }
    ];

    const recentEvents = [
        { name: 'Conferencia Anual 2025', date: '15 Nov 2025', status: 'Activo' },
        { name: 'Workshop de Tecnología', date: '20 Nov 2025', status: 'Pendiente' },
        { name: 'Reunión de Equipo', date: '10 Nov 2025', status: 'Completado' }
    ];

    // --- Validación de contraseña ---
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número';
        }
        return null;
    };

    // --- Manejadores ---
    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
        setPasswordError('');
        setPasswordSuccess('');
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmitPassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (!passwordData.correo && !user?.correo) {
            setPasswordError('Debes ingresar o tener registrado un correo válido');
            return;
        }

        if (!passwordData.contraseñaNueva || !passwordData.confirmarContraseña) {
            setPasswordError('Todos los campos son obligatorios');
            return;
        }

        if (passwordData.contraseñaNueva !== passwordData.confirmarContraseña) {
            setPasswordError('Las contraseñas nuevas no coinciden');
            return;
        }

        const validationError = validatePassword(passwordData.contraseñaNueva);
        if (validationError) {
            setPasswordError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                correo: passwordData.correo || user?.correo,
                contraseña: passwordData.contraseñaNueva
            };

            console.log('📧 Enviando datos:', payload);

            const response = await fetch('http://localhost:3000/api/auth/recuperar-contrasena', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('📥 Respuesta status:', response.status);
            const data = await response.json();

            if (response.ok && data.success) {
                setPasswordSuccess('Contraseña actualizada exitosamente');
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                        correo: '',
                        contraseñaActual: '',
                        contraseñaNueva: '',
                        confirmarContraseña: ''
                    });
                    setPasswordSuccess('');
                }, 2000);
            } else {
                setPasswordError(data.message || 'Error al cambiar la contraseña');
            }
        } catch (error) {
            console.error('❌ Error en la solicitud:', error);
            setPasswordError('Error de conexión. Intenta nuevamente');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Control UI ---
    const handleMenuClick = (itemId) => setActiveSection(itemId);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const openPasswordModal = () => setShowPasswordModal(true);
    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordData({
            correo: '',
            contraseñaActual: '',
            contraseñaNueva: '',
            confirmarContraseña: ''
        });
        setPasswordError('');
        setPasswordSuccess('');
    };

    // 🔍 Debug
    console.log('👤 Usuario actual:', user);

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
        handleSubmitPassword
    };
};
