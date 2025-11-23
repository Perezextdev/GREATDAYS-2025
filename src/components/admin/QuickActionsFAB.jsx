import React, { useState } from 'react';
import { Plus, Mail, Download, CreditCard, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuickActionsFAB() {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { icon: Mail, label: 'Send Email', path: '/admin/emails/bulk', color: 'bg-blue-500' },
        { icon: Download, label: 'Export Data', path: '/admin/reports/registrations', color: 'bg-green-500' },
        { icon: CreditCard, label: 'Badges', path: '/admin/badges', color: 'bg-purple-500' },
        { icon: UserPlus, label: 'New Reg', path: '/admin/registrations/new', color: 'bg-orange-500' },
    ];

    return (
        <div className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-40 flex flex-col items-end gap-3">
            {isOpen && (
                <div className="flex flex-col items-end gap-3 mb-2">
                    {actions.map((action, index) => (
                        <Link
                            key={index}
                            to={action.path}
                            className="flex items-center gap-3 group"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm whitespace-nowrap">
                                {action.label}
                            </span>
                            <div className={`${action.color} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110`}>
                                <action.icon size={20} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    p-4 rounded-full shadow-lg text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                    ${isOpen ? 'bg-red-500 rotate-45' : 'bg-indigo-600'}
                `}
            >
                {isOpen ? <Plus size={24} /> : <Plus size={24} />}
            </button>
        </div>
    );
}
