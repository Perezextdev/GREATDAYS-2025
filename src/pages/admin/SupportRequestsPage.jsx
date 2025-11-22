import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
    MessageSquare,
    CheckCircle,
    Clock,
    AlertTriangle,
    Send,
    Trash2,
    Filter,
    ArrowLeft,
    MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SupportRequestsPage() {
    const { hasPermission } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, open, in_progress, resolved
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        fetchRequests();
        checkMobileView();
        window.addEventListener('resize', checkMobileView);
        return () => window.removeEventListener('resize', checkMobileView);
    }, [filter]);

    const checkMobileView = () => {
        setIsMobileView(window.innerWidth < 768);
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('support_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('support_requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setRequests(prev => prev.map(r =>
                r.id === id ? { ...r, status: newStatus } : r
            ));

            if (selectedRequest?.id === id) {
                setSelectedRequest(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedRequest) return;

        try {
            // Log the email (in a real app, this would trigger an email service)
            const { error: logError } = await supabase
                .from('email_logs')
                .insert([{
                    recipient_email: selectedRequest.email,
                    subject: `Re: ${selectedRequest.subject}`,
                    body: replyText,
                    status: 'sent'
                }]);

            if (logError) throw logError;

            // Update request status to resolved if it was open
            if (selectedRequest.status === 'open') {
                await handleStatusUpdate(selectedRequest.id, 'resolved');
            }

            alert('Reply sent successfully!');
            setReplyText('');
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Failed to send reply');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this request?')) return;
        try {
            const { error } = await supabase
                .from('support_requests')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setRequests(prev => prev.filter(r => r.id !== id));
            if (selectedRequest?.id === id) setSelectedRequest(null);
            if (isMobileView) setSelectedRequest(null); // Go back to list on mobile
        } catch (error) {
            console.error('Error deleting request:', error);
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-blue-600 bg-blue-100';
        }
    };

    const getStatusIcon = (s) => {
        switch (s) {
            case 'resolved': return <CheckCircle size={16} className="text-green-500" />;
            case 'in_progress': return <Clock size={16} className="text-yellow-500" />;
            default: return <AlertTriangle size={16} className="text-red-500" />;
        }
    };

    // Mobile: Show list if no request selected, show detail if selected
    // Desktop: Show both side by side

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className={`flex justify-between items-center mb-6 ${isMobileView && selectedRequest ? 'hidden' : ''}`}>
                <h1 className="text-2xl font-bold text-gray-900">Support Requests</h1>
                <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
                    {['all', 'open', 'in_progress', 'resolved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize whitespace-nowrap ${filter === f
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden relative">
                {/* List View */}
                <div className={`
                    ${isMobileView ? 'w-full absolute inset-0 z-10' : 'w-1/3'} 
                    bg-white rounded-lg shadow-sm border border-gray-200 overflow-y-auto
                    transition-transform duration-300 ease-in-out
                    ${isMobileView && selectedRequest ? '-translate-x-full' : 'translate-x-0'}
                `}>
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No requests found.</div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {requests.map((req) => (
                                <div
                                    key={req.id}
                                    onClick={() => setSelectedRequest(req)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedRequest?.id === req.id && !isMobileView ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${getPriorityColor(req.priority)}`}>
                                                {req.priority}
                                            </span>
                                            {req.source === 'chatbot' && (
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-600 flex items-center gap-1">
                                                    <MessageCircle size={12} />
                                                    Chat
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 truncate">{req.subject}</h3>
                                    <p className="text-xs text-gray-500 truncate">{req.name}</p>
                                    <div className="mt-2 flex items-center text-xs text-gray-500">
                                        {getStatusIcon(req.status)}
                                        <span className="ml-1 capitalize">{req.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail View */}
                <div className={`
                    ${isMobileView ? 'w-full absolute inset-0 z-20' : 'flex-1'} 
                    bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${isMobileView && !selectedRequest ? 'translate-x-full' : 'translate-x-0'}
                `}>
                    {selectedRequest ? (
                        <>
                            <div className="p-4 md:p-6 border-b border-gray-200">
                                <div className="flex flex-col gap-4">
                                    {isMobileView && (
                                        <button
                                            onClick={() => setSelectedRequest(null)}
                                            className="flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            <ArrowLeft size={20} className="mr-1" />
                                            Back to List
                                        </button>
                                    )}

                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-xl font-bold text-gray-900 break-words">{selectedRequest.subject}</h2>
                                                {selectedRequest.source === 'chatbot' && (
                                                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-600 flex items-center gap-1">
                                                        <MessageCircle size={14} />
                                                        From Chat
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
                                                <span>From: <span className="font-medium text-gray-900">{selectedRequest.name}</span></span>
                                                <span className="break-all">&lt;{selectedRequest.email}&gt;</span>
                                            </div>
                                        </div>
                                    </div>

                                    {hasPermission('manage_support') && (
                                        <div className="flex items-center space-x-2 mt-2">
                                            <select
                                                value={selectedRequest.status}
                                                onChange={(e) => handleStatusUpdate(selectedRequest.id, e.target.value)}
                                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                            >
                                                <option value="open">Open</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                            <button
                                                onClick={() => handleDelete(selectedRequest.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <p className="text-gray-800 whitespace-pre-wrap">{selectedRequest.message}</p>
                                </div>
                            </div>

                            {hasPermission('manage_support') && (
                                <div className="p-4 border-t border-gray-200 bg-white">
                                    <form onSubmit={handleReply}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Reply</label>
                                        <textarea
                                            rows={4}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Type your reply here..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <div className="mt-3 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={!replyText.trim()}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                            >
                                                <Send size={16} className="mr-2" />
                                                Send Reply
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                                <p>Select a request to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
