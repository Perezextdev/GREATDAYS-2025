import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminMobileNav from './AdminMobileNav';
import QuickActionsFAB from './QuickActionsFAB';
import CommandPalette from './CommandPalette';
import KeyboardShortcuts from './KeyboardShortcuts';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const { adminProfile } = useAuth();

    // Mobile detection
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false); // Reset mobile sidebar state on desktop
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Global Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Command Palette: Ctrl+K
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandPaletteOpen(true);
            }
            // Shortcuts Modal: Ctrl+/
            if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsShortcutsOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col lg:flex-row">
            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                isMobile={isMobile}
                onClose={() => setSidebarOpen(false)}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
                {/* Header */}
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    onSearchClick={() => setIsCommandPaletteOpen(true)}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <AdminMobileNav
                onMenuClick={() => setSidebarOpen(true)}
                onQuickAddClick={() => setIsCommandPaletteOpen(true)} // Using Command Palette as Quick Add for now or can trigger FAB
            />

            {/* Floating Action Button */}
            <QuickActionsFAB />

            {/* Modals */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
            />

            <KeyboardShortcuts
                isOpen={isShortcutsOpen}
                onClose={() => setIsShortcutsOpen(false)}
            />
        </div>
    );
}
