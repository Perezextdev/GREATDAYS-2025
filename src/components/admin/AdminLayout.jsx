import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    LifeBuoy,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    User
} from 'lucide-react';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { adminProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'coordinator', 'support_agent', 'viewer'] },
        { name: 'Registrations', path: '/admin/registrations', icon: Users, roles: ['super_admin', 'coordinator', 'support_agent', 'viewer'] },
        { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare, roles: ['super_admin', 'coordinator', 'viewer'] },
        { name: 'Support', path: '/admin/support', icon: LifeBuoy, roles: ['super_admin', 'support_agent', 'viewer'] },
        { name: 'Badges', path: '/admin/badges', icon: User, roles: ['super_admin', 'coordinator', 'viewer'] },
        { name: 'Settings', path: '/admin/settings', icon: Settings, roles: ['super_admin'] },
    ];

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            {/* Top Navigation */}
            <header className="bg-white shadow-sm z-10 relative">
                <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold">
                                GD
                            </div>
                            <span className="text-xl font-bold text-gray-900">GREAT DAYS Admin</span>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center space-x-3 focus:outline-none"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{adminProfile?.full_name || 'Admin'}</p>
                                <p className="text-xs text-gray-500 capitalize">{adminProfile?.role?.replace('_', ' ') || 'Loading...'}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <User size={20} />
                            </div>
                            <ChevronDown size={16} className="text-gray-400" />
                        </button>

                        {/* User Dropdown */}
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                                    <p className="text-sm font-medium text-gray-900">{adminProfile?.full_name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{adminProfile?.role}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-64px)]">
                {/* Sidebar Navigation */}
                <aside
                    className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } pt-16 md:pt-0`}
                >
                    <div className="flex h-full flex-col justify-between border-r border-gray-200 bg-white">
                        <div className="px-4 py-6 space-y-1">
                            <div className="md:hidden flex justify-end mb-4">
                                <button onClick={() => setSidebarOpen(false)}>
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>

                            {navItems.filter(item => item.roles.includes(adminProfile?.role)).map((item) => {
                                const isActive = location.pathname.startsWith(item.path);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${isActive
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon size={20} className={`mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="border-t border-gray-200 p-4">
                            <div className="rounded-md bg-indigo-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <LifeBuoy className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-indigo-800">Need help?</h3>
                                        <div className="mt-2 text-sm text-indigo-700">
                                            <p>Contact system administrator for support.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-10 bg-black bg-opacity-25 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}
