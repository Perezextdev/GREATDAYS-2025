import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
    Search,
    Filter,
    Download,
    MoreVertical,
    CheckCircle,
    XCircle,
    Mail,
    Trash2,
    Edit,
    Eye,
    Users,
    MapPin,
    Home
} from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import EditRegistrationModal from '../../components/admin/EditRegistrationModal';
import RegistrationDetailModal from '../../components/admin/RegistrationDetailModal';
import BulkActions from '../../components/admin/BulkActions';
import { useAuth } from '../../context/AuthContext';

export default function RegistrationsPage() {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        mode: 'All',
        status: 'All',
        location: 'All'
    });
    const [selectedRows, setSelectedRows] = useState([]);
    const [editingReg, setEditingReg] = useState(null);
    const [viewingReg, setViewingReg] = useState(null);
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(25);

    // Analytics State
    const [analytics, setAnalytics] = useState({
        total: 0,
        members: 0,
        nonMembers: 0,
        withinZaria: 0,
        outsideZaria: 0
    });

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('registrations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRegistrations(data);
            calculateAnalytics(data);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (data) => {
        const total = data.length;
        const members = data.filter(r => r.church_unit).length; // Assuming church_unit implies membership or check specific field if available
        const nonMembers = total - members;
        const withinZaria = data.filter(r => r.location_type === 'Within Zaria').length;
        const outsideZaria = data.filter(r => r.location_type === 'Outside Zaria').length;

        setAnalytics({ total, members, nonMembers, withinZaria, outsideZaria });
    };

    const handleDelete = async (ids) => {
        if (!window.confirm(`Are you sure you want to delete ${ids.length} registration(s)? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('registrations')
                .delete()
                .in('id', ids);

            if (error) throw error;

            setRegistrations(prev => prev.filter(r => !ids.includes(r.id)));
            setSelectedRows([]);
            calculateAnalytics(registrations.filter(r => !ids.includes(r.id))); // Recalculate locally
            alert('Registration(s) deleted successfully.');
        } catch (error) {
            console.error('Error deleting registrations:', error);
            alert('Failed to delete registrations.');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch =
            reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.phone_number?.includes(searchTerm);

        const matchesMode = filters.mode === 'All' || reg.participation_mode === filters.mode;
        const matchesLocation = filters.location === 'All' ||
            (filters.location === 'Within' ? reg.location_type === 'Within Zaria' : reg.location_type === 'Outside Zaria');

        return matchesSearch && matchesMode && matchesLocation;
    });

    const paginatedData = filteredRegistrations.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

    const handleExport = () => {
        const dataToExport = filteredRegistrations.map(reg => ({
            'Full Name': reg.full_name,
            'Email': reg.email,
            'Phone': reg.phone_number,
            'Mode': reg.participation_mode,
            'Location': reg.location_type,
            'Church Unit': reg.church_unit,
            'Accommodation': reg.accommodation_type,
            'Arrival Date': reg.arrival_date,
            'Registered At': new Date(reg.created_at).toLocaleString()
        }));
        exportToExcel(dataToExport, 'GreatDays_Registrations');
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === paginatedData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedData.map(r => r.id));
        }
    };

    const toggleSelectRow = (id) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    const bulkActions = [
        {
            label: 'Export Selected',
            icon: <Download size={18} />,
            onClick: () => {
                const selectedData = registrations.filter(r => selectedRows.includes(r.id));
                const dataToExport = selectedData.map(reg => ({
                    'Full Name': reg.full_name,
                    'Email': reg.email,
                    'Phone': reg.phone_number,
                    'Mode': reg.participation_mode,
                    'Location': reg.location_type,
                    'Church Unit': reg.church_unit,
                    'Accommodation': reg.accommodation_type,
                    'Arrival Date': reg.arrival_date,
                    'Registered At': new Date(reg.created_at).toLocaleString()
                }));
                exportToExcel(dataToExport, 'GreatDays_Selected_Registrations');
                setSelectedRows([]);
            }
        },
        {
            label: 'Send Email',
            icon: <Mail size={18} />,
            onClick: () => {
                alert(`Sending email to ${selectedRows.length} recipients (Mock Action)`);
                setSelectedRows([]);
            }
        },
        {
            label: 'Delete',
            icon: <Trash2 size={18} />,
            variant: 'danger',
            onClick: () => handleDelete(selectedRows)
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/admin/registrations/new')}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Users size={18} className="mr-2" />
                        New Registration
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download size={18} className="mr-2" />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Registrations</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
                        <p className="text-xs text-gray-400">All time</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <Home size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Member vs Non-Member</p>
                        <div className="flex gap-2 text-sm">
                            <span className="font-semibold text-gray-900">{analytics.members}</span> Members
                            <span className="text-gray-300">|</span>
                            <span className="font-semibold text-gray-900">{analytics.nonMembers}</span> Guests
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Location Breakdown</p>
                        <div className="flex gap-2 text-sm">
                            <span className="font-semibold text-gray-900">{analytics.withinZaria}</span> Zaria
                            <span className="text-gray-300">|</span>
                            <span className="font-semibold text-gray-900">{analytics.outsideZaria}</span> Outside
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.mode}
                        onChange={(e) => handleFilterChange('mode', e.target.value)}
                    >
                        <option value="All">All Modes</option>
                        <option value="Online">Online</option>
                        <option value="Onsite">Onsite</option>
                    </select>

                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                    >
                        <option value="All">All Locations</option>
                        <option value="Within">Within Zaria</option>
                        <option value="Outside">Outside Zaria</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit/Branch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center">
                                        <div className="flex justify-center">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                        No registrations found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={selectedRows.includes(reg.id)}
                                                onChange={() => toggleSelectRow(reg.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    {reg.profile_photo_url ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={reg.profile_photo_url} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                            {reg.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                                                    <div className="text-xs text-gray-500">{reg.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{reg.email}</div>
                                            <div className="text-sm text-gray-500">{reg.phone_number}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.participation_mode === 'Online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {reg.participation_mode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{reg.church_unit || 'N/A'}</div>
                                            <div className="text-xs">{reg.branch || 'Non-member'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Registered
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setViewingReg(reg)}
                                                className="text-indigo-600 hover:text-indigo-900 mx-1"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {hasPermission('edit_delete') && (
                                                <button
                                                    onClick={() => setEditingReg(reg)}
                                                    className="text-blue-600 hover:text-blue-900 mx-1"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            {hasPermission('edit_delete') && (
                                                <button
                                                    onClick={() => handleDelete([reg.id])}
                                                    className="text-red-600 hover:text-red-900 mx-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(page * itemsPerPage, filteredRegistrations.length)}</span> of <span className="font-medium">{filteredRegistrations.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {editingReg && (
                <EditRegistrationModal
                    registration={editingReg}
                    onClose={() => setEditingReg(null)}
                    onUpdate={fetchRegistrations}
                />
            )}

            {viewingReg && (
                <RegistrationDetailModal
                    registration={viewingReg}
                    onClose={() => setViewingReg(null)}
                />
            )}

            <BulkActions
                selectedCount={selectedRows.length}
                onClearSelection={() => setSelectedRows([])}
                actions={bulkActions}
            />
        </div>
    );
}
