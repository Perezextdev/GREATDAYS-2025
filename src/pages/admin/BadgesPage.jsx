import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import {
    generateAndSaveBadge,
    regenerateBadge,
    downloadBadge,
    shouldGenerateBadge
} from '../../utils/badgeGenerator';
import { exportBadgeManifest } from '../../utils/excelExport';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
    Search, Filter, Download, RefreshCw, Printer, Eye, X,
    Check, CheckCircle, Clock, Calendar, MapPin, Utensils, ChevronDown
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const BadgesPage = () => {
    const { hasPermission } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        branch: 'all',
        unit: 'all',
        location: 'all',
        mealTicket: 'all',
        printStatus: 'all',
        arrivalDate: null
    });
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .eq('participation_mode', 'Onsite')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRegistrations(data || []);
        } catch (error) {
            console.error('Error fetching badges:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBadges = registrations.filter(badge => {
        // Search filter
        const searchMatch =
            badge.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            badge.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            badge.badge_number?.toLowerCase().includes(searchTerm.toLowerCase());

        // Branch filter
        const branchMatch = filters.branch === 'all' || badge.branch === filters.branch;

        // Unit filter
        const unitMatch = filters.unit === 'all' || badge.church_unit === filters.unit;

        // Location filter
        const locationMatch = filters.location === 'all' || badge.location_type === filters.location;

        // Meal ticket filter
        const mealMatch =
            filters.mealTicket === 'all' ||
            (filters.mealTicket === 'with' && badge.meal_ticket_issued) ||
            (filters.mealTicket === 'without' && !badge.meal_ticket_issued);

        // Print status filter
        const printMatch =
            filters.printStatus === 'all' ||
            badge.print_status === filters.printStatus;

        return searchMatch && branchMatch && unitMatch && locationMatch && mealMatch && printMatch;
    });

    // Calculate stats
    const stats = {
        total: filteredBadges.filter(b => b.badge_generated).length,
        withMeals: filteredBadges.filter(b => b.meal_ticket_issued).length,
        withoutMeals: filteredBadges.filter(b => b.badge_generated && !b.meal_ticket_issued).length,
        pendingPrint: filteredBadges.filter(b => b.print_status === 'pending').length
    };

    // Get unique values for filters
    const uniqueBranches = [...new Set(registrations.map(r => r.branch).filter(Boolean))];
    const uniqueUnits = [...new Set(registrations.map(r => r.church_unit).filter(Boolean))];

    const handleGenerateBadge = async (registration) => {
        try {
            setProcessing(true);
            await generateAndSaveBadge(registration);
            await fetchBadges();
            alert('Badge generated successfully!');
        } catch (error) {
            console.error('Error generating badge:', error);
            alert('Failed to generate badge');
        } finally {
            setProcessing(false);
        }
    };

    const handleRegenerateBadge = async (registration) => {
        try {
            setProcessing(true);
            await regenerateBadge(registration);
            await fetchBadges();
            alert('Badge regenerated successfully!');
        } catch (error) {
            console.error('Error regenerating badge:', error);
            alert('Failed to regenerate badge');
        } finally {
            setProcessing(false);
        }
    };

    const handleDownloadBadge = async (registration) => {
        try {
            await downloadBadge(registration);
        } catch (error) {
            console.error('Error downloading badge:', error);
            alert('Failed to download badge');
        }
    };

    const handleBulkDownload = async (type) => {
        setShowDownloadMenu(false);
        let badgesToDownload = [];

        switch (type) {
            case 'all':
                badgesToDownload = filteredBadges.filter(b => b.badge_generated);
                break;
            case 'selected':
                badgesToDownload = filteredBadges.filter(b => selectedIds.includes(b.id) && b.badge_generated);
                break;
            case 'meals':
                badgesToDownload = filteredBadges.filter(b => b.badge_generated && b.meal_ticket_issued);
                break;
            case 'no-meals':
                badgesToDownload = filteredBadges.filter(b => b.badge_generated && !b.meal_ticket_issued);
                break;
            default:
                return;
        }

        if (badgesToDownload.length === 0) {
            alert('No badges to download');
            return;
        }

        try {
            setProcessing(true);
            const zip = new JSZip();

            for (const badge of badgesToDownload) {
                if (badge.badge_url) {
                    const response = await fetch(badge.badge_url);
                    const blob = await response.blob();
                    zip.file(`${badge.badge_number}.png`, blob);
                }
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `badges_${type}_${format(new Date(), 'yyyy-MM-dd')}.zip`);

            // Also export manifest
            exportBadgeManifest(badgesToDownload);
        } catch (error) {
            console.error('Error creating ZIP:', error);
            alert('Failed to create download package');
        } finally {
            setProcessing(false);
        }
    };

    const togglePrintStatus = async (badge) => {
        try {
            const newStatus = badge.print_status === 'printed' ? 'pending' : 'printed';

            const { error } = await supabase
                .from('registrations')
                .update({ print_status: newStatus })
                .eq('id', badge.id);

            if (error) throw error;
            await fetchBadges();
        } catch (error) {
            console.error('Error updating print status:', error);
            alert('Failed to update print status');
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredBadges.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredBadges.map(b => b.id));
        }
    };

    const openPreview = (badge) => {
        setPreviewData(badge);
        setShowPreview(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading badges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Badge Management</h1>
                    <p className="text-slate-600">Manage, download, and track event badges</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Badges" value={stats.total} icon={CheckCircle} color="blue" />
                    <StatCard title="With Meal Tickets" value={stats.withMeals} icon={Utensils} color="green" />
                    <StatCard title="Without Meals" value={stats.withoutMeals} icon={MapPin} color="slate" />
                    <StatCard title="Pending Print" value={stats.pendingPrint} icon={Printer} color="orange" />
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or badge number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Branch Filter */}
                        <select
                            value={filters.branch}
                            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Branches</option>
                            {uniqueBranches.map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                            ))}
                        </select>

                        {/* Unit Filter */}
                        <select
                            value={filters.unit}
                            onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Units</option>
                            {uniqueUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>

                        {/* Location Filter */}
                        <select
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Locations</option>
                            <option value="Within Zaria">Within Zaria</option>
                            <option value="Outside Zaria">Outside Zaria</option>
                        </select>

                        {/* Meal Ticket Filter */}
                        <select
                            value={filters.mealTicket}
                            onChange={(e) => setFilters({ ...filters, mealTicket: e.target.value })}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Meal Status</option>
                            <option value="with">With Meals</option>
                            <option value="without">Without Meals</option>
                        </select>

                        {/* Print Status Filter */}
                        <select
                            value={filters.printStatus}
                            onChange={(e) => setFilters({ ...filters, printStatus: e.target.value })}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Print Status</option>
                            <option value="pending">Pending</option>
                            <option value="printed">Printed</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleSelectAll}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {selectedIds.length === filteredBadges.length ? 'Deselect All' : 'Select All'}
                            </button>
                            {selectedIds.length > 0 && (
                                <span className="text-sm text-slate-600">
                                    {selectedIds.length} selected
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2 relative">
                            <button
                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                Download Badges
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {/* Download Menu */}
                            <AnimatePresence>
                                {showDownloadMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10"
                                    >
                                        <button onClick={() => handleBulkDownload('all')} className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm">
                                            Download All Badges
                                        </button>
                                        <button onClick={() => handleBulkDownload('selected')} className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm" disabled={selectedIds.length === 0}>
                                            Download Selected ({selectedIds.length})
                                        </button>
                                        <button onClick={() => handleBulkDownload('meals')} className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm">
                                            Download Meal Ticket Only
                                        </button>
                                        <button onClick={() => handleBulkDownload('no-meals')} className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm">
                                            Download No Meal Ticket
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredBadges.length && filteredBadges.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Preview</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Badge #</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Unit</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Branch</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Location</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Meals</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Arrival</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Print Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredBadges.map((badge) => (
                                    <tr key={badge.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(badge.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds([...selectedIds, badge.id]);
                                                    } else {
                                                        setSelectedIds(selectedIds.filter(id => id !== badge.id));
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {badge.badge_url && (
                                                <img
                                                    src={badge.badge_url}
                                                    alt="Badge preview"
                                                    className="w-16 h-12 object-cover rounded border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                                                    onClick={() => openPreview(badge)}
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                            {badge.badge_number || 'Not generated'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-900">{badge.full_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{badge.church_unit}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{badge.branch || 'N/A'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${badge.location_type === 'Outside Zaria'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {badge.location_type === 'Outside Zaria' ? 'Outside' : 'Within'} Zaria
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {badge.meal_ticket_issued ? (
                                                <Check className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <X className="w-5 h-5 text-slate-400" />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {badge.arrival_date ? format(parseISO(badge.arrival_date), 'MMM dd') : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {hasPermission('manage_badges') ? (
                                                <button
                                                    onClick={() => togglePrintStatus(badge)}
                                                    className={`px-3 py-1 text-xs rounded-full font-medium ${badge.print_status === 'printed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                        }`}
                                                >
                                                    {badge.print_status === 'printed' ? 'Printed' : 'Pending'}
                                                </button>
                                            ) : (
                                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${badge.print_status === 'printed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {badge.print_status === 'printed' ? 'Printed' : 'Pending'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {badge.badge_generated ? (
                                                    <>
                                                        <button
                                                            onClick={() => openPreview(badge)}
                                                            className="p-2 text-slate-600 hover:text-blue-600 transition-colors"
                                                            title="Preview"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadBadge(badge)}
                                                            className="p-2 text-slate-600 hover:text-green-600 transition-colors"
                                                            title="Download"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        {hasPermission('manage_badges') && (
                                                            <button
                                                                onClick={() => handleRegenerateBadge(badge)}
                                                                className="p-2 text-slate-600 hover:text-orange-600 transition-colors"
                                                                title="Regenerate"
                                                                disabled={processing}
                                                            >
                                                                <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    hasPermission('manage_badges') && (
                                                        <button
                                                            onClick={() => handleGenerateBadge(badge)}
                                                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                                            disabled={processing}
                                                        >
                                                            Generate
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredBadges.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No badges found matching your filters
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreview && previewData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-slate-900">Badge Preview</h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {previewData.badge_url && (
                                <img
                                    src={previewData.badge_url}
                                    alt="Badge"
                                    className="w-full rounded-lg border border-slate-200 mb-4"
                                />
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-slate-600">Full Name</p>
                                    <p className="font-medium">{previewData.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Badge Number</p>
                                    <p className="font-medium">{previewData.badge_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Email</p>
                                    <p className="font-medium">{previewData.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Meal Ticket</p>
                                    <p className="font-medium">{previewData.meal_ticket_issued ? 'Yes' : 'No'}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDownloadBadge(previewData)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Download className="w-5 h-5" />
                                    Download
                                </button>
                                <button
                                    onClick={() => {
                                        window.print();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                                >
                                    <Printer className="w-5 h-5" />
                                    Print
                                </button>
                                {hasPermission('manage_badges') && (
                                    <button
                                        onClick={() => handleRegenerateBadge(previewData)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                        disabled={processing}
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        Regenerate
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Component
const StatCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        slate: 'bg-slate-50 text-slate-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
            <p className="text-sm text-slate-600">{title}</p>
        </div>
    );
};

export default BadgesPage;
