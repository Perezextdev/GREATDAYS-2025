import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (token) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);

            // Get recent registrations (last 24 hours)
            const regsResponse = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?select=*&order=created_at.desc&limit=5`,
                {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Get recent support requests
            const supportResponse = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/support_requests?select=*&order=created_at.desc&limit=5`,
                {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const notifications = [];

            if (regsResponse.ok) {
                const regs = await regsResponse.json();
                regs.forEach(reg => {
                    const timeAgo = getTimeAgo(reg.created_at);
                    notifications.push({
                        id: `reg-${reg.id}`,
                        type: 'registration',
                        title: 'New Registration',
                        message: `${reg.full_name} registered for the event.`,
                        time: timeAgo,
                        timestamp: reg.created_at,
                        unread: !reg.viewed_by_admin,
                        color: 'blue'
                    });
                });
            }

            if (supportResponse.ok) {
                const supports = await supportResponse.json();
                supports.forEach(support => {
                    const timeAgo = getTimeAgo(support.created_at);
                    const priority = support.priority === 'urgent' ? 'Urgent: ' : '';
                    notifications.push({
                        id: `support-${support.id}`,
                        type: 'support',
                        title: 'Support Request',
                        message: `${priority}${support.subject}`,
                        time: timeAgo,
                        timestamp: support.created_at,
                        unread: support.status === 'open',
                        color: support.priority === 'urgent' ? 'red' : 'yellow'
                    });
                });
            }

            // Sort by timestamp descending
            notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setNotifications(notifications.slice(0, 10)); // Keep only 10 most recent
            setUnreadCount(notifications.filter(n => n.unread).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const markAllAsRead = async () => {
        // Could implement backend call to mark notifications as read
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        setUnreadCount(0);
    };

    return {
        notifications,
        loading,
        unreadCount,
        markAllAsRead,
        refresh: fetchNotifications
    };
}
