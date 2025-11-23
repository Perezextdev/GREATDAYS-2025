import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, CheckCircle, Search, Filter, Download } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { exportToExcel } from '../../utils/excelExport';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function ArrivalsPage() {
    const { token } = useAuth();
    const [arrivals, setArrivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('all'); // 'all', 'today', 'tomorrow'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchArrivals();
    }, [token]);

    const fetchArrivals = async () => {
        if (!token) {
            console.log('[ArrivalsPage] Waiting for token...');
            return;
        }

        try {
            setLoading(true);
            console.log('[ArrivalsPage] Fetching with token...');

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?select=*&arrival_date=not.is.null&order=arrival_date.asc`,
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
            console.log('[ArrivalsPage] Fetched arrivals:', data.length);
            setArrivals(data);
        } catch (error) {
            console.error('Error fetching arrivals:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredArrivals = arrivals.filter(reg => {
        const matchesSearch = reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.phone_number?.includes(searchTerm);

        if (!matchesSearch) return false;

        if (filterDate === 'all') return true;

        const arrivalDate = parseISO(reg.arrival_date);
        if (filterDate === 'today') return isToday(arrivalDate);
        if (filterDate === 'tomorrow') return isTomorrow(arrivalDate);

        return true;
    });

    const handleExport = () => {
        const dataToExport = filteredArrivals.map(reg => ({
            'Full Name': reg.full_name,
            'Phone': reg.phone_number,
            'Email': reg.email,
            'Arrival Date': reg.arrival_date,
            'Departure Date': reg.departure_date,
            'Location': reg.location_type,
            'Accommodation': reg.accommodation_type
        }));
        exportToExcel(dataToExport, 'GreatDays_Arrivals');
    };

    const getStatusColor = (dateString) => {
        const date = parseISO(dateString);
        if (isToday(date)) return 'bg-green-100 text-green-800';
        if (isTomorrow(date)) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Arrivals</h1>
                <div className="flex gap-2">
                    <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-500" />
                        <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
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

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search arriving guests..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterDate('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterDate === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All Arrivals
                    </button>
                    <button
                        onClick={() => setFilterDate('today')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterDate === 'today' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Arriving Today
                    </button>
                    <button
                        onClick={() => setFilterDate('tomorrow')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterDate === 'tomorrow' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Tomorrow
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-6">
                        <SkeletonLoader />
                        <div className="mt-4 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                ) : filteredArrivals.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No arrivals found for the selected criteria.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredArrivals.map((reg) => (
                            <li key={reg.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                                            {reg.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{reg.full_name}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {reg.location_type}
                                                </span>
                                                <span>•</span>
                                                <span>{reg.phone_number}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reg.arrival_date)}`}>
                                            {format(parseISO(reg.arrival_date), 'MMM d, yyyy')}
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="Check In">
                                            <CheckCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
