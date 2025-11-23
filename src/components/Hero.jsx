import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Play, ChevronLeft, ChevronRight, Download } from 'lucide-react';

// Import gallery images
import gallery1 from '../assets/gallery-1.jpg';
import gallery2 from '../assets/gallery-2.jpg';
import gallery3 from '../assets/gallery-3.jpg';
import gallery4 from '../assets/gallery-4.jpg';
import gallery5 from '../assets/gallery-5.jpg';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { image: gallery1, alt: 'Great Days Event 1' },
        { image: gallery2, alt: 'Great Days Event 2' },
        { image: gallery3, alt: 'Great Days Event 3' },
        { image: gallery4, alt: 'Great Days Event 4' },
        { image: gallery5, alt: 'Great Days Event 5' },
    ];

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Slideshow Background */}
            <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <img
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].alt}
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />
                        {/* Additional dark overlay for better text readability */}
                        <div className="absolute inset-0 bg-black/30" />
                    </motion.div>
                </AnimatePresence>

                {/* Slideshow Controls */}
                <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-2 z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'w-8 bg-white'
                                : 'w-2 bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all group"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all group"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="inline-block mb-6"
                    >
                        <span className="px-6 py-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold backdrop-blur-md shadow-lg">
                            ✨ Registration Now Open
                        </span>
                    </motion.div>

                    {/* Main Title */}
                    <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter leading-tight text-white drop-shadow-2xl mt-8">
                        GREAT{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 relative inline-block">
                            DAYS
                            <motion.svg
                                viewBox="0 0 100 20"
                                className="absolute -bottom-2 left-0 w-full h-[0.15em]"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ delay: 1.2, duration: 1.5 }}
                            >
                                <path
                                    d="M0 10 Q50 18 100 10"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="5"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#60a5fa" />
                                        <stop offset="50%" stopColor="#a78bfa" />
                                        <stop offset="100%" stopColor="#f9a8d4" />
                                    </linearGradient>
                                </defs>
                            </motion.svg>
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl md:text-3xl text-slate-200 mb-10 md:mb-16 max-w-3xl mx-auto leading-relaxed font-light px-4">
                        Experience a week of{' '}
                        <span className="font-semibold text-blue-300">divine encounter</span>,{' '}
                        <span className="font-semibold text-purple-300">transformation</span>, and{' '}
                        <span className="font-semibold text-pink-300">community</span>
                    </p>

                    {/* Event Info */}
                    <div className="flex flex-col gap-4 mb-10 md:mb-16 px-4 max-w-md mx-auto">
                        <div className="flex items-center gap-4 text-white bg-white/10 px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-md shadow-xl w-full justify-start">
                            <div className="p-2 bg-blue-500/20 rounded-full">
                                <Calendar className="w-6 h-6 text-blue-300" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Date</p>
                                <p className="font-medium text-lg">Jan 18th - 25th, 2026</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-white bg-white/10 px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-md shadow-xl w-full justify-start">
                            <div className="p-2 bg-purple-500/20 rounded-full">
                                <MapPin className="w-6 h-6 text-purple-300" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-purple-200 uppercase tracking-wider font-semibold">Location</p>
                                <p className="font-medium text-lg">The Model Church, Zaria</p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-5 px-6 max-w-md mx-auto pb-12">
                        <Link to="/register" className="w-full">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-bold text-xl overflow-hidden shadow-2xl"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    Register Now{' '}
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                </span>
                            </motion.button>
                        </Link>

                        <a
                            href="/flyer.jpg"
                            download="GreatDays2026_Flyer.jpg"
                            className="w-full"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full px-8 py-4 bg-white/5 border border-white/20 text-white rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-all backdrop-blur-md"
                            >
                                <Download className="w-5 h-5" />
                                Download Flyer
                            </motion.button>
                        </a>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/70"
                >
                    <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center p-1.5">
                        <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
