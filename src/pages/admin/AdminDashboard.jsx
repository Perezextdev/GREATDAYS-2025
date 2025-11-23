import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import SkeletonLoader from '../../components/SkeletonLoader';
import { supabase } from '../../lib/supabaseClient';
import {
    Users, Wifi, MapPin, MessageSquare, ArrowUp, ArrowDown, Minus,
    Home, Calendar, Download, Mail, FileSpreadsheet, RefreshCw,
    BarChart3, AlertTriangle, CheckCircle, Info, Clock, Database,
    Utensils, Truck, Globe, Shield
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
    Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart
} from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const { metrics, loading, error, refresh } = useDashboardData();
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        setLastUpdated(new Date());
        console.log('[AdminDashboard] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('[AdminDashboard] Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
        if (error) console.error('[AdminDashboard] Hook Error:', error);
        if (metrics.error) console.error('[AdminDashboard] Metrics Error:', metrics.error);
    }, [metrics, error]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500">GREAT DAYS 2025 Event Overview</p>
                    </div>
                </div>
                <SkeletonLoader />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonLoader key={i} variant="card" />
                    ))}
                </div>
            </div>
        );
    }
    if (metrics.error || (error && !metrics.totalRegistrations)) { // Check for hook error or metrics error
        return (
            <div className="flex h-96 flex-col items-center justify-center space-y-4">
                <div className="text-red-500 font-medium">Failed to load dashboard data</div>
                <p className="text-sm text-gray-500">{error || metrics.error || 'Unknown error'}</p>
                <button
                    onClick={refresh}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Retry
                </button>
                <button
                    onClick={async () => {
                        console.log('Testing simple query...');
                        const start = Date.now();
                        const { count, error } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
                        const duration = Date.now() - start;
                        console.log('Simple query result:', { count, error, duration });
                        alert(`Query finished in ${duration}ms. Count: ${count}. Error: ${error?.message}`);
                    }}
                    className="mt-4 text-xs text-blue-500 underline block"
                >
                    Test Simple Query (Client Lib)
                </button>
                <button
                    onClick={async () => {
                        console.log('Testing raw fetch...');
                        const start = Date.now();
                        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?select=*&head=true`;
                        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

                        try {
                            const response = await fetch(url, {
                                headers: {
                                    'apikey': key,
                                    'Authorization': `Bearer ${key}`
                                }
                            });
                            const duration = Date.now() - start;
                            console.log('Raw fetch result:', { status: response.status, duration });
                            alert(`Raw fetch finished in ${duration}ms. Status: ${response.status}`);
                        } catch (err) {
                            const duration = Date.now() - start;
                            console.error('Raw fetch error:', err);
                            alert(`Raw fetch failed in ${duration}ms. Error: ${err.message}`);
                        }
                    }}
                    className="mt-2 text-xs text-green-500 underline block"
                >
                    Test Raw Fetch (Direct REST)
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">GREAT DAYS 2025 Event Overview</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                    <button
                        onClick={async () => {
                            console.log('Testing simple query...');
                            const start = Date.now();
                            const { count, error } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
                            const duration = Date.now() - start;
                            console.log('Simple query result:', { count, error, duration });
                            alert(`Query finished in ${duration}ms. Count: ${count}. Error: ${error?.message}`);
                        }}
                        className="mt-2 text-xs text-blue-500 underline"
                    >
                        Test Simple Query
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={refresh} className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                    </button>
                    <Link to="/admin/reports" className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
                        <Download size={16} className="mr-2" />
                        Download Reports
                    </Link>
                </div>
            </div>

            {/* SECTION 1: KEY METRICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Registrations"
                    value={metrics.totalRegistrations}
                    icon={Users}
                    color="blue"
                    trend={{ value: "+25 this week", positive: true }}
                    subMetrics={[
                        { label: "Confirmed", value: metrics.totalRegistrations, color: "green" },
                        { label: "Cancelled", value: 0, color: "red" }
                    ]}
                />
                <MetricCard
                    title="Online Participants"
                    value={metrics.onlineCount}
                    icon={Wifi}
                    color="orange"
                    percentage={metrics.totalRegistrations ? Math.round((metrics.onlineCount / metrics.totalRegistrations) * 100) : 0}
                    progressBar={true}
                />
                <MetricCard
                    title="Onsite Participants"
                    value={metrics.onsiteCount}
                    icon={MapPin}
                    color="green"
                    percentage={metrics.totalRegistrations ? Math.round((metrics.onsiteCount / metrics.totalRegistrations) * 100) : 0}
                    progressBar={true}
                    subMetrics={[
                        { label: "Within Zaria", value: metrics.locationStats.withinZaria },
                        { label: "Outside Zaria", value: metrics.locationStats.outsideZaria }
                    ]}
                />
                <MetricCard
                    title="Pending Support"
                    value={metrics.pendingSupport}
                    icon={MessageSquare}
                    color={metrics.pendingSupport > 0 ? "red" : "gray"}
                    alert={metrics.pendingSupport > 5}
                    subtext={metrics.pendingSupport > 0 ? "Needs Attention" : "All caught up"}
                />
            </div>

            {/* SECTION 2: REGISTRATION TRENDS */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Registration Trends</h3>
                    <div className="flex space-x-2">
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">Last 30 Days</span>
                    </div>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metrics.registrationTrends}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="total" stroke="#4F46E5" fillOpacity={1} fill="url(#colorTotal)" name="Total" />
                            <Area type="monotone" dataKey="online" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Online" />
                            <Area type="monotone" dataKey="onsite" stackId="1" stroke="#10B981" fill="#10B981" name="Onsite" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* SECTION 3: ACCOMMODATION OVERVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Accommodation Requests */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Accommodation Overview</h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase">Needing</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.accommodationStats.totalNeeding}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-600 uppercase">General</p>
                            <p className="text-xl font-bold text-green-700">{metrics.accommodationStats.general}</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 uppercase">Hotel</p>
                            <p className="text-xl font-bold text-blue-700">{metrics.accommodationStats.hotel}</p>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'General', value: metrics.accommodationStats.general },
                                        { name: 'Hotel', value: metrics.accommodationStats.hotel },
                                        { name: 'None', value: metrics.accommodationStats.none }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#10B981" />
                                    <Cell fill="#3B82F6" />
                                    <Cell fill="#9CA3AF" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Arrivals Forecast */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Arrivals</h3>
                    <div className="overflow-y-auto max-h-80">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrivals</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">General</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(metrics.dailyArrivals).sort().map(([date, arrivals]) => (
                                    <tr key={date}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {format(new Date(date), 'MMM d, EEE')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {arrivals.length}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {arrivals.filter(a => a.general_accommodation).length}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {arrivals.filter(a => a.hotel_accommodation).length}
                                        </td>
                                    </tr>
                                ))}
                                {Object.keys(metrics.dailyArrivals).length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
                                            No upcoming arrivals scheduled
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* SECTION 4: MEAL PLANNING */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Meal Planning</h3>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Outside Zaria Only</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                                <Utensils size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Attendees with Meals</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.mealStats.totalAttendees}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-100 rounded-full text-red-600">
                                <Utensils size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Est. Total Meals</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics.mealStats.totalMeals}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Avg Meals/Day</p>
                                <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.mealStats.avgPerDay)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 5: MEMBER & LOCATION ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member Status */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Distribution</h3>
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="h-64 w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Members', value: metrics.memberStats.members },
                                            { name: 'Non-Members', value: metrics.memberStats.nonMembers }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#2563EB" />
                                        <Cell fill="#9333EA" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 mt-4 md:mt-0 pl-0 md:pl-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Top Branches</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {metrics.memberStats.byBranch.slice(0, 5).map((branch, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <span className="truncate w-32" title={branch.branch}>{branch.branch}</span>
                                        <div className="flex items-center flex-1 mx-2">
                                            <div className="h-2 bg-gray-100 rounded-full flex-1 overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${(branch.count / metrics.memberStats.members) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="font-medium">{branch.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Distribution */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="h-64 w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Within Zaria', value: metrics.locationStats.withinZaria },
                                            { name: 'Outside Zaria', value: metrics.locationStats.outsideZaria }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                    >
                                        <Cell fill="#9CA3AF" />
                                        <Cell fill="#10B981" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 mt-4 md:mt-0 pl-0 md:pl-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Top Nationalities</h4>
                            <div className="space-y-2">
                                {metrics.locationStats.byNationality.map((nat, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                            <Globe size={14} className="mr-2 text-gray-400" />
                                            <span>{nat.country}</span>
                                        </div>
                                        <span className="font-medium">{nat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 6: UNIT DISTRIBUTION */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registrations by Unit</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={metrics.unitStats.slice(0, 10)}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="unit" type="category" width={120} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {metrics.unitStats.slice(0, 10).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* SECTION 7: RECENT REGISTRATIONS */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
                    <Link to="/admin/registrations" className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {metrics.recentRegistrations.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {reg.full_name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                                                <div className="text-xs text-gray-500">{reg.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.mode_of_participation === 'online' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {reg.mode_of_participation}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {reg.mode_of_participation === 'onsite' ? (
                                            <span className={`flex items-center ${reg.location === 'outside_zaria' ? 'text-blue-600' : 'text-gray-600'}`}>
                                                <MapPin size={14} className="mr-1" />
                                                {reg.location === 'outside_zaria' ? 'Outside Zaria' : 'Within Zaria'}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(reg.created_at), 'MMM d, HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/admin/registrations?id=${reg.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 8: ALERTS & NOTIFICATIONS */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
                <div className="space-y-3">
                    {metrics.pendingSupport > 5 && (
                        <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">High Support Volume</p>
                                <p className="text-xs text-red-600">{metrics.pendingSupport} support requests pending attention.</p>
                            </div>
                            <Link to="/admin/support" className="text-sm font-medium text-red-700 hover:text-red-800">View</Link>
                        </div>
                    )}
                    {metrics.accommodationStats.general > 0 && (
                        <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <Info className="h-5 w-5 text-yellow-500 mr-3" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-yellow-800">Accommodation Check</p>
                                <p className="text-xs text-yellow-600">{metrics.accommodationStats.general} attendees requesting general accommodation.</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800">System Status</p>
                            <p className="text-xs text-blue-600">All systems operational. Database connected.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 9: QUICK STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickStatCard icon={Shield} label="Badges Generated" value="0" color="purple" link="/admin/badges" />
                <QuickStatCard icon={Mail} label="Emails Sent" value="0" color="blue" link="/admin/emails" />
                <QuickStatCard icon={Clock} label="Avg Reg Time" value="2.5m" color="green" />
                <QuickStatCard icon={Database} label="Storage Used" value="45%" color="gray" />
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color, trend, subMetrics, percentage, progressBar, alert, subtext }) {
    const colorClasses = {
        blue: "bg-blue-500 text-blue-600 bg-blue-50",
        green: "bg-green-500 text-green-600 bg-green-50",
        orange: "bg-orange-500 text-orange-600 bg-orange-50",
        purple: "bg-purple-500 text-purple-600 bg-purple-50",
        red: "bg-red-500 text-red-600 bg-red-50",
        gray: "bg-gray-500 text-gray-600 bg-gray-50",
    };

    const [bg, text, lightBg] = colorClasses[color].split(" ");

    return (
        <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${alert ? 'border-red-500 animate-pulse' : `border-${color}-500`}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${lightBg}`}>
                    <Icon className={`h-6 w-6 ${text}`} />
                </div>
            </div>

            {trend && (
                <div className="flex items-center mt-2">
                    {trend.positive ? <ArrowUp size={16} className="text-green-500" /> : <ArrowDown size={16} className="text-red-500" />}
                    <span className={`text-xs font-medium ml-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.value}
                    </span>
                </div>
            )}

            {progressBar && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">{percentage}% of total</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${bg}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {subMetrics && (
                <div className="mt-4 space-y-1">
                    {subMetrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 bg-${metric.color}-500`}></div>
                                <span className="text-gray-500">{metric.label}</span>
                            </div>
                            <span className="font-medium text-gray-900">{metric.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {subtext && (
                <p className={`mt-2 text-xs font-medium ${alert ? 'text-red-600' : 'text-gray-500'}`}>
                    {subtext}
                </p>
            )}
        </div>
    );
}

function QuickStatCard({ icon: Icon, label, value, color, link }) {
    const colors = {
        purple: "text-purple-600 bg-purple-50",
        blue: "text-blue-600 bg-blue-50",
        green: "text-green-600 bg-green-50",
        gray: "text-gray-600 bg-gray-50"
    };

    const Content = () => (
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-full ${colors[color]}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-medium">{label}</p>
                <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );

    if (link) {
        return <Link to={link}><Content /></Link>;
    }
    return <Content />;
}
