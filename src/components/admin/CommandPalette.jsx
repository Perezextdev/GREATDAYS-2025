import React, { useState, useEffect } from 'react';
import { Search, Command, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const commands = [
        { name: 'Go to Dashboard', path: '/admin/dashboard', icon: '🏠' },
        { name: 'View Registrations', path: '/admin/registrations', icon: '👥' },
        { name: 'Analytics', path: '/admin/analytics', icon: '📊' },
        { name: 'Create New Registration', action: () => console.log('New Reg'), icon: '➕' },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center px-4 py-3 border-b border-gray-100">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Type a command or search..."
                        className="flex-1 text-lg border-none focus:ring-0 placeholder-gray-400"
                        autoFocus
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <span className="text-xs font-medium text-gray-500">ESC</span>
                    </button>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                    {filteredCommands.map((cmd, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (cmd.path) navigate(cmd.path);
                                if (cmd.action) cmd.action();
                                onClose();
                            }}
                            className="w-full flex items-center px-4 py-3 hover:bg-indigo-50 rounded-lg group transition-colors"
                        >
                            <span className="mr-3 text-xl">{cmd.icon}</span>
                            <span className="flex-1 text-left font-medium text-gray-700 group-hover:text-indigo-700">{cmd.name}</span>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100" />
                        </button>
                    ))}
                    {filteredCommands.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No results found.</div>
                    )}
                </div>
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                    <span>Use ↑↓ to navigate</span>
                    <span>Enter to select</span>
                </div>
            </div>
        </div>
    );
}
