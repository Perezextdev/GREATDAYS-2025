import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare, Users, TrendingUp, AlertCircle,
    CheckCircle, Clock, Send, RefreshCw, Settings,
    Download, Filter, Search, Bot, User, Shield, UserPlus
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function ChatbotManagementPage() {
    const { user, adminProfile } = useAuth();
    const [stats, setStats] = useState({
        totalConversations: 0,
        escalatedChats: 0,
        avgResponseTime: 0,
        satisfactionRate: 0
    });
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, escalated, closed, my_chats
    const [searchTerm, setSearchTerm] = useState('');
    const [adminMessage, setAdminMessage] = useState('');
    const messagesEndRef = useRef(null);
    const subscriptionRef = useRef(null);

    useEffect(() => {
        loadData();

        // Subscribe to new sessions
        const sessionSub = supabase
            .channel('admin-chat-sessions')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_sessions'
            }, () => {
                loadData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(sessionSub);
        };
    }, [filter]);

    useEffect(() => {
        if (selectedSession) {
            loadMessages(selectedSession.id);
            subscribeToMessages(selectedSession.id);
        } else {
            setMessages([]);
            if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);
        }
    }, [selectedSession]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadData = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('chat_sessions')
                .select(`
                    *,
                    assigned_to_user:assigned_to (
                        full_name,
                        email
                    )
                `)
                .order('updated_at', { ascending: false });

            if (filter === 'my_chats') {
                query = query.eq('assigned_to', user?.id);
            } else if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;

            setSessions(data || []);

            // Calculate stats
            const total = data?.length || 0;
            const escalated = data?.filter(s => s.status === 'escalated').length || 0;
            const closed = data?.filter(s => s.status === 'closed').length || 0;

            setStats({
                totalConversations: total,
                escalatedChats: escalated,
                avgResponseTime: 0,
                satisfactionRate: closed > 0 ? ((closed / total) * 100).toFixed(1) : 0
            });
        } catch (error) {
            console.error('Error loading chatbot data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (sessionId) => {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (!error) {
            setMessages(data || []);
        }
    };

    const subscribeToMessages = (sessionId) => {
        if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);

        subscriptionRef.current = supabase
            .channel(`admin-chat:${sessionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
            })
            .subscribe();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!adminMessage.trim() || !selectedSession) return;

        const content = adminMessage.trim();
        setAdminMessage('');

        try {
            const { error } = await supabase
                .from('chat_messages')
                .insert([{
                    session_id: selectedSession.id,
                    role: 'admin',
                    content: content
                }]);

            if (error) throw error;

            // Update session updated_at
            await supabase
                .from('chat_sessions')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', selectedSession.id);

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    const updateSessionStatus = async (sessionId, newStatus) => {
        try {
            const { error } = await supabase
                .from('chat_sessions')
                .update({ status: newStatus })
                .eq('id', sessionId);

            if (error) throw error;

            loadData();
            if (selectedSession?.id === sessionId) {
                setSelectedSession({ ...selectedSession, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const assignToMe = async (sessionId) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('chat_sessions')
                .update({ assigned_to: user.id })
                .eq('id', sessionId);

            if (error) throw error;
            loadData();
            if (selectedSession?.id === sessionId) {
                setSelectedSession({
                    ...selectedSession,
                    assigned_to: user.id,
                    assigned_to_user: { full_name: adminProfile?.full_name || 'Me' }
                });
            }
        } catch (error) {
            console.error('Error assigning session:', error);
        }
    };

    const filteredSessions = sessions.filter(session =>
        session.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="p-6 space-y-6 h-[calc(100vh-64px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Bot className="text-blue-600" />
                        Live Chat & Support
                    </h1>
                    <p className="text-gray-600 mt-1">Monitor and respond to live chat sessions</p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw size={18} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-shrink-0">
                <StatCard
                    icon={MessageSquare}
                    label="Total Sessions"
                    value={stats.totalConversations}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Escalated"
                    value={stats.escalatedChats}
                    color="bg-orange-500"
                />
                <StatCard
                    icon={Clock}
                    label="Active Now"
                    value={sessions.filter(s => s.status === 'active' || s.status === 'escalated').length}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Resolved"
                    value={sessions.filter(s => s.status === 'closed').length}
                    color="bg-green-500"
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* Sessions List */}
                <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {['all', 'my_chats', 'active', 'escalated', 'closed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${filter === status
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {status === 'my_chats' ? 'My Chats' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No sessions found
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredSessions.map(session => (
                                    <div
                                        key={session.id}
                                        onClick={() => setSelectedSession(session)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedSession?.id === session.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {session.user_name || 'Anonymous User'}
                                            </h3>
                                            <span className="text-xs text-gray-500">
                                                {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2 truncate">{session.user_email}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${session.status === 'escalated' ? 'bg-orange-100 text-orange-800' :
                                                    session.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                            {session.assigned_to_user && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <User size={12} />
                                                    {session.assigned_to_user.full_name?.split(' ')[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                    {selectedSession ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                                <div>
                                    <h2 className="font-bold text-gray-900">{selectedSession.user_name || 'Anonymous User'}</h2>
                                    <p className="text-sm text-gray-500">{selectedSession.user_email}</p>
                                </div>
                                <div className="flex gap-2">
                                    {!selectedSession.assigned_to && selectedSession.status !== 'closed' && (
                                        <button
                                            onClick={() => assignToMe(selectedSession.id)}
                                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 transition-colors flex items-center gap-1"
                                        >
                                            <UserPlus size={14} />
                                            Assign to Me
                                        </button>
                                    )}
                                    {selectedSession.status !== 'closed' && (
                                        <button
                                            onClick={() => updateSessionStatus(selectedSession.id, 'closed')}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                                        >
                                            Close Session
                                        </button>
                                    )}
                                    {selectedSession.status === 'active' && (
                                        <button
                                            onClick={() => updateSessionStatus(selectedSession.id, 'escalated')}
                                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200 transition-colors"
                                        >
                                            Mark Escalated
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-2 ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role !== 'admin' && (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-400'
                                                }`}>
                                                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.role === 'admin'
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-200'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${msg.role === 'admin' ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {msg.role === 'admin' && (
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                                <Shield size={16} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={adminMessage}
                                        onChange={(e) => setAdminMessage(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!adminMessage.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Send size={18} />
                                        Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare size={48} className="mb-4 opacity-20" />
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
