import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, MessageSquare, Clock } from 'lucide-react';

export default function PerformancePage() {
    // Mock data for now - in a real app, this would be aggregated from DB
    const stats = [
        { label: 'Tasks Completed', value: '124', change: '+12%', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Avg Response Time', value: '2m 15s', change: '-8%', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Chats Resolved', value: '45', change: '+5%', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Team Efficiency', value: '94%', change: '+2%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Team Performance</h1>
                <p className="text-gray-500">Analytics and key performance indicators</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section (Placeholder) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Task Completion Rate</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
                        <BarChart3 size={48} />
                        <span className="ml-2">Chart Visualization Placeholder</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Support Response Times</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
                        <TrendingUp size={48} />
                        <span className="ml-2">Chart Visualization Placeholder</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
