import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { Send, User, MoreVertical, Search, Phone, Video } from 'lucide-react';

export default function TeamChatPage() {
    const { user, adminProfile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const subscriptionRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        subscribeToMessages();

        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('team_messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50);

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToMessages = () => {
        subscriptionRef.current = supabase
            .channel('team-chat')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'team_messages'
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
            })
            .subscribe();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const content = newMessage.trim();
        setNewMessage(''); // Optimistic clear

        try {
            const { error } = await supabase
                .from('team_messages')
                .insert([{
                    sender_id: user.id,
                    sender_name: adminProfile?.full_name || user.email.split('@')[0],
                    content: content
                }]);

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            // Could add error handling UI here
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Sidebar (Members List) - Hidden on mobile for now */}
            <div className="hidden md:flex w-64 flex-col border-r border-gray-100 bg-gray-50">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Team Members</h2>
                </div>
                <div className="p-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {/* Mock Online Users */}
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                        <div className="relative">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-xs">
                                {adminProfile?.full_name?.charAt(0) || 'Me'}
                            </div>
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{adminProfile?.full_name || 'You'}</p>
                            <p className="text-xs text-green-600">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">General Team Chat</h2>
                            <p className="text-xs text-gray-500">All team members</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <Phone size={20} />
                        </button>
                        <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <Video size={20} />
                        </button>
                        <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                    {loading ? (
                        <div className="text-center text-gray-500 mt-10">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">No messages yet. Start the conversation!</div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${isMe ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {msg.sender_name?.charAt(0) || '?'}
                                    </div>
                                    <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-medium text-gray-900">{msg.sender_name}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white border border-gray-100 text-gray-900 rounded-tl-none shadow-sm'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
