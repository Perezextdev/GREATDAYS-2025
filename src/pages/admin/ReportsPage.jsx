import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, Filter, Calendar, Users, Hotel, Utensils, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import {
    exportCompleteAccommodationList,
    exportDailyArrivalsReport,
    exportMealPlanReport,
    exportCompleteRegistrationList,
    exportContactList
} from '../../utils/excelExport';

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('registration');
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRegistrations(data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'registration', label: 'Registration', icon: Users },
        { id: 'accommodation', label: 'Accommodation', icon: Hotel },
        { id: 'meals', label: 'Meal Planning', icon: Utensils },
        { id: 'contacts', label: 'Contact Lists', icon: FileSpreadsheet },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'registration':
                return (
                    <div className="space-y-6">
                        <ReportCard
                            title="Complete Registration Export"
                            description="Download all registration data including online, onsite, and member details."
                            icon={Users}
                            onDownload={() => exportCompleteRegistrationList(registrations)}
                        />
                    </div>
                );
            case 'accommodation':
                return (
                    <div className="space-y-6">
                        <ReportCard
                            title="Master Accommodation List"
                            description="Complete list of all attendees requiring accommodation, separated by type."
                            icon={Hotel}
                            onDownload={() => exportCompleteAccommodationList(registrations)}
                        />
                        <ReportCard
                            title="Daily Arrivals Report"
                            description="Breakdown of expected arrivals by date for logistics planning."
                            icon={Calendar}
                            onDownload={() => exportDailyArrivalsReport(registrations)}
                        />
                    </div>
                );
            case 'meals':
                return (
                    <div className="space-y-6">
                        <ReportCard
                            title="Catering Meal Plan"
                            description="Estimated meal requirements based on attendance and dietary needs."
                            icon={Utensils}
                            onDownload={() => exportMealPlanReport(registrations)}
                        />
                    </div>
                );
            case 'contacts':
                return (
                    <div className="space-y-6">
                        <ReportCard
                            title="Complete Contact Directory"
                            description="Full list of attendee contact information."
                            icon={FileSpreadsheet}
                            onDownload={() => exportContactList(registrations, 'complete')}
                        />
                        <ReportCard
                            title="VIP & Leadership List"
                            description="Contact details for Reverends, Pastors, and Bishops."
                            icon={Users}
                            onDownload={() => exportContactList(registrations, 'vip')}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Reports & Exports</h1>
                    <p className="text-slate-600">Generate comprehensive reports and export data for planning.</p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors relative ${activeTab === tab.id
                                ? 'text-blue-600 bg-white border-x border-t border-slate-200 font-medium'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-white" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        renderContent()
                    )}
                </motion.div>
            </div>
        </div>
    );
};

const ReportCard = ({ title, description, icon: Icon, onDownload }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
        <div className="flex gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg h-fit">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
                <p className="text-slate-600 text-sm max-w-md">{description}</p>
            </div>
        </div>
        <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
            <Download className="w-4 h-4" />
            Download Excel
        </button>
    </div>
);

export default ReportsPage;
