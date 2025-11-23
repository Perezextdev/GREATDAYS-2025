import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu,
    Search,
    Bell,
    User,
    LogOut,
    Settings,
    ExternalLink,
    Plus,
    ChevronDown,
    UserPlus,
    FileText,
    MessageSquare,
    Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

export default function AdminHeader({ onMenuClick, onSearchClick }) {
    const { adminProfile, logout } = useAuth();
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [quickAddOpen, setQuickAddOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <header className="bg-white shadow-sm z-20 relative h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                    onClick={onMenuClick}
                >
                    <Menu size={24} />
                </button>

                <Link to="/admin/dashboard" className="hidden sm:flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold">
                        GD
                    </div>
                    <span className="text-lg font-bold text-gray-900">GREAT DAYS Admin</span>
                </Link>

                {/* Search Bar */}
                <button
                    onClick={onSearchClick}
                    className="hidden md:flex items-center w-64 lg:w-96 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:bg-white transition-all group"
                >
                    <Search size={18} className="mr-3 group-hover:text-indigo-500" />
                    <span className="text-sm">Search anything...</span>
                    <span className="ml-auto text-xs font-semibold border border-gray-200 rounded px-1.5 py-0.5">Ctrl K</span>
                </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Quick Add */}
                <div className="relative">
                    <button
                        onClick={() => setQuickAddOpen(!quickAddOpen)}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus size={20} />
                    </button>

                    {quickAddOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                Quick Add
                            </div>
                            <Link to="/admin/registrations/new" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <UserPlus size={16} className="mr-3 text-gray-400" />
                                New Registration
                            </Link>
                            <Link to="/admin/registrations/import" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Upload size={16} className="mr-3 text-gray-400" />
                                Bulk Import
                            </Link>
                            <Link to="/admin/support/new" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <MessageSquare size={16} className="mr-3 text-gray-400" />
                                Create Support Ticket
                            </Link>
                            <Link to="/admin/testimonials/new" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <FileText size={16} className="mr-3 text-gray-400" />
                                Add Testimony
                            </Link>
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                >
                                    Mark all read
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer"
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 pt-0.5">
                                                    <div className={`h-2 w-2 rounded-full mt-1.5 bg-${notification.color}-500`}></div>
                                                </div>
                                                <div className="ml-3 w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                                <Link to="/admin/notifications" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                                    View all notifications
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Event Status */}
                <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium border border-green-200 cursor-pointer hover:bg-green-200 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Event Live
                </div>

                {/* Profile Dropdown */}
                <div className="relative ml-2">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 overflow-hidden">
                            {adminProfile?.avatar_url ? (
                                <img src={adminProfile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <User size={18} />
                            )}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-sm font-medium text-gray-900 leading-none">{adminProfile?.full_name || 'Admin'}</p>
                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{adminProfile?.role?.replace('_', ' ') || 'Loading...'}</p>
                        </div>
                        <ChevronDown size={16} className="text-gray-400 hidden lg:block" />
                    </button>

                    {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                            <div className="px-4 py-3 border-b border-gray-100 lg:hidden">
                                <p className="text-sm font-medium text-gray-900">{adminProfile?.full_name}</p>
                                <p className="text-xs text-gray-500 capitalize">{adminProfile?.role?.replace('_', ' ')}</p>
                            </div>

                            <Link
                                to="/admin/settings"
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setUserMenuOpen(false)}
                            >
                                <User size={16} className="mr-2 text-gray-400" />
                                My Profile
                            </Link>
                            <Link
                                to="/admin/settings"
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setUserMenuOpen(false)}
                            >
                                <Settings size={16} className="mr-2 text-gray-400" />
                                Settings
                            </Link>
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <ExternalLink size={16} className="mr-2 text-gray-400" />
                                View Public Site
                            </a>

                            <div className="border-t border-gray-100 my-1"></div>

                            <button
                                onClick={logout}
                                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut size={16} className="mr-2" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
