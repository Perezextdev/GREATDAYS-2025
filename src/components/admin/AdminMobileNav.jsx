import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Plus, MessageCircle, Menu } from 'lucide-react';

export default function AdminMobileNav({ onMenuClick, onQuickAddClick }) {
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Reg', path: '/admin/registrations', icon: Users },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}

                {/* Quick Add Button (Center) */}
                <button
                    onClick={onQuickAddClick}
                    className="flex flex-col items-center justify-center w-full h-full -mt-6"
                >
                    <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg text-white">
                        <Plus size={24} />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500 mt-1">Add</span>
                </button>

                <Link
                    to="/admin/support"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/admin/support' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <MessageCircle size={20} strokeWidth={location.pathname === '/admin/support' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Chat</span>
                </Link>

                <button
                    onClick={onMenuClick}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 hover:text-gray-900"
                >
                    <Menu size={20} />
                    <span className="text-[10px] font-medium">More</span>
                </button>
            </div>
        </div>
    );
}
