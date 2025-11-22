import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Heart, Globe, BookOpen, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const AboutPage = () => {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const branches = [
        { city: "Zaria (HQ)", location: "Graceland Close, Yan-karfe", contact: "The Model Church" },
        { city: "Kaduna", location: "Danbira Street, Narayi", contact: "08037281683" },
        { city: "Abuja", location: "FCT", contact: "Active Branch" },
        { city: "Lagos", location: "Lagos State", contact: "Raising Pleasing People" },
        { city: "Kano", location: "Kano State", contact: "Teaching Life & Faith" },
        { city: "Jalingo", location: "Taraba State", contact: "Anniversary Events" },
        { city: "Wukari", location: "Taraba State", contact: "Film Production Hub" },
        { city: "Zing", location: "Taraba State", contact: "Taraba Network" },
        { city: "Enugu", location: "Enugu State", contact: "National Branch" },
        { city: "Gombe", location: "Gombe State", contact: "Weekly Questions" },
        { city: "Yola", location: "Opp. LCCN Cathedral Fence", contact: "08062826128" },
        { city: "Yobe", location: "Yobe State", contact: "Expansion Phase" },
        { city: "United Kingdom", location: "International", contact: "Fellowship Center" },
    ];

    const leadership = [
        { name: "Rev. Joshua Tende", role: "Senior Pastor & Founder", description: "Founded FDIM in 2012 following a divine mandate to raise a people pleasing to the Father." },
        { name: "Rev. Mojisola Tende", role: "Co-Founder", description: "Partners in ministry, enhancing relational dynamics and family-oriented leadership." },
        { name: "Rev. John Nongo", role: "Pastor", description: "Key leadership team member." },
        { name: "Pastor Segun Alemede", role: "Pastor", description: "Dedicated to spiritual growth and evangelism." },
        { name: "Pastor Paninga Legson", role: "Pastor", description: "Serving in the ministry's expansion." },
        { name: "Pastor Ephraim Akase Iorhen", role: "Pastor", description: "Focusing on teaching and discipleship." },
        { name: "Pastor Sarah Tende", role: "Pastor", description: "Leading with grace and wisdom." },
        { name: "Rev. Dr. Joshua K. Tende", role: "Pastor", description: "Bringing depth to theological teachings." },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white pt-20">
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-full -top-20 -right-20 w-96 h-96"></div>
                <div className="absolute inset-0 bg-purple-600/10 blur-3xl rounded-full top-40 -left-20 w-72 h-72"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div {...fadeInUp}>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                            Raising a People <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                Pleasing to the Father
                            </span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                            Father's Delight International Ministries (FDIM) is a dynamic Christian organization focused on spiritual growth, evangelism, and community outreach.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* History & Vision */}
            <section className="py-16 px-4 bg-slate-800/30">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-400" />
                            Our History & Vision
                        </h2>
                        <div className="space-y-4 text-slate-300 leading-relaxed">
                            <p>
                                Founded on <strong>January 25, 2012</strong>, by Rev. Joshua and Rev. Mojisola Tende, FDIM was born out of a series of profound spiritual encounters. Rev. Joshua's journey began with his conversion in 1988, leading to a lifelong commitment to ministry.
                            </p>
                            <p>
                                From humble beginnings at the Zazzau Royal Chalet to our current 1,000-capacity headquarters at <strong>The Model Church, Graceland Close, Yan-karfe, Zaria</strong>, our growth is a testament to God's faithfulness.
                            </p>
                            <p>
                                <strong>Our Mandate:</strong> To guide believers toward living in alignment with God's will, encompassing evangelism, healing, and spiritual maturity. We are committed to transformative experiences that address spiritual, emotional, and physical needs.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-8 rounded-2xl border border-white/10"
                    >
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                                <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">2012</div>
                                <div className="text-sm text-slate-400">Established</div>
                            </div>
                            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                                <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">12+</div>
                                <div className="text-sm text-slate-400">Branches</div>
                            </div>
                            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                                <MapPin className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">HQ</div>
                                <div className="text-sm text-slate-400">Zaria, Nigeria</div>
                            </div>
                            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
                                <Globe className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-white">Global</div>
                                <div className="text-sm text-slate-400">Outreach</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Leadership */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold mb-4">Our Leadership</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Guided by a team of dedicated pastors committed to the vision of raising a people pleasing to the Father.
                        </p>
                    </motion.div>

                    {/* Featured Pastor Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="mb-20 bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-8 md:p-12 rounded-3xl border border-white/10 backdrop-blur-sm"
                    >
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <motion.img
                                    src="/pastor.png"
                                    alt="Rev. Joshua & Mojisola Tende"
                                    className="relative rounded-2xl shadow-2xl w-full h-auto object-cover border-2 border-white/10 group-hover:border-blue-500/50 transition-all duration-500"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <div className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-6">
                                    <span className="text-blue-400 text-sm font-semibold">Senior Pastors & Founders</span>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    Rev. Joshua & Mojisola Tende
                                </h3>
                                <div className="space-y-4 text-slate-300 leading-relaxed">
                                    <p>
                                        <strong className="text-white">Rev. Joshua Tende</strong> founded FDIM in 2012 following a divine mandate to raise a people pleasing to the Father. His ministry journey began with his conversion in 1988, and he has been committed to transformative spiritual leadership ever since.
                                    </p>
                                    <p>
                                        <strong className="text-white">Rev. Mojisola Tende</strong> serves alongside as co-founder, bringing invaluable partnership in ministry with a focus on enhancing relational dynamics and family-oriented leadership.
                                    </p>
                                    <p className="text-blue-300 italic">
                                        "Together, they lead with vision, faith, and dedication to seeing believers live in alignment with God's will."
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Leadership Team Grid */}

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {leadership.map((leader, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors group"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 text-xl font-bold text-white group-hover:scale-110 transition-transform">
                                    {leader.name.charAt(0)}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{leader.name}</h3>
                                <div className="text-blue-400 text-sm font-medium mb-3">{leader.role}</div>
                                <p className="text-slate-400 text-sm leading-relaxed">{leader.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Branches */}
            <section className="py-20 px-4 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold mb-4">Our Branches</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Spreading the gospel across Nigeria and beyond. Find a branch near you.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {branches.map((branch, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-slate-900 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                            >
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-blue-500 mt-1 shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{branch.city}</h3>
                                        <p className="text-slate-300 text-sm mb-2">{branch.location}</p>
                                        <p className="text-slate-500 text-xs">{branch.contact}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Socials & Contact */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-12 rounded-3xl border border-white/10"
                    >
                        <h2 className="text-3xl font-bold mb-6">Connect With Us</h2>
                        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                            Stay updated with our latest teachings, events, and live services. Follow us on social media.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6">
                            <a href="https://www.facebook.com/FDIMZARIA/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white px-6 py-3 rounded-full transition-transform hover:-translate-y-1">
                                <Facebook className="w-5 h-5" /> Facebook
                            </a>
                            <a href="https://www.instagram.com/fdimzaria/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white px-6 py-3 rounded-full transition-transform hover:-translate-y-1">
                                <Instagram className="w-5 h-5" /> Instagram
                            </a>
                            <a href="https://x.com/fdimzaria" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black hover:bg-black/80 text-white px-6 py-3 rounded-full border border-white/20 transition-transform hover:-translate-y-1">
                                <Twitter className="w-5 h-5" /> X (Twitter)
                            </a>
                            <a href="https://www.youtube.com/@fdimjal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#FF0000] hover:bg-[#FF0000]/90 text-white px-6 py-3 rounded-full transition-transform hover:-translate-y-1">
                                <Youtube className="w-5 h-5" /> YouTube
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
