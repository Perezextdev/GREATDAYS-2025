import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useDashboardData() {
    const { token } = useAuth();
    const [metrics, setMetrics] = useState({
        totalRegistrations: 0,
        onlineCount: 0,
        onsiteCount: 0,
        pendingSupport: 0,
        registrations: [],
        supportRequests: [],
        recentRegistrations: [],
        registrationTrends: [],
        accommodationStats: {
            general: 0,
            hotel: 0,
            none: 0,
            totalNeeding: 0
        },
        dailyArrivals: {},
        mealStats: {
            totalAttendees: 0,
            totalMeals: 0,
            avgPerDay: 0,
            dailyBreakdown: []
        },
        memberStats: {
            members: 0,
            nonMembers: 0,
            byBranch: []
        },
        locationStats: {
            withinZaria: 0,
            outsideZaria: 0,
            byNationality: []
        },
        unitStats: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardMetrics = async () => {
        // If no token, we can't fetch data (unless public, but these are protected)
        if (!token) {
            // If we are still loading the session, keep loading true. 
            // But if we have no token and are not loading, then we should stop.
            // However, useAuth handles the initial loading state.
            // Here we just wait for token.
            return;
        }

        try {
            setLoading(true);
            console.log('[useDashboardData] Fetching data with token...');

            const headers = {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`
            };

            // Fetch registrations
            const regPromise = fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?select=*&order=created_at.desc`, { headers });

            // Fetch pending support requests
            const supPromise = fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/support_requests?select=*&status=eq.new`, { headers });

            const [regRes, supRes] = await Promise.all([regPromise, supPromise]);

            if (!regRes.ok) {
                const err = await regRes.json();
                throw new Error(err.message || `Failed to fetch registrations: ${regRes.status}`);
            }
            if (!supRes.ok) {
                const err = await supRes.json();
                throw new Error(err.message || `Failed to fetch support requests: ${supRes.status}`);
            }

            const registrations = await regRes.json();
            const supportRequests = await supRes.json();

            // Calculate Metrics
            const totalRegistrations = registrations?.length || 0;
            const onlineCount = registrations?.filter(r => r.participation_mode === 'Online').length || 0;
            const onsiteCount = registrations?.filter(r => r.participation_mode === 'Onsite').length || 0;
            const pendingSupport = supportRequests?.length || 0;

            // Recent Registrations (last 10)
            const recentRegistrations = registrations?.slice(0, 10) || [];

            // Registration Trends (Last 30 Days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const trendData = registrations
                ?.filter(r => new Date(r.created_at) >= thirtyDaysAgo)
                .reduce((acc, curr) => {
                    const date = new Date(curr.created_at).toISOString().split('T')[0];
                    if (!acc[date]) acc[date] = { date, online: 0, onsite: 0, total: 0 };
                    acc[date].total += 1;
                    if (curr.participation_mode === 'Online') acc[date].online += 1;
                    if (curr.participation_mode === 'Onsite') acc[date].onsite += 1;
                    return acc;
                }, {});

            const registrationTrends = Object.values(trendData || {}).sort((a, b) => new Date(a.date) - new Date(b.date));

            // Accommodation Stats
            const onsiteRegs = registrations?.filter(r => r.participation_mode === 'Onsite') || [];
            const generalAccom = onsiteRegs.filter(r => r.needs_accommodation && r.accommodation_type === 'General').length;
            const hotelAccom = onsiteRegs.filter(r => r.needs_accommodation && r.accommodation_type === 'Hotel').length;
            const noAccom = onsiteRegs.filter(r => !r.needs_accommodation).length;

            // Daily Arrivals
            const dailyArrivals = onsiteRegs.reduce((acc, curr) => {
                if (curr.arrival_date) {
                    const date = curr.arrival_date;
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(curr);
                }
                return acc;
            }, {});

            // Meal Stats (Outside Zaria only)
            const outsideZariaAttendees = onsiteRegs.filter(r => r.location_type === 'Outside Zaria');
            const totalAttendeesWithMeals = outsideZariaAttendees.length;
            const totalMeals = totalAttendeesWithMeals * 3 * 7; // Placeholder logic
            const avgPerDay = totalMeals / 7;

            // Member Stats
            const members = registrations?.filter(r => r.is_member).length || 0;
            const nonMembers = totalRegistrations - members;

            const byBranch = registrations
                ?.filter(r => r.is_member && r.branch)
                .reduce((acc, curr) => {
                    acc[curr.branch] = (acc[curr.branch] || 0) + 1;
                    return acc;
                }, {});

            const memberStatsByBranch = Object.entries(byBranch || {})
                .map(([branch, count]) => ({ branch, count }))
                .sort((a, b) => b.count - a.count);

            // Location Stats
            const withinZaria = onsiteRegs.filter(r => r.location_type === 'Within Zaria').length;
            const outsideZaria = onsiteRegs.filter(r => r.location_type === 'Outside Zaria').length;

            const byNationality = registrations?.reduce((acc, curr) => {
                const nat = curr.nationality || 'Unknown';
                acc[nat] = (acc[nat] || 0) + 1;
                return acc;
            }, {});

            const nationalityStats = Object.entries(byNationality || {})
                .map(([country, count]) => ({ country, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5); // Top 5

            // Unit Stats
            const byUnit = registrations?.reduce((acc, curr) => {
                const unit = curr.unit || 'None';
                acc[unit] = (acc[unit] || 0) + 1;
                return acc;
            }, {});

            const unitStats = Object.entries(byUnit || {})
                .map(([unit, count]) => ({ unit, count }))
                .sort((a, b) => b.count - a.count);

            setMetrics({
                totalRegistrations,
                onlineCount,
                onsiteCount,
                pendingSupport,
                registrations,
                supportRequests,
                recentRegistrations,
                registrationTrends,
                accommodationStats: {
                    general: generalAccom,
                    hotel: hotelAccom,
                    none: noAccom,
                    totalNeeding: generalAccom + hotelAccom
                },
                dailyArrivals,
                mealStats: {
                    totalAttendees: totalAttendeesWithMeals,
                    totalMeals,
                    avgPerDay,
                    dailyBreakdown: []
                },
                memberStats: {
                    members,
                    nonMembers,
                    byBranch: memberStatsByBranch
                },
                locationStats: {
                    withinZaria,
                    withinZaria,
                    outsideZaria,
                    byNationality: nationalityStats
                },
                unitStats
            });
            setError(null);

        } catch (err) {
            console.error('Error fetching dashboard metrics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardMetrics();
        // Realtime subscription removed to prevent client library hangs
    }, [token]);

    return { metrics, loading, error, refresh: fetchDashboardMetrics };
}
