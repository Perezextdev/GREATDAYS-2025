import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { History, User, FileText, Settings, Shield, LogIn } from 'lucide-react';

export default function ActivityLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();

        // Realtime subscription
        const subscription = supabase
            .channel('activity-logs')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'activity_logs'
            }, (payload) => {
                setLogs(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (action) => {
        if (action.includes('login')) return LogIn;
        if (action.includes('create')) return FileText;
        if (action.includes('update')) return Settings;
        if (action.includes('delete')) return Shield;
        return History;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                <p className="text-gray-500">Chronological record of system events</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading activity...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No activity recorded yet</div>
                    ) : (
                        logs.map((log) => {
                            const Icon = getIcon(log.action.toLowerCase());
                            return (
                                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                                    <div className="p-2 bg-gray-100 rounded-full text-gray-500 mt-1">
                                        <Icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">
                                            <span className="font-bold">{log.actor_name || 'System'}</span> {log.action}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(log.created_at).toLocaleString()}
                                        </p>
                                        {log.details && Object.keys(log.details).length > 0 && (
                                            <div className="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-100 font-mono text-gray-600 overflow-x-auto">
                                                {JSON.stringify(log.details, null, 2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
