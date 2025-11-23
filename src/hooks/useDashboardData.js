import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useDashboardData() {
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
        try {
            setLoading(true);

            // Fetch all registrations
            const { data: registrations, error: regError } = await supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });

            if (regError) throw regError;

            // Fetch pending support requests
            const { data: supportRequests, error: supError } = await supabase
                .from('support_requests')
                .select('*')
                .eq('status', 'new');

            if (supError) throw supError;

            // Calculate Metrics
            const totalRegistrations = registrations?.length || 0;
            const onlineCount = registrations?.filter(r => r.mode_of_participation === 'online').length || 0;
            const onsiteCount = registrations?.filter(r => r.mode_of_participation === 'onsite').length || 0;
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
                    if (curr.mode_of_participation === 'online') acc[date].online += 1;
                    if (curr.mode_of_participation === 'onsite') acc[date].onsite += 1;
                    return acc;
                }, {});

            const registrationTrends = Object.values(trendData || {}).sort((a, b) => new Date(a.date) - new Date(b.date));

            // Accommodation Stats
            const onsiteRegs = registrations?.filter(r => r.mode_of_participation === 'onsite') || [];
            const generalAccom = onsiteRegs.filter(r => r.general_accommodation).length;
            const hotelAccom = onsiteRegs.filter(r => r.hotel_accommodation).length;
            const noAccom = onsiteRegs.filter(r => !r.general_accommodation && !r.hotel_accommodation).length;

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
            const outsideZariaAttendees = onsiteRegs.filter(r => r.location === 'outside_zaria');
            const totalAttendeesWithMeals = outsideZariaAttendees.length;
            // Simplified meal calc (assuming 3 meals/day for duration)
            // In a real app, we'd calculate based on arrival/departure dates
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
            const withinZaria = onsiteRegs.filter(r => r.location === 'within_zaria').length;
            const outsideZaria = onsiteRegs.filter(r => r.location === 'outside_zaria').length;

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
                    dailyBreakdown: [] // Populate if needed
                },
                memberStats: {
                    members,
                    nonMembers,
                    byBranch: memberStatsByBranch
                },
                locationStats: {
                    withinZaria,
                    outsideZaria,
                    byNationality: nationalityStats
                },
                unitStats
            });

        } catch (err) {
            console.error('Error fetching dashboard metrics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardMetrics();

        // Set up real-time subscription for registrations
        const subscription = supabase
            .channel('dashboard_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
                fetchDashboardMetrics();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_requests' }, () => {
                fetchDashboardMetrics();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { metrics, loading, error, refresh: fetchDashboardMetrics };
}
