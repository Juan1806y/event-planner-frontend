import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService, isAuthenticated } from '../services/api/authService';
import { getRedirectPath } from '../utils/roleUtils';

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'INIT_START':
            return { ...state, loading: true, error: null };
        case 'LOGIN_START':
            return { ...state, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                loading: false,
                error: null,
                initialized: true
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
                initialized: true
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
                initialized: true
            };
        case 'INIT_COMPLETE':
            return {
                ...state,
                loading: false,
                initialized: true,
                isAuthenticated: false
            };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const initializeAuth = async () => {
            dispatch({ type: 'INIT_START' });

            try {
                if (isAuthenticated()) {
                    const userData = localStorage.getItem('user');
                    if (userData) {
                        const user = JSON.parse(userData);
                        dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
                        return;
                    }
                }

                dispatch({ type: 'INIT_COMPLETE' });

            } catch (error) {
                console.error('Error during auth initialization:', error);
                authService.logout();
                dispatch({ type: 'INIT_COMPLETE' });
            }
        };

        initializeAuth();
    }, []);

    const login = async (email, password, selectedRole) => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const result = await authService.login(email, password, selectedRole);

            if (result.success) {
                dispatch({ type: 'LOGIN_SUCCESS', payload: { user: result.user } });
                return { success: true, redirectPath: getRedirectPath(result.user) };
            } else {
                dispatch({ type: 'LOGIN_FAILURE', payload: result.error });
                return { success: false, error: result.error };
            }
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        authService.logout();
        dispatch({ type: 'LOGOUT' });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        ...state,
        login,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};