import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BulkActions({ selectedCount, onClearSelection, actions }) {
    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 bg-white border border-gray-200 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6"
                >
                    <div className="flex items-center gap-3 border-r border-gray-200 pr-6">
                        <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {selectedCount}
                        </div>
                        <span className="text-sm font-medium text-gray-700">Selected</span>
                        <button
                            onClick={onClearSelection}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={action.onClick}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${action.variant === 'danger'
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
