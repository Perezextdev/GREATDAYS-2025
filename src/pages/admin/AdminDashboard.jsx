import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import {
    Users,
    Wifi,
    MapPin,
    LifeBuoy,
    Home,
    Calendar,
    Download,
    Mail,
    FileSpreadsheet,
    RefreshCw,
    BarChart3
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { exportToExcel } from '../../utils/excelExport';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        totalRegistrations: 0,
        onlineCount: 0,
        onsiteCount: 0,
        pendingSupport: 0,
        accommodation: {
            general: 0,
            hotel: 0,
            none: 0
        },
        location: {
            within: 0,
            outside: 0
        },
        members: {
            member: 0,
            nonMember: 0
        },
        units: [],
        recentRegistrations: [],
        dailyArrivals: []
    });

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Get total counts and distributions
            const { data: allRegs, error } = await supabase
                .from('registrations')
                .select('*');

            if (error) throw error;

            // 2. Get pending support requests
            const { count: supportCount } = await supabase
                .from('support_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'new');

            // Process data
            const stats = {
                totalRegistrations: allRegs.length,
                onlineCount: allRegs.filter(r => r.participation_mode === 'Online').length,
                onsiteCount: allRegs.filter(r => r.participation_mode === 'Onsite').length,
                pendingSupport: supportCount || 0,
                accommodation: {
                    general: allRegs.filter(r => r.accommodation_type === 'General').length,
                    hotel: allRegs.filter(r => r.accommodation_type === 'Hotel').length,
                    none: allRegs.filter(r => !r.needs_accommodation).length
                },
                location: {
                    within: allRegs.filter(r => r.location_type === 'Within Zaria').length,
                    outside: allRegs.filter(r => r.location_type === 'Outside Zaria').length
                },
                members: {
                    member: allRegs.filter(r => r.is_member).length,
                    nonMember: allRegs.filter(r => !r.is_member).length
                },
                units: processUnitDistribution(allRegs),
                recentRegistrations: allRegs
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 10),
                dailyArrivals: processDailyArrivals(allRegs)
            };

            setMetrics(stats);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processUnitDistribution = (data) => {
        const units = {};
        data.forEach(r => {
            if (r.church_unit) {
                units[r.church_unit] = (units[r.church_unit] || 0) + 1;
            }
        });
        return Object.entries(units)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };

    const processDailyArrivals = (data) => {
        const next7Days = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const count = data.filter(r => r.arrival_date === dateStr).length;
            next7Days.push({ date: dateStr, count });
        }
        return next7Days;
    };

    const handleExport = () => {
        // TODO: Implement export logic
        console.log('Exporting data...');
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={fetchDashboardData}
                        className="flex items-center rounded bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        <RefreshCw size={16} className="mr-2" />
                        Refresh
                    </button>
                    <button className="flex items-center rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                        <Download size={16} className="mr-2" />
                        Download Report
                    </button>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Registrations"
                    value={metrics.totalRegistrations}
                    icon={Users}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Online Participants"
                    value={metrics.onlineCount}
                    subtext={`${((metrics.onlineCount / metrics.totalRegistrations || 0) * 100).toFixed(1)}%`}
                    icon={Wifi}
                    color="bg-green-500"
                />
                <MetricCard
                    title="Onsite Participants"
                    value={metrics.onsiteCount}
                    subtext={`${((metrics.onsiteCount / metrics.totalRegistrations || 0) * 100).toFixed(1)}%`}
                    icon={MapPin}
                    color="bg-purple-500"
                />
                <MetricCard
                    title="Pending Support"
                    value={metrics.pendingSupport}
                    icon={LifeBuoy}
                    color="bg-red-500"
                    alert={metrics.pendingSupport > 0}
                />
            </div>

            {/* Quick Access */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href="/admin/registrations" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="p-3 rounded-lg bg-blue-100 mr-4">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Registrations</p>
                            <p className="text-sm text-gray-500">Manage attendees</p>
                        </div>
                    </a>
                    <a href="/admin/badges" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="p-3 rounded-lg bg-purple-100 mr-4">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Badges</p>
                            <p className="text-sm text-gray-500">Generate & download</p>
                        </div>
                    </a>
                    <a href="/admin/analytics" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="p-3 rounded-lg bg-green-100 mr-4">
                            <BarChart3 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Analytics</p>
                            <p className="text-sm text-gray-500">Event insights</p>
                        </div>
                    </a>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Location Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Within Zaria', value: metrics.location.within },
                                        { name: 'Outside Zaria', value: metrics.location.outside }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    <Cell fill="#0088FE" />
                                    <Cell fill="#FF8042" />
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Unit Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={metrics.units.slice(0, 5)}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <RechartsTooltip />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="rounded-lg bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Recent Registrations</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-900">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {metrics.recentRegistrations.map((reg) => (
                                <tr key={reg.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                {reg.full_name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.participation_mode === 'Online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {reg.participation_mode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(reg.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, subtext, icon: Icon, color, alert }) {
    return (
        <div className={`rounded-lg bg-white p-6 shadow-sm ${alert ? 'ring-2 ring-red-500' : ''}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
                    {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
                </div>
                <div className={`rounded-full p-3 ${color.replace('bg-', 'bg-opacity-10 text-')}`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
            </div>
        </div>
    );
}
