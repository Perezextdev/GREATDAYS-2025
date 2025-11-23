import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Star, Search, Filter, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function TestimoniesPage() {
    const [testimonials, setTestimonials] = useState([]);
    const [filteredTestimonials, setFilteredTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        fetchTestimonials();
    }, []);

    useEffect(() => {
        filterTestimonials();
    }, [testimonials, searchTerm, yearFilter]);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('status', 'approved')
                .eq('is_visible', true)
                .order('approved_at', { ascending: false });

            if (error) throw error;
            setTestimonials(data || []);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTestimonials = () => {
        let filtered = testimonials;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.testimonial_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.church_branch?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Year filter
        if (yearFilter !== 'all') {
            filtered = filtered.filter(t => t.year_of_attendance === parseInt(yearFilter));
        }

        setFilteredTestimonials(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const availableYears = [...new Set(testimonials.map(t => t.year_of_attendance))].sort((a, b) => b - a);

    // Pagination
    const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTestimonials = filteredTestimonials.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-slate-950 to-slate-900 py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Testimonies of <span className="text-blue-500">Transformation</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-8">
                            Read inspiring stories from those who have experienced the power of God at GREAT DAYS.
                        </p>
                        <Link
                            to="/submit-testimony"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                        >
                            <MessageSquare size={20} />
                            Share Your Testimony
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search testimonies..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <Filter size={20} className="text-slate-400" />
                        <select
                            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                        >
                            <option value="all">All Years</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-slate-400 text-sm">
                    Showing {filteredTestimonials.length} {filteredTestimonials.length === 1 ? 'testimony' : 'testimonies'}
                </div>
            </div>

            {/* Testimonials Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : paginatedTestimonials.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400 text-lg">No testimonies found matching your criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedTestimonials.map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="relative">
                                            {testimonial.profile_photo_url ? (
                                                <img
                                                    src={testimonial.profile_photo_url}
                                                    alt={testimonial.full_name}
                                                    className="h-12 w-12 rounded-full object-cover border-2 border-blue-500/20"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-500/20">
                                                    {testimonial.full_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold">{testimonial.full_name}</h3>
                                            <p className="text-blue-400 text-sm">{testimonial.role_title || 'Attendee'}</p>
                                            {testimonial.church_branch && (
                                                <p className="text-slate-500 text-xs">{testimonial.church_branch}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(testimonial.star_rating || 5)].map((_, i) => (
                                                <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed italic mb-4">
                                        "{testimonial.testimonial_text}"
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>{testimonial.year_of_attendance}</span>
                                        <span>{new Date(testimonial.approved_at || testimonial.created_at).toLocaleDateString()}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${currentPage === i + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
