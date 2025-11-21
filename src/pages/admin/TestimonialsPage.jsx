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

export default function TestimonialsPage() {
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
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
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
