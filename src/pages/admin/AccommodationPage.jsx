import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, AlertCircle, CheckCircle, Search, Filter, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function AccommodationPage() {
    const { token } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Mock capacity for demonstration
    const TOTAL_CAPACITY = 200;

    useEffect(() => {
        fetchRequests();
    }, [token]);

    const fetchRequests = async () => {
        if (!token) {
            console.log('[AccommodationPage] Waiting for token...');
            return;
        }

        try {
            setLoading(true);
            console.log('[AccommodationPage] Fetching with token...');

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?select=*&needs_accommodation=eq.true&order=created_at.desc`,
                {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const data = await response.json();
            console.log('[AccommodationPage] Fetched accommodation requests:', data.length);
            setRequests(data);
        } catch (error) {
            console.error('Error fetching accommodation requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(reg => {
        const matchesSearch = reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.phone_number?.includes(searchTerm);

        if (!matchesSearch) return false;
        if (filterType === 'all') return true;
        return reg.accommodation_type === filterType;
    });

    const handleExport = () => {
        const dataToExport = filteredRequests.map(reg => ({
            'Full Name': reg.full_name,
            'Phone': reg.phone_number,
            'Email': reg.email,
            'Accommodation Type': reg.accommodation_type,
            'Arrival Date': reg.arrival_date,
            'Departure Date': reg.departure_date,
            'Location': reg.location_type
        }));
        exportToExcel(dataToExport, 'GreatDays_Accommodation');
    };

    const occupancy = requests.length;
    const occupancyRate = (occupancy / TOTAL_CAPACITY) * 100;

    const getOccupancyColor = () => {
        if (occupancyRate < 70) return 'text-green-600';
        if (occupancyRate < 90) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProgressBarColor = () => {
        if (occupancyRate < 70) return 'bg-green-500';
        if (occupancyRate < 90) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Accommodation</h1>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                        <Home size={20} className="text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Occupancy</p>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-lg font-bold ${getOccupancyColor()}`}>{occupancy}</span>
                                <span className="text-sm text-gray-400">/ {TOTAL_CAPACITY}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download size={18} className="mr-2" />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Capacity Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Total Capacity Usage</span>
                    <span className={`font-bold ${getOccupancyColor()}`}>{occupancyRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                        style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Guest House">Guest House</option>
                        <option value="Hotel">Hotel</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-6">
                        <SkeletonLoader />
                        <div className="mt-4">
                            <SkeletonLoader variant="table" />
                        </div>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No accommodation requests found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRequests.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                                                    {reg.full_name.charAt(0)}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                                                    <div className="text-xs text-gray-500">{reg.phone_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {reg.accommodation_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.gender || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Pending
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-indigo-600 hover:text-indigo-900">Assign</button>
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
