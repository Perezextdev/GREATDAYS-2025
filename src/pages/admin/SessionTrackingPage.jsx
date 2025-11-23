import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, Users, Calendar, MapPin, Download, RefreshCw, CheckCircle } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

export default function SessionTrackingPage() {
    const { token } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock session data - in production this would come from a sessions table
    const mockSessions = [
        {
            id: 1,
            name: 'Opening Ceremony',
            date: '2025-01-06',
            time: '09:00 AM',
            venue: 'Main Hall',
            capacity: 500,
            registered: 245,
            checkedIn: 0,
            status: 'upcoming'
        },
        {
            id: 2,
            name: 'Worship Session 1',
            date: '2025-01-06',
            time: '11:00 AM',
            venue: 'Worship Center',
            capacity: 400,
            registered: 320,
            checkedIn: 0,
            status: 'upcoming'
        },
        {
            id: 3,
            name: 'Lunch Break',
            date: '2025-01-06',
            time: '01:00 PM',
            venue: 'Dining Hall',
            capacity: 500,
            registered: 400,
            checkedIn: 0,
            status: 'upcoming'
        }
    ];

    useEffect(() => {
        setSessions(mockSessions);
    }, []);

    const handleExport = () => {
        const dataToExport = sessions.map(session => ({
            'Session Name': session.name,
            'Date': session.date,
            'Time': session.time,
            'Venue': session.venue,
            'Capacity': session.capacity,
            'Registered': session.registered,
            'Checked In': session.checkedIn,
            'Attendance Rate': `${((session.checkedIn / session.registered) * 100).toFixed(1)}%`,
            'Status': session.status
        }));
        exportToExcel(dataToExport, 'GreatDays_Sessions');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'live': return 'bg-green-100 text-green-800';
            case 'upcoming': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getOccupancyColor = (registered, capacity) => {
        const percentage = (registered / capacity) * 100;
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Session Tracking</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor event sessions and attendance</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSessions(mockSessions)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <RefreshCw size={18} className="mr-2" />
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download size={18} className="mr-2" />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Sessions</p>
                            <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                        </div>
                        <Calendar className="text-indigo-600" size={32} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Live Now</p>
                            <p className="text-2xl font-bold text-green-600">
                                {sessions.filter(s => s.status === 'live').length}
                            </p>
                        </div>
                        <Activity className="text-green-600" size={32} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Registered</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {sessions.reduce((sum, s) => sum + s.registered, 0)}
                            </p>
                        </div>
                        <Users className="text-blue-600" size={32} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Checked In</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {sessions.reduce((sum, s) => sum + s.checkedIn, 0)}
                            </p>
                        </div>
                        <CheckCircle className="text-purple-600" size={32} />
                    </div>
                </div>
            </div>

            {/* Sessions List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">All Sessions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{session.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{session.date}</div>
                                        <div className="text-xs text-gray-500">{session.time}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <MapPin size={14} className="mr-1 text-gray-400" />
                                            {session.venue}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm font-medium ${getOccupancyColor(session.registered, session.capacity)}`}>
                                            {session.registered} / {session.capacity}
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div
                                                className="bg-indigo-600 h-1.5 rounded-full"
                                                style={{ width: `${(session.registered / session.capacity) * 100}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {session.checkedIn} checked in
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {session.registered > 0 ? ((session.checkedIn / session.registered) * 100).toFixed(1) : 0}% rate
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(session.status)}`}>
                                            {session.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Activity className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">Session Tracking</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Monitor all event sessions in real-time. Track registration, check-ins, and attendance rates. In production, this integrates with the check-in system for live updates.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
