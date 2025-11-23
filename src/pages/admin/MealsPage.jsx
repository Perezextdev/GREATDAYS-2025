import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Utensils, Search, Filter, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function MealsPage() {
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'assigned', 'pending'

    useEffect(() => {
        fetchAttendees();
    }, []);

    const fetchAttendees = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) throw error;

            // Auto-assign logic simulation (in a real app, this might be a DB field 'meals_eligible')
            const dataWithMeals = data.map(reg => {
                const title = reg.title?.toLowerCase() || '';
                const isAutoEligible = title.includes('pastor') || title.includes('reverend') || title.includes('rev.');
                return {
                    ...reg,
                    meals_status: isAutoEligible ? 'Assigned' : 'Pending' // Default logic
                };
            });

            setAttendees(dataWithMeals);
        } catch (error) {
            console.error('Error fetching attendees for meals:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAttendees = attendees.filter(reg => {
        const matchesSearch = reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.phone_number?.includes(searchTerm);

        if (!matchesSearch) return false;
        if (filterStatus === 'all') return true;
        return reg.meals_status.toLowerCase() === filterStatus;
    });

    const handleAssign = (id) => {
        setAttendees(prev => prev.map(a => a.id === id ? { ...a, meals_status: 'Assigned' } : a));
        // Here you would also update Supabase
    };

    const handleRevoke = (id) => {
        setAttendees(prev => prev.map(a => a.id === id ? { ...a, meals_status: 'Pending' } : a));
        // Here you would also update Supabase
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Meals Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={fetchAttendees}
                        className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw size={18} className="mr-2" />
                        Refresh List
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500">Total Eligible</p>
                    <p className="text-2xl font-bold text-indigo-600">
                        {attendees.filter(a => a.meals_status === 'Assigned').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search attendees..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="assigned">Assigned</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    </div>
                ) : filteredAttendees.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No attendees found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAttendees.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                                                    {reg.full_name.charAt(0)}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.title || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {reg.meals_status === 'Assigned' ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Assigned
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {reg.meals_status === 'Assigned' ? (
                                                <button
                                                    onClick={() => handleRevoke(reg.id)}
                                                    className="text-red-600 hover:text-red-900 flex items-center justify-end gap-1 ml-auto"
                                                >
                                                    <XCircle size={16} /> Revoke
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleAssign(reg.id)}
                                                    className="text-green-600 hover:text-green-900 flex items-center justify-end gap-1 ml-auto"
                                                >
                                                    <CheckCircle size={16} /> Assign
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
