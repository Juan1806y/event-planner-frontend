import React from 'react';
import GerenteSidebar from '../../../../layouts/Sidebar/sidebarGerente/GerenteSidebar';

export const EstadoCargando = ({ mensaje = "Cargando información de la empresa..." }) => {
    return (
        <div className="gerente-layout">
            <GerenteSidebar />
            <div className="gerente-content">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontSize: '1.2rem',
                    color: '#555'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            ⏳
                        </div>
                        {mensaje}
                    </div>
                </div>
            </div>
        </div>
    );
};