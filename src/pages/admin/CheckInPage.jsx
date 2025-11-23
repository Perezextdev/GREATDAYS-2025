import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, QrCode, CheckCircle, XCircle, User, Calendar, MapPin, Home } from 'lucide-react';

export default function CheckInPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [attendees, setAttendees] = useState([]);
    const [filteredAttendees, setFilteredAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        checkedIn: 0,
        pending: 0
    });

    useEffect(() => {
        fetchAttendees();
    }, []);

    useEffect(() => {
        filterAttendees();
    }, [searchTerm, attendees]);

    const fetchAttendees = async () => {
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .eq('mode_of_participation', 'onsite')
                .order('full_name');

            if (error) throw error;

            const attendeesWithStatus = data.map(a => ({
                ...a,
                checked_in: false, // This would come from a check_ins table in production
                check_in_time: null
            }));

            setAttendees(attendeesWithStatus);
            calculateStats(attendeesWithStatus);
        } catch (error) {
            console.error('Error fetching attendees:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        setStats({
            total: data.length,
            checkedIn: data.filter(a => a.checked_in).length,
            pending: data.filter(a => !a.checked_in).length
        });
    };

    const filterAttendees = () => {
        if (!searchTerm) {
            setFilteredAttendees(attendees);
            return;
        }

        const filtered = attendees.filter(a =>
            a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.phone_number?.includes(searchTerm)
        );
        setFilteredAttendees(filtered);
    };

    const handleCheckIn = async (attendeeId) => {
        // In production, this would update a check_ins table
        setAttendees(prev => prev.map(a =>
            a.id === attendeeId
                ? { ...a, checked_in: true, check_in_time: new Date().toISOString() }
                : a
        ));
    };

    const handleCheckOut = async (attendeeId) => {
        setAttendees(prev => prev.map(a =>
            a.id === attendeeId
                ? { ...a, checked_in: false, check_in_time: null }
                : a
        ));
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Event Check-In</h1>
                <p className="text-gray-500">Manage attendee check-ins for onsite participants</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Onsite</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <User className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Checked In</p>
                            <p className="text-3xl font-bold text-green-600">{stats.checkedIn}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${stats.total ? (stats.checkedIn / stats.total) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <XCircle className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Attendees List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accommodation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAttendees.map((attendee) => (
                                <tr key={attendee.id} className={attendee.checked_in ? 'bg-green-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {attendee.full_name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{attendee.full_name}</div>
                                                <div className="text-xs text-gray-500">{attendee.church_unit}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{attendee.email}</div>
                                        <div className="text-xs text-gray-500">{attendee.phone_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <MapPin size={14} className="mr-1 text-gray-400" />
                                            {attendee.location === 'outside_zaria' ? 'Outside Zaria' : 'Within Zaria'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Home size={14} className="mr-1 text-gray-400" />
                                            {attendee.accommodation_type || 'None'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {attendee.checked_in ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Checked In
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                                Pending
                                            </span>
                                        )}
                                        {attendee.check_in_time && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(attendee.check_in_time).toLocaleTimeString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {attendee.checked_in ? (
                                            <button
                                                onClick={() => handleCheckOut(attendee.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Check Out
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleCheckIn(attendee.id)}
                                                className="text-green-600 hover:text-green-900 font-medium"
                                            >
                                                Check In
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredAttendees.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No attendees found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
