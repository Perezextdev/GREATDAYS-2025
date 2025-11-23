import { useState } from 'react';
import { Calendar, Users, Home, Utensils, MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function EventOverviewPage() {
    const { metrics, loading } = useDashboardData();

    const eventInfo = {
        name: 'GREAT DAYS 2025',
        dates: 'December 15-21, 2025',
        location: 'FDIM Headquarters, Zaria',
        status: 'Active',
        daysUntil: 25
    };

    const stats = [
        {
            label: 'Total Registered',
            value: metrics.totalRegistrations,
            icon: Users,
            color: 'blue',
            link: '/admin/registrations'
        },
        {
            label: 'Onsite Participants',
            value: metrics.onsiteCount,
            icon: MapPin,
            color: 'green',
            link: '/admin/registrations?mode=onsite'
        },
        {
            label: 'Online Participants',
            value: metrics.onlineCount,
            icon: TrendingUp,
            color: 'orange',
            link: '/admin/registrations?mode=online'
        },
        {
            label: 'Accommodation Requests',
            value: metrics.needsAccommodation,
            icon: Home,
            color: 'purple',
            link: '/admin/accommodation'
        },
        {
            label: 'Meal Planning',
            value: metrics.onsiteCount, // Assuming onsite = meals needed
            icon: Utensils,
            color: 'red',
            link: '/admin/reports'
        },
        {
            label: 'Days Until Event',
            value: eventInfo.daysUntil,
            icon: Calendar,
            color: 'indigo',
            link: null
        },
    ];

    const quickLinks = [
        { name: 'Check-In Management', path: '/admin/check-in', description: 'Manage attendee check-ins' },
        { name: 'Arrivals Calendar', path: '/admin/arrivals', description: 'View expected arrivals' },
        { name: 'Accommodation', path: '/admin/accommodation', description: 'Manage accommodation' },
        { name: 'Session Tracking', path: '/admin/sessions', description: 'Track event sessions' },
        { name: 'Announcements', path: '/admin/announcements', description: 'Send event announcements' },
        { name: 'Live Dashboard', path: '/admin/live', description: 'Real-time monitoring' },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Event Overview</h1>
                    <p className="text-gray-500">Comprehensive view of {eventInfo.name}</p>
                </div>
                <SkeletonLoader />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonLoader key={i} variant="card" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Event Overview</h1>
                <p className="text-gray-500">Comprehensive view of {eventInfo.name}</p>
            </div>

            {/* Event Info Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">{eventInfo.name}</h2>
                        <p className="text-indigo-100 mb-1">📅 {eventInfo.dates}</p>
                        <p className="text-indigo-100">📍 {eventInfo.location}</p>
                    </div>
                    <div className="text-right">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4">
                            <p className="text-sm text-indigo-100">Event Status</p>
                            <p className="text-2xl font-bold">{eventInfo.status}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                            </div>
                        </div>
                        {stat.link && (
                            <Link to={stat.link} className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
                                View Details →
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickLinks.map((link, idx) => (
                        <Link
                            key={idx}
                            to={link.path}
                            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                            <h4 className="font-medium text-gray-900 mb-1">{link.name}</h4>
                            <p className="text-xs text-gray-500">{link.description}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Alerts */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-yellow-800">Event Preparation</p>
                    <p className="text-xs text-yellow-700 mt-1">
                        {eventInfo.daysUntil} days until the event. Ensure all preparations are complete.
                    </p>
                </div>
            </div>
        </div>
    );
}

