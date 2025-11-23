import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, ChevronLeft, ChevronRight, Download } from 'lucide-react';

// Import gallery images
import gallery1 from '../assets/gallery-1.jpg';
import gallery2 from '../assets/gallery-2.jpg';
import gallery3 from '../assets/gallery-3.jpg';
import gallery4 from '../assets/gallery-4.jpg';
import gallery5 from '../assets/gallery-5.jpg';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const containerRef = useRef(null);
    const { scrollY } = useScroll();

    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

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
        <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Slideshow Background */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <img
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].alt}
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/90" />
                        {/* Additional dark overlay for better text readability */}
                        <div className="absolute inset-0 bg-black/40" />
                    </motion.div>
                </AnimatePresence>

                {/* Slideshow Controls */}
                <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-3 z-20 hidden md:flex">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'w-8 bg-white'
                                : 'w-2 bg-white/40 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 backdrop-blur-md p-3 rounded-full transition-all group border border-white/10 hidden md:block"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 text-white/80 group-hover:text-white group-hover:scale-110 transition-transform" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 backdrop-blur-md p-3 rounded-full transition-all group border border-white/10 hidden md:block"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 text-white/80 group-hover:text-white group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* Content */}
            <motion.div
                style={{ y: y1, opacity }}
                className="container mx-auto px-4 sm:px-6 relative z-10 text-center"
            >
                <div className="max-w-5xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white/90 text-sm font-medium tracking-wide uppercase">Registration Open Now</span>
                    </motion.div>

                    {/* Main Title */}
                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight text-white leading-none">
                        GREAT{' '}
                        <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                            DAYS
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 1, duration: 1, ease: "circOut" }}
                                className="absolute -bottom-2 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-50 blur-sm rounded-full origin-left"
                            />
                        </span>
                        <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl mt-2 text-white/20 font-bold tracking-widest">2026</span>
                    </h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        Experience a week of <span className="text-white font-medium">divine encounter</span>, <span className="text-white font-medium">transformation</span>, and <span className="text-white font-medium">community</span> that will change your life forever.
                    </motion.p>

                    {/* Event Info Cards */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12"
                    >
                        <div className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-4 rounded-2xl backdrop-blur-sm transition-all group text-left">
                            <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6 text-blue-300" />
                            </div>
                            <div>
                                <p className="text-xs text-blue-200/70 uppercase tracking-wider font-bold mb-0.5">Date</p>
                                <p className="text-white font-semibold text-lg">Jan 18th - 25th</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-4 rounded-2xl backdrop-blur-sm transition-all group text-left">
                            <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6 text-purple-300" />
                            </div>
                            <div>
                                <p className="text-xs text-purple-200/70 uppercase tracking-wider font-bold mb-0.5">Location</p>
                                <p className="text-white font-semibold text-lg">The Model Church</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/register" className="w-full sm:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all flex items-center justify-center gap-2"
                            >
                                Register Now
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </Link>
                        <a
                            href="/flyer.jpg"
                            download="GreatDays2026_Flyer.jpg"
                            className="w-full sm:w-auto"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                            >
                                <Download className="w-5 h-5" />
                                Download Flyer
                            </motion.button>
                        </a>
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                style={{ opacity }}
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
            >
                <span className="text-xs uppercase tracking-widest">Scroll</span>
                <div className="w-5 h-9 border-2 border-white/30 rounded-full flex justify-center p-1">
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-1 h-2 bg-white/60 rounded-full"
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
