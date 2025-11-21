import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SupportPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium'
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: insertError } = await supabase
                .from('support_requests')
                .insert([{
                    ...formData,
                    status: 'open'
                }]);

            if (insertError) throw insertError;
            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting support request:', err);
            setError('Failed to submit request. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100"
                    >
                        <CheckCircle className="h-12 w-12 text-green-600" />
                    </motion.div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Request Received</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We've received your message and will get back to you as soon as possible.
                    </p>
                    <div className="mt-6">
                        <a href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Return to Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Support Center</h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Need help with your registration or have questions about the event? We're here to assist.
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject *</label>
                            <input
                                type="text"
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="low">Low - General Inquiry</option>
                                <option value="medium">Medium - Registration Issue</option>
                                <option value="high">High - Urgent / Payment Issue</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Message *</label>
                            <div className="mt-1">
                                <textarea
                                    name="message"
                                    rows={4}
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="How can we help you?"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
                        <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-full">
                            <Mail className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Email Us</h3>
                            <p className="text-gray-500">support@greatdays.com</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
                        <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                            <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Live Chat</h3>
                            <p className="text-gray-500">Available 9am - 5pm</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
