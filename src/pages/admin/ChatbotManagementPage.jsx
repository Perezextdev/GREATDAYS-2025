import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare, Users, TrendingUp, AlertCircle,
    CheckCircle, Clock, Send, RefreshCw, Settings,
    Download, Filter, Search, Bot, User
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { chatService } from '../../services/chatService';

export default function ChatbotManagementPage() {
    const [stats, setStats] = useState({
        totalConversations: 0,
        escalatedChats: 0,
        avgResponseTime: 0,
        satisfactionRate: 0
    });
    const [escalatedChats, setEscalatedChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, open, resolved
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load escalated chats from support_requests where source = 'chatbot'
            let query = supabase
                .from('support_requests')
                .select('*')
                .eq('source', 'chatbot')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data: chats, error } = await query;

            if (error) throw error;

            setEscalatedChats(chats || []);

            // Calculate stats
            const totalEscalated = chats?.length || 0;
            const openChats = chats?.filter(c => c.status === 'open').length || 0;
            const resolvedChats = chats?.filter(c => c.status === 'resolved').length || 0;

            setStats({
                totalConversations: totalEscalated,
                escalatedChats: totalEscalated,
                avgResponseTime: 0, // Could be calculated from timestamps
                satisfactionRate: resolvedChats > 0 ? ((resolvedChats / totalEscalated) * 100).toFixed(1) : 0
            });
        } catch (error) {
            console.error('Error loading chatbot data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateChatStatus = async (chatId, newStatus) => {
        try {
            const { error } = await supabase
                .from('support_requests')
                .update({ status: newStatus })
                .eq('id', chatId);

            if (error) throw error;

            // Reload data
            loadData();
            if (selectedChat?.id === chatId) {
                setSelectedChat({ ...selectedChat, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating chat status:', error);
            alert('Failed to update status');
        }
    };

    const filteredChats = escalatedChats.filter(chat =>
        chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.subject?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Bot className="text-blue-600" />
                        Chatbot Management
                    </h1>
                    <p className="text-gray-600 mt-1">Monitor AI assistant performance and escalated conversations</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={MessageSquare}
                    label="Total Conversations"
                    value={stats.totalConversations}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Escalated Chats"
                    value={stats.escalatedChats}
                    color="bg-orange-500"
                />
                <StatCard
                    icon={Clock}
                    label="Avg Response Time"
                    value={`${stats.avgResponseTime}m`}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Resolution Rate"
                    value={`${stats.satisfactionRate}%`}
                    color="bg-green-500"
                />
            </div>

            {/* Escalated Chats Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Escalated Conversations</h2>

                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                                />
                            </div>

                            {/* Filter */}
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                        <p className="text-gray-600 mt-4">Loading conversations...</p>
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="p-12 text-center">
                        <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600">No escalated conversations found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredChats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                                    }`}
                                onClick={() => setSelectedChat(chat)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${chat.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                                    chat.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {chat.status.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${chat.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                    chat.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {chat.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">{chat.email}</p>
                                        <p className="text-sm text-gray-900 font-medium mb-2">{chat.subject}</p>
                                        <p className="text-sm text-gray-600 line-clamp-2">{chat.message}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {new Date(chat.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        {chat.status === 'open' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateChatStatus(chat.id, 'in_progress');
                                                }}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Start
                                            </button>
                                        )}
                                        {chat.status === 'in_progress' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateChatStatus(chat.id, 'resolved');
                                                }}
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Resolve
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Chat Details Modal */}
            {selectedChat && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedChat(null)}
                >
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Conversation Details</h2>
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">User</label>
                                <p className="text-gray-900">{selectedChat.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <p className="text-gray-900">{selectedChat.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Subject</label>
                                <p className="text-gray-900">{selectedChat.subject}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Full Message</label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm text-gray-900">
                                    {selectedChat.message}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        updateChatStatus(selectedChat.id, 'in_progress');
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    disabled={selectedChat.status === 'in_progress'}
                                >
                                    Mark In Progress
                                </button>
                                <button
                                    onClick={() => {
                                        updateChatStatus(selectedChat.id, 'resolved');
                                    }}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    disabled={selectedChat.status === 'resolved'}
                                >
                                    Mark Resolved
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
