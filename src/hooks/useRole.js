import { useAuth } from './useAuth';
import {
    isAdmin,
    isGerente,
    isAsistente,
    isOrganizador,
    getRoleName,
    getRedirectPath
} from '../utils/roleUtils';

export const useRole = () => {
    const { user } = useAuth();

    const checkRole = {
        isAdmin: () => isAdmin(user),
        isGerente: () => isGerente(user),
        isAsistente: () => isAsistente(user),
        isOrganizador: () => isOrganizador(user)
    };

    const getCurrentRoleName = () => getRoleName(user);
    const getCurrentRedirectPath = () => getRedirectPath(user);

    const getRoleConfig = () => {
        if (checkRole.isAdmin()) {
            return {
                dashboardSections: ['dashboard', 'roles', 'usuarios', 'afiliaciones-pendientes', 'afiliaciones-aprobadas', 'afiliaciones-rechazadas'],
                allowedRoutes: ['/admin', '/admin/*'],
                features: ['gestion_usuarios', 'gestion_roles', 'ver_auditoria', 'gestion_afiliaciones']
            };
        }

        if (checkRole.isGerente()) {
            return {
                dashboardSections: ['empresa', 'eventos', 'organizadores'],
                allowedRoutes: ['/gerente', '/gerente/*'],
                features: ['gestion_empresa', 'crear_eventos', 'gestion_organizadores']
            };
        }

        return {
            dashboardSections: ['dashboard'],
            allowedRoutes: ['/dashboard'],
            features: []
        };
    };

    return {
        user,
        ...checkRole,
        getCurrentRoleName,
        getCurrentRedirectPath,
        getRoleConfig
    };
};