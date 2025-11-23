import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
    calculateRegistrationTrends,
    calculateDailyArrivals,
    calculateMealRequirements,
    calculateAccommodationStats,
    calculateNationalityBreakdown,
    calculateBranchDistribution,
    calculateUnitDistribution,
    calculateModeLocationStats
} from '../../utils/analyticsCalculator';
import { exportDailyArrivals, exportMealPlan, exportAccommodationList } from '../../utils/excelExport';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar, Users, Hotel, Utensils, Download, TrendingUp, Globe, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const AnalyticsPage = () => {
    const { token } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchRegistrations();
    }, [token]);

    const fetchRegistrations = async () => {
        if (!token) return;

        try {
            setLoading(true);
            console.log('[AnalyticsPage] Fetching registrations with token...');

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?select=*&order=created_at.asc`, {
                headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || `Failed to fetch registrations: ${response.status}`);
            }

            const data = await response.json();
            setRegistrations(data || []);
            calculateAnalytics(data || []);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (data) => {
        const trends = calculateRegistrationTrends(data);
        const arrivals = calculateDailyArrivals(data);
        const meals = calculateMealRequirements(data);
        const accommodation = calculateAccommodationStats(data);
        const nationality = calculateNationalityBreakdown(data);
        const branches = calculateBranchDistribution(data);
        const units = calculateUnitDistribution(data);
        const modeLocation = calculateModeLocationStats(data);

        setAnalytics({
            trends,
            arrivals,
            meals,
            accommodation,
            nationality,
            branches,
            units,
            modeLocation
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Event Analytics</h1>
                    <p className="text-slate-600">Comprehensive insights for GREAT DAYS 2025 planning</p>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <SummaryCard
                        title="Total Registrations"
                        value={registrations.length}
                        icon={Users}
                        color="blue"
                        trend={`+${analytics?.trends?.currentRate || 0}/day`}
                    />
                    <SummaryCard
                        title="Onsite Attendees"
                        value={analytics?.modeLocation?.onsiteCount || 0}
                        icon={Building2}
                        color="purple"
                        trend={`${analytics?.modeLocation?.modePercentages?.onsite || 0}%`}
                    />
                    <SummaryCard
                        title="Meal Tickets"
                        value={analytics?.modeLocation?.outsideZariaCount || 0}
                        icon={Utensils}
                        color="green"
                        trend={`${analytics?.meals?.totalMeals || 0} total meals`}
                    />
                    <SummaryCard
                        title="Countries"
                        value={analytics?.nationality?.totalCountries || 0}
                        icon={Globe}
                        color="orange"
                        trend={`${analytics?.nationality?.internationalCount || 0} international`}
                    />
                </div>

                {/* Registration Trends */}
                <Section title="Registration Trends">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <InfoCard
                            label="Peak Day"
                            value={analytics?.trends?.peakDay ? format(new Date(analytics.trends.peakDay.date), 'MMM dd') : 'N/A'}
                            sublabel={`${analytics?.trends?.peakDay?.total || 0} registrations`}
                        />
                        <InfoCard
                            label="Current Rate"
                            value={`${analytics?.trends?.currentRate || 0}/day`}
                            sublabel="Last 7 days average"
                        />
                        <InfoCard
                            label="Projected Total"
                            value={analytics?.trends?.projection || 0}
                            sublabel="By event date"
                        />
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.trends?.dailyCounts || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                stroke="#64748b"
                            />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} name="Total" />
                            <Line type="monotone" dataKey="online" stroke="#8b5cf6" strokeWidth={2} name="Online" />
                            <Line type="monotone" dataKey="onsite" stroke="#10b981" strokeWidth={2} name="Onsite" />
                        </LineChart>
                    </ResponsiveContainer>
                </Section>

                {/* Daily Arrivals */}
                <Section
                    title="Daily Arrivals Forecast"
                    action={
                        <button
                            onClick={() => exportDailyArrivals(analytics?.arrivals?.arrivalsByDate || [])}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Excel
                        </button>
                    }
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <InfoCard
                            label="Total Arrivals"
                            value={analytics?.arrivals?.totalArrivals || 0}
                            sublabel="Onsite attendees"
                        />
                        <InfoCard
                            label="Peak Arrival Date"
                            value={analytics?.arrivals?.peakArrivalDate ? format(new Date(analytics.arrivals.peakArrivalDate.date), 'MMM dd') : 'N/A'}
                            sublabel={`${analytics?.arrivals?.peakArrivalDate?.count || 0} arrivals`}
                        />
                        <InfoCard
                            label="Avg Stay"
                            value={`${analytics?.accommodation?.averageStayDuration || 0} nights`}
                            sublabel="Average duration"
                        />
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.arrivals?.arrivalsByDate || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                stroke="#64748b"
                            />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#3b82f6" name="Total Arrivals" />
                            <Bar dataKey="withMeals" fill="#22c55e" name="With Meals" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Accommodation Planning */}
                <Section
                    title="Accommodation Capacity"
                    action={
                        <button
                            onClick={() => exportAccommodationList(registrations)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export List
                        </button>
                    }
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <InfoCard
                            label="General Accommodation"
                            value={analytics?.accommodation?.generalRequests || 0}
                            sublabel="Requests"
                        />
                        <InfoCard
                            label="Hotel Accommodation"
                            value={analytics?.accommodation?.hotelRequests || 0}
                            sublabel="Requests"
                        />
                        <InfoCard
                            label="Peak Occupancy"
                            value={analytics?.accommodation?.peakOccupancyDate ? format(new Date(analytics.accommodation.peakOccupancyDate.date), 'MMM dd') : 'N/A'}
                            sublabel={`${analytics?.accommodation?.peakOccupancyDate?.total || 0} occupants`}
                        />
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.accommodation?.nightlyOccupancy || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                stroke="#64748b"
                            />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Bar dataKey="general" stackId="a" fill="#8b5cf6" name="General" />
                            <Bar dataKey="hotel" stackId="a" fill="#ec4899" name="Hotel" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Meal Planning */}
                <Section
                    title="Meal Planning"
                    action={
                        <button
                            onClick={() => exportMealPlan(analytics?.meals?.dailyMeals || [])}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export for Catering
                        </button>
                    }
                >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                        <InfoCard
                            label="Total Breakfast"
                            value={analytics?.meals?.totalBreakfast || 0}
                            sublabel="Full event"
                        />
                        <InfoCard
                            label="Total Lunch"
                            value={analytics?.meals?.totalLunch || 0}
                            sublabel="Full event"
                        />
                        <InfoCard
                            label="Total Dinner"
                            value={analytics?.meals?.totalDinner || 0}
                            sublabel="Full event"
                        />
                        <InfoCard
                            label="Grand Total"
                            value={analytics?.meals?.totalMeals || 0}
                            sublabel="All meals"
                        />
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.meals?.dailyMeals || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                stroke="#64748b"
                            />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Bar dataKey="breakfast" fill="#f59e0b" name="Breakfast" />
                            <Bar dataKey="lunch" fill="#10b981" name="Lunch" />
                            <Bar dataKey="dinner" fill="#3b82f6" name="Dinner" />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Demographics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Nationality Breakdown */}
                    <Section title="Nationality Distribution">
                        <div className="flex items-center justify-between mb-6">
                            <InfoCard
                                label="International"
                                value={analytics?.nationality?.internationalCount || 0}
                                sublabel={`${((analytics?.nationality?.internationalCount / registrations.length) * 100).toFixed(1)}%`}
                            />
                            <InfoCard
                                label="Local (Nigeria)"
                                value={analytics?.nationality?.localCount || 0}
                                sublabel={`${((analytics?.nationality?.localCount / registrations.length) * 100).toFixed(1)}%`}
                            />
                        </div>

                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={analytics?.nationality?.countries?.slice(0, 6) || []}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={(entry) => `${entry.name}: ${entry.percentage}%`}
                                >
                                    {analytics?.nationality?.countries?.slice(0, 6).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Top 10 Countries Table */}
                        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900">Country</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-slate-900">Count</th>
                                        <th className="px-4 py-2 text-right text-sm font-semibold text-slate-900">%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {analytics?.nationality?.countries?.slice(0, 10).map((country, index) => (
                                        <tr key={index} className="hover:bg-slate-50">
                                            <td className="px-4 py-2 text-sm text-slate-900">{country.name}</td>
                                            <td className="px-4 py-2 text-sm text-slate-600 text-right">{country.count}</td>
                                            <td className="px-4 py-2 text-sm text-slate-600 text-right">{country.percentage}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* Mode & Location */}
                    <Section title="Participation Mode & Location">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <InfoCard
                                label="Online"
                                value={analytics?.modeLocation?.onlineCount || 0}
                                sublabel={`${analytics?.modeLocation?.modePercentages?.online || 0}%`}
                            />
                            <InfoCard
                                label="Onsite"
                                value={analytics?.modeLocation?.onsiteCount || 0}
                                sublabel={`${analytics?.modeLocation?.modePercentages?.onsite || 0}%`}
                            />
                        </div>

                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Online', value: analytics?.modeLocation?.onlineCount || 0 },
                                        { name: 'Onsite', value: analytics?.modeLocation?.onsiteCount || 0 }
                                    ]}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={60}
                                    label={(entry) => `${entry.name}: ${((entry.value / registrations.length) * 100).toFixed(1)}%`}
                                >
                                    <Cell fill="#8b5cf6" />
                                    <Cell fill="#10b981" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="mt-6">
                            <h4 className="font-semibold text-slate-900 mb-3">Location (Onsite Only)</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoCard
                                    label="Within Zaria"
                                    value={analytics?.modeLocation?.withinZariaCount || 0}
                                    sublabel={`${analytics?.modeLocation?.locationPercentages?.within || 0}%`}
                                />
                                <InfoCard
                                    label="Outside Zaria"
                                    value={analytics?.modeLocation?.outsideZariaCount || 0}
                                    sublabel={`${analytics?.modeLocation?.locationPercentages?.outside || 0}%`}
                                />
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Branch & Unit Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Branches */}
                    {analytics?.branches?.branches?.length > 0 && (
                        <Section title="Branch Distribution">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={analytics?.branches?.branches?.slice(0, 10) || []}
                                    layout="vertical"
                                    margin={{ left: 100 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#64748b" />
                                    <YAxis dataKey="name" type="category" stroke="#64748b" width={90} />
                                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    <Bar dataKey="count" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Section>
                    )}

                    {/* Units */}
                    <Section title="Unit Distribution">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={analytics?.units?.units?.slice(0, 10) || []}
                                layout="vertical"
                                margin={{ left: 100 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" stroke="#64748b" />
                                <YAxis dataKey="name" type="category" stroke="#64748b" width={90} />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                <Bar dataKey="count" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Section>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const SummaryCard = ({ title, value, icon: Icon, color, trend }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{value}</h3>
            <p className="text-sm text-slate-600 mb-2">{title}</p>
            <p className="text-xs text-slate-500">{trend}</p>
        </motion.div>
    );
};

const Section = ({ title, children, action }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6"
    >
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {action}
        </div>
        {children}
    </motion.div>
);

const InfoCard = ({ label, value, sublabel }) => (
    <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-xs text-slate-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{sublabel}</p>
    </div>
);

export default AnalyticsPage;
