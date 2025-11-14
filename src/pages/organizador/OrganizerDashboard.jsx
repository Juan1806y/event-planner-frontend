// OrganizerDashboard.jsx
import React from 'react';
import { useOrganizerDashboard } from '../../components/DashboardOrganizador';
import {
    Header,
    MainContent,
    PasswordModal
} from './OrganizerComponents';
import './OrganizerDashboard.css';
import Sidebar from './Sidebar';

export default function OrganizerDashboard() {
    const {
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
    } = useOrganizerDashboard();

    return (
        <div className="dashboard-container">
            <Sidebar
                isOpen={isSidebarOpen}
                user={user}
                menuItems={menuItems}
                activeSection={activeSection}
                onMenuClick={handleMenuClick}
                onOpenPasswordModal={openPasswordModal}
                onLogout={onLogout}
            />

            <div className="dashboard-main">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={toggleSidebar}
                />

                <MainContent
                    activeSection={activeSection}
                    stats={stats}
                    recentEvents={recentEvents}
                />
            </div>

            <PasswordModal
                isOpen={showPasswordModal}
                onClose={closePasswordModal}
                passwordData={passwordData}
                showPasswords={showPasswords}
                passwordError={passwordError}
                passwordSuccess={passwordSuccess}
                isLoading={isLoading}
                onPasswordChange={handlePasswordChange}
                onToggleVisibility={togglePasswordVisibility}
                onSubmit={handleSubmitPassword}
            />
        </div>
    );
}