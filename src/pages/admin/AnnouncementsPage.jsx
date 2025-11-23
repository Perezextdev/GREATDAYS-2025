import { useState } from 'react';
import { Megaphone, Send, Users, Mail, MessageSquare, Plus, X } from 'lucide-react';

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: 'Welcome to GREAT DAYS 2025',
            message: 'We are excited to have you join us for this year\'s conference!',
            target: 'All Attendees',
            sentAt: '2025-11-20T10:00:00',
            sentBy: 'Admin'
        },
        {
            id: 2,
            title: 'Accommodation Reminder',
            message: 'Please confirm your accommodation preferences by December 1st.',
            target: 'Onsite Participants',
            sentAt: '2025-11-18T14:30:00',
            sentBy: 'Admin'
        }
    ]);

    const [showNewForm, setShowNewForm] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        message: '',
        target: 'all'
    });

    const handleSend = () => {
        const announcement = {
            id: announcements.length + 1,
            ...newAnnouncement,
            target: newAnnouncement.target === 'all' ? 'All Attendees' :
                newAnnouncement.target === 'onsite' ? 'Onsite Participants' : 'Online Participants',
            sentAt: new Date().toISOString(),
            sentBy: 'Admin'
        };
        setAnnouncements([announcement, ...announcements]);
        setNewAnnouncement({ title: '', message: '', target: 'all' });
        setShowNewForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-500">Send important updates to attendees</p>
                </div>
                <button
                    onClick={() => setShowNewForm(!showNewForm)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    {showNewForm ? <X size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
                    {showNewForm ? 'Cancel' : 'New Announcement'}
                </button>
            </div>

            {/* New Announcement Form */}
            {showNewForm && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Announcement</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Announcement title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                value={newAnnouncement.message}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Your announcement message..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                            <select
                                value={newAnnouncement.target}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Attendees</option>
                                <option value="onsite">Onsite Participants Only</option>
                                <option value="online">Online Participants Only</option>
                            </select>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSend}
                                disabled={!newAnnouncement.title || !newAnnouncement.message}
                                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} className="mr-2" />
                                Send Announcement
                            </button>
                            <button
                                onClick={() => setShowNewForm(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcements List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Sent Announcements</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className="p-6 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <Megaphone className="h-5 w-5 text-indigo-600" />
                                        <h4 className="text-lg font-semibold text-gray-900">{announcement.title}</h4>
                                    </div>
                                    <p className="text-gray-700 mb-3">{announcement.message}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span className="flex items-center">
                                            <Users size={14} className="mr-1" />
                                            {announcement.target}
                                        </span>
                                        <span>•</span>
                                        <span>Sent by {announcement.sentBy}</span>
                                        <span>•</span>
                                        <span>{new Date(announcement.sentAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <Megaphone className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No announcements sent yet.</p>
                            <p className="text-sm">Create your first announcement to notify attendees.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
