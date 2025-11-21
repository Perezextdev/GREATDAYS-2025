import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Worship Leader",
        church: "Grace Community Church",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        content: "Great Days 2024 was absolutely transformative. The worship atmosphere was unlike anything I've experienced before."
    },
    {
        name: "David Chen",
        role: "Youth Pastor",
        church: "City Light Chapel",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        content: "My entire youth group was blessed. The teaching was practical and the fellowship was encouraging."
    },
    {
        name: "Emily Davis",
        role: "Volunteer",
        church: "Hope Valley",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
        content: "Volunteering at Great Days gave me a new perspective on service. Can't wait for 2025!"
    },
    {
        name: "Michael Wilson",
        role: "Attendee",
        church: "New Life Center",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        content: "The best week of my year. I left feeling refreshed, challenged, and ready to serve my community."
    }
];

const Testimonials = () => {
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
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Hear from those whose lives have been impacted by the power of God in our meetings.
                    </p>
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
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                                            <Quote className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{testimonial.name}</h4>
                                        <p className="text-blue-400 text-sm">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-slate-300 leading-relaxed italic">
                                    "{testimonial.content}"
                                </p>
                                <div className="mt-6 flex gap-1">
                                    {[...Array(5)].map((_, i) => (
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
