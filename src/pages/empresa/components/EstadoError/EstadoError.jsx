import React from 'react';
import GerenteSidebar from '../../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';

export const EstadoError = ({ error, onReintentar, onVolver }) => {
    return (
        <div className="gerente-layout">
            <GerenteSidebar />
            <div className="gerente-content">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    gap: '1rem',
                    padding: '2rem'
                }}>
                    <div style={{ fontSize: '4rem' }}>⚠️</div>
                    <p style={{
                        color: '#e74c3c',
                        fontSize: '1.2rem',
                        textAlign: 'center',
                        maxWidth: '500px'
                    }}>
                        {error}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={onReintentar}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '500',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            🔄 Reintentar
                        </button>
                        <button
                            onClick={onVolver}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#95a5a6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '500',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            ← Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};