import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowRight, Sparkles } from 'lucide-react';

const CTA = () => {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            </div>

            {/* Floating Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
            />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, delay: 4 }}
                className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
            />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-blue-200 mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Limited Seats Available</span>
                    </motion.div>

                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
                        Ready for Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Breakthrough?</span>
                    </h2>

                    <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                        Join us for a week that will define your year. Experience the power of community and faith like never before.
                    </p>

                    <Link to="/register" className="inline-block">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative inline-flex items-center justify-center gap-3 bg-white text-blue-900 text-xl font-bold py-5 px-12 rounded-full hover:bg-blue-50 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] mb-16 overflow-hidden"
                        >
                            <span className="relative z-10">Register Now</span>
                            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                    </Link>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-blue-200/80 border-t border-white/10 pt-12">
                        <a href="mailto:info@greatdays2025.com" className="flex items-center gap-3 hover:text-white transition-colors group">
                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <span>info@greatdays2025.com</span>
                        </a>
                        <div className="hidden md:block w-px h-8 bg-white/10" />
                        <a href="tel:+15551234567" className="flex items-center gap-3 hover:text-white transition-colors group">
                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                <Phone className="w-5 h-5" />
                            </div>
                            <span>+1 (555) 123-4567</span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTA;
