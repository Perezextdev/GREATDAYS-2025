import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('status', 'approved')
                .eq('is_visible', true)
                .order('approved_at', { ascending: false })
                .limit(8);

            if (error) throw error;
            setTestimonials(data || []);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            // Fallback to empty array on error
            setTestimonials([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-24 bg-slate-950">
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
            </section>
        );
    }

    if (testimonials.length === 0) {
        return null; // Don't show section if no testimonials
    }

    return (
        <section className="py-24 bg-slate-950 overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

            <div className="container mx-auto px-6 relative z-10 mb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Voices of <span className="text-blue-500">Transformation</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-8">
                        Hear from those whose lives have been impacted by the power of God in our meetings.
                    </p>
                    <Link
                        to="/testimonies"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                        View All Testimonies
                        <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </div>

            <div className="relative w-full group z-10">
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />

                <div className="flex overflow-hidden">
                    <motion.div
                        className="flex gap-6 px-6"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 40,
                            repeatType: "loop"
                        }}
                    >
                        {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                            <div
                                key={index}
                                className="w-[350px] md:w-[450px] flex-shrink-0 bg-slate-900/50 border border-white/5 p-8 rounded-3xl backdrop-blur-sm hover:bg-slate-900 transition-colors duration-300"
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/20">
                                            {testimonial.profile_photo_url ? (
                                                <img
                                                    src={testimonial.profile_photo_url}
                                                    alt={testimonial.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                                    {testimonial.full_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                                            <Quote className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{testimonial.full_name}</h4>
                                        <p className="text-blue-400 text-sm">{testimonial.role_title || 'Attendee'}</p>
                                        {testimonial.church_branch && (
                                            <p className="text-slate-500 text-xs">{testimonial.church_branch}</p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-300 leading-relaxed italic">
                                    "{testimonial.testimonial_text}"
                                </p>
                                <div className="mt-6 flex gap-1">
                                    {[...Array(testimonial.star_rating || 5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
