import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxSection = ({ children, bgImage, className = "" }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section
            ref={ref}
            className={`relative min-h-[80vh] flex items-center justify-center overflow-hidden ${className}`}
        >
            {bgImage && (
                <motion.div
                    style={{ y }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={bgImage}
                        alt="Background"
                        className="w-full h-[120%] object-cover -mt-[10%]"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </motion.div>
            )}

            <motion.div
                style={{ opacity }}
                className="relative z-10 container mx-auto px-6"
            >
                {children}
            </motion.div>
        </section>
    );
};

export default ParallaxSection;
