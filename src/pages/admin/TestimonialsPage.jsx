import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
    Check,
    X,
    Trash2,
    Star,
    Eye,
    MoreVertical,
    Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TestimonialsPage() {
    const { hasPermission } = useAuth();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

    useEffect(() => {
        fetchTestimonials();
    }, [filter]);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setTestimonials(data);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({
                    status: newStatus,
                    approved_at: newStatus === 'approved' ? new Date().toISOString() : null
                })
                .eq('id', id);

            if (error) throw error;
            fetchTestimonials(); // Refresh list
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

        try {
            const { error } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTestimonials(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            alert('Failed to delete testimonial');
        }
    };

    const toggleVisibility = async (id, currentVisibility) => {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({ is_visible: !currentVisibility })
                .eq('id', id);

            if (error) throw error;
            setTestimonials(prev => prev.map(t =>
                t.id === id ? { ...t, is_visible: !currentVisibility } : t
            ));
        } catch (error) {
            console.error('Error updating visibility:', error);
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [newTestimonial, setNewTestimonial] = useState({
        full_name: '',
        church_branch: '',
        testimonial_text: '',
        star_rating: 5,
        profile_photo_url: ''
    });

    const handleAddTestimonial = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('testimonials')
                .insert([{
                    ...newTestimonial,
                    status: 'approved',
                    is_visible: true,
                    approved_at: new Date().toISOString()
                }]);

            if (error) throw error;

            setShowAddModal(false);
            setNewTestimonial({
                full_name: '',
                church_branch: '',
                testimonial_text: '',
                star_rating: 5,
                profile_photo_url: ''
            });
            fetchTestimonials();
            alert('Testimonial added successfully!');
        } catch (error) {
            console.error('Error adding testimonial:', error);
            alert('Failed to add testimonial');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
                <div className="flex items-center gap-4">
                    <div className="flex space-x-2">
                        {['pending', 'approved', 'rejected', 'all'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${filter === f
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <span className="mr-2">+</span> Add Testimony
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    </div>
                ) : testimonials.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 text-gray-500">
                        No testimonials found in this category.
                    </div>
                ) : (
                    testimonials.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                        {item.profile_photo_url ? (
                                            <img
                                                src={item.profile_photo_url}
                                                alt={item.full_name}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {item.full_name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{item.full_name}</p>
                                            <p className="text-xs text-gray-500">{item.church_branch || 'No Branch'}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400">
                                        {[...Array(item.star_rating)].map((_, i) => (
                                            <Star key={i} size={14} fill="currentColor" />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 italic">"{item.testimonial_text}"</p>
                                </div>

                                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    <span className={`px-2 py-1 rounded-full font-medium capitalize ${item.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            {hasPermission('manage_testimonials') && (
                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        {item.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(item.id, 'approved')}
                                                    className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
                                                    title="Approve"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                                    className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        )}
                                        {item.status === 'approved' && (
                                            <button
                                                onClick={() => toggleVisibility(item.id, item.is_visible)}
                                                className={`p-1.5 rounded-full ${item.is_visible ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'} hover:bg-blue-200`}
                                                title="Toggle Visibility"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-gray-400 hover:text-red-600"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Add Testimony Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Add Testimony</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddTestimonial} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newTestimonial.full_name}
                                    onChange={e => setNewTestimonial({ ...newTestimonial, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Church Branch (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newTestimonial.church_branch}
                                    onChange={e => setNewTestimonial({ ...newTestimonial, church_branch: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Testimony</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newTestimonial.testimonial_text}
                                    onChange={e => setNewTestimonial({ ...newTestimonial, testimonial_text: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewTestimonial({ ...newTestimonial, star_rating: star })}
                                            className={`text-2xl ${star <= newTestimonial.star_rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    value={newTestimonial.profile_photo_url}
                                    onChange={e => setNewTestimonial({ ...newTestimonial, profile_photo_url: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Add Testimony
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
