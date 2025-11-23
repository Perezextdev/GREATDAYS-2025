import React from 'react';
import { X, MessageSquare, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const mockActivities = [
    { id: 1, type: 'registration', user: 'System', message: 'New registration: John Doe', time: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 2, type: 'alert', user: 'Admin', message: 'High traffic detected', time: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 3, type: 'support', user: 'Sarah', message: 'Resolved ticket #123', time: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 4, type: 'system', user: 'System', message: 'Backup completed', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 5, type: 'registration', user: 'System', message: 'New registration: Jane Smith', time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
];

const ActivityItem = ({ activity }) => {
    const getIcon = () => {
        switch (activity.type) {
            case 'registration': return <UserPlus size={16} className="text-blue-500" />;
            case 'alert': return <AlertCircle size={16} className="text-red-500" />;
            case 'support': return <MessageSquare size={16} className="text-green-500" />;
            default: return <CheckCircle size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="mt-1">{getIcon()}</div>
            <div>
                <p className="text-sm text-gray-800">{activity.message}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 font-medium">{activity.user}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{format(new Date(activity.time), 'HH:mm')}</span>
                </div>
            </div>
        </div>
    );
};

export default function ActivityFeed({ isOpen, onClose }) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-25 z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 right-0 z-30 w-80 bg-white border-l border-gray-200 h-full flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out
                lg:relative lg:transform-none lg:z-0
                ${isOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}
            `}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Admin Activity</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Today</h4>
                        {mockActivities.map(activity => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>

                    <div className="mt-6 space-y-1">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Yesterday</h4>
                        <p className="text-sm text-gray-500 italic">No activity recorded.</p>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                        View Full Log
                    </button>
                </div>
            </div>
        </>
    );
}
