import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function KeyboardShortcuts({ isOpen, onClose }) {
    if (!isOpen) return null;

    const shortcuts = [
        {
            category: 'Navigation',
            items: [
                { keys: ['Ctrl', 'D'], description: 'Dashboard' },
                { keys: ['Ctrl', '1'], description: 'Registrations' },
                { keys: ['Ctrl', 'M'], description: 'Send Email' },
                { keys: ['Ctrl', 'B'], description: 'Badges' },
                { keys: ['Ctrl', 'E'], description: 'Export' },
                { keys: ['Ctrl', 'K'], description: 'Search' },
                { keys: ['Ctrl', 'Q'], description: 'Quick Actions' },
            ]
        },
        {
            category: 'Actions',
            items: [
                { keys: ['Ctrl', 'N'], description: 'New Registration' },
                { keys: ['Ctrl', 'S'], description: 'Save' },
                { keys: ['Ctrl', 'R'], description: 'Refresh Data' },
                { keys: ['Esc'], description: 'Close Modal' },
            ]
        },
        {
            category: 'Tables',
            items: [
                { keys: ['Space'], description: 'Select Row' },
                { keys: ['Ctrl', 'A'], description: 'Select All' },
                { keys: ['↑', '↓'], description: 'Navigate Rows' },
                { keys: ['Enter'], description: 'Open Details' },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <Keyboard size={24} />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Keyboard Shortcuts
                                </h3>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {shortcuts.map((section) => (
                                <div key={section.category}>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                        {section.category}
                                    </h4>
                                    <ul className="space-y-3">
                                        {section.items.map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">{item.description}</span>
                                                <div className="flex gap-1">
                                                    {item.keys.map((key, kIdx) => (
                                                        <kbd key={kIdx} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs font-semibold text-gray-500 min-w-[24px] text-center">
                                                            {key}
                                                        </kbd>
                                                    ))}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
