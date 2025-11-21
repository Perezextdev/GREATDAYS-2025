import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-950 py-12 border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
                            GREAT DAYS
                        </div>
                        <p className="text-slate-400 mb-4 max-w-sm">
                            Raising a people pleasing to the Father through faith-based teachings and community outreach.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-4">Contact Us</h3>
                        <div className="text-slate-400 space-y-2 text-sm">
                            <p>The Model Church, Graceland Close,</p>
                            <p>Yan-karfe, Zaria, Kaduna State.</p>
                            <p className="pt-2 text-white">08037281683 (Kaduna)</p>
                            <p className="text-white">08062826128 (Yola)</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-4">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/FDIMZARIA/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors">
                                <Facebook className="w-6 h-6" />
                            </a>
                            <a href="https://x.com/fdimzaria" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <Twitter className="w-6 h-6" />
                            </a>
                            <a href="https://www.instagram.com/fdimzaria/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors">
                                <Instagram className="w-6 h-6" />
                            </a>
                            <a href="https://www.youtube.com/@fdimjal" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors">
                                <Youtube className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-slate-500 text-sm">
                    © 2025 Father's Delight International Ministries. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
