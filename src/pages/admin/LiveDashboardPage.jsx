import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Radio, Users, TrendingUp, Activity, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function LiveDashboardPage() {
    const { token } = useAuth();
    const [stats, setStats] = useState({
        totalAttendees: 0,
        checkedIn: 0,
        currentSession: 'Opening Ceremony',
        sessionAttendance: 0,
        onlineViewers: 0
    });

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                onlineViewers: Math.floor(Math.random() * 50) + 100
            }));
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Mock real-time data
    useEffect(() => {
        setStats({
            totalAttendees: 245,
            checkedIn: 0,
            currentSession: 'Opening Ceremony',
            sessionAttendance: 0,
            onlineViewers: 103
        });
    }, []);

    const quickStats = [
        {
            label: 'Total Registered',
            value: stats.totalAttendees,
            icon: Users,
            color: 'indigo',
            change: '+12 today'
        },
        {
            label: 'Checked In',
            value: stats.checkedIn,
            icon: CheckCircle,
            color: 'green',
            change: `${stats.totalAttendees > 0 ? ((stats.checkedIn / stats.totalAttendees) * 100).toFixed(1) : 0}%`
        },
        {
            label: 'Online Viewers',
            value: stats.onlineViewers,
            icon: Radio,
            color: 'purple',
            change: 'Live now',
            live: true
        },
        {
            label: 'Current Session',
            value: stats.sessionAttendance,
            icon: Activity,
            color: 'orange',
            subtitle: stats.currentSession
        }
    ];

    const recentActivity = [
        { time: '2 mins ago', type: 'check-in', message: 'John Doe checked in' },
        { time: '5 mins ago', type: 'online', message: '10 new online viewers joined' },
        { time: '8 mins ago', type: 'check-in', message: 'Jane Smith checked in' },
        { time: '12 mins ago', type: 'alert', message: 'Session started: Opening Ceremony' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">Live Dashboard</h1>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            LIVE
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Real-time event monitoring and statistics</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <RefreshCw size={18} className="mr-2" />
                    Refresh
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                                <stat.icon className={`text-${stat.color}-600`} size={24} />
                            </div>
                            {stat.live && (
                                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                    LIVE
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            {stat.subtitle && (
                                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                            )}
                            {stat.change && (
                                <p className={`text-sm mt-2 ${stat.live ? 'text-purple-600' : 'text-green-600'} font-medium`}>
                                    {stat.change}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className={`p-2 rounded-full ${activity.type === 'check-in' ? 'bg-green-100' :
                                            activity.type === 'online' ? 'bg-purple-100' :
                                                'bg-orange-100'
                                        }`}>
                                        {activity.type === 'check-in' && <CheckCircle size={16} className="text-green-600" />}
                                        {activity.type === 'online' && <Radio size={16} className="text-purple-600" />}
                                        {activity.type === 'alert' && <AlertCircle size={16} className="text-orange-600" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">{activity.message}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Session Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Current Session</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">{stats.currentSession}</h3>
                                <p className="text-sm text-gray-500">Main Hall • 09:00 AM - 11:00 AM</p>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Attendance</span>
                                    <span className="font-medium text-gray-900">{stats.sessionAttendance} / 500</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full"
                                        style={{ width: `${(stats.sessionAttendance / 500) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Up Next</p>
                                <p className="text-sm text-gray-900 font-medium">Worship Session 1</p>
                                <p className="text-xs text-gray-500">Worship Center • 11:00 AM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Radio className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">Live Monitoring</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            This dashboard updates in real-time during the event. Monitor check-ins, online viewers, and session attendance. Statistics auto-refresh every 30 seconds.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
