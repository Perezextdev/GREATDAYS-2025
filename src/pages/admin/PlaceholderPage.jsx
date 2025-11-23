import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

export default function PlaceholderPage() {
    const location = useLocation();
    const pageName = location.pathname.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
            <div className="bg-indigo-50 p-6 rounded-full mb-6">
                <Construction size={64} className="text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageName}</h1>
            <p className="text-gray-500 max-w-md mb-8">
                This page is currently under construction. We're working hard to bring you this feature soon!
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}
