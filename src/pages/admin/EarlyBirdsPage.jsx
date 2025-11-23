import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Award, Download, MapPin, Navigation } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function EarlyBirdsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [withinZariaEarlyBirds, setWithinZariaEarlyBirds] = useState([]);
    const [outsideZariaEarlyBirds, setOutsideZariaEarlyBirds] = useState([]);

    useEffect(() => {
        if (token) {
            fetchEarlyBirds();
        }
    }, [token]);

    const fetchEarlyBirds = async () => {
        try {
            setLoading(true);

            // Fetch first 50 Within Zaria registrants ordered by created_at
            const withinRes = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?location_type=eq.Within&order=created_at.asc&limit=50`,
                {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Fetch first 50 Outside Zaria registrants ordered by created_at
            const outsideRes = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?location_type=eq.Outside&order=created_at.asc&limit=50`,
                {
                    headers: {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (withinRes.ok && outsideRes.ok) {
                const withinData = await withinRes.json();
                const outsideData = await outsideRes.json();
                setWithinZariaEarlyBirds(withinData);
                setOutsideZariaEarlyBirds(outsideData);
            }
        } catch (error) {
            console.error('Error fetching early birds:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (type) => {
        const data = type === 'within' ? withinZariaEarlyBirds : outsideZariaEarlyBirds;
        const exportData = data.map((reg, index) => ({
            'Position': index + 1,
            'Full Name': reg.full_name,
            'Email': reg.email,
            'Phone': reg.phone_number,
            'Participation Mode': reg.participation_mode,
            'Branch': reg.branch || 'Non-member',
            'Registered At': new Date(reg.created_at).toLocaleString()
        }));
        exportToExcel(exportData, `EarlyBirds_${type === 'within' ? 'WithinZaria' : 'OutsideZaria'}_Top50`);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Early Bird Registrants</h1>
                    <p className="text-sm text-gray-500 mt-1">First 50 registrants from each location - eligible for rewards</p>
                </div>
                <SkeletonLoader />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonLoader variant="table" />
                    <SkeletonLoader variant="table" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={28} />
                        Early Bird Registrants
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">First 50 registrants from each location - eligible for rewards</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Within Zaria Early Birds</p>
                            <p className="text-4xl font-bold mt-2">{withinZariaEarlyBirds.length}/50</p>
                            <p className="text-blue-100 text-xs mt-1">
                                {50 - withinZariaEarlyBirds.length} spots remaining
                            </p>
                        </div>
                        <MapPin size={48} className="text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Outside Zaria Early Birds</p>
                            <p className="text-4xl font-bold mt-2">{outsideZariaEarlyBirds.length}/50</p>
                            <p className="text-purple-100 text-xs mt-1">
                                {50 - outsideZariaEarlyBirds.length} spots remaining
                            </p>
                        </div>
                        <Navigation size={48} className="text-purple-200" />
                    </div>
                </div>
            </div>

            {/* Early Birds Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Within Zaria Early Birds */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-blue-50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin className="text-blue-600" size={20} />
                            Within Zaria Early Birds
                        </h2>
                        <button
                            onClick={() => handleExport('within')}
                            className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download size={16} className="mr-1.5" />
                            Export
                        </button>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {withinZariaEarlyBirds.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            No early birds from within Zaria yet
                                        </td>
                                    </tr>
                                ) : (
                                    withinZariaEarlyBirds.map((reg, index) => (
                                        <tr key={reg.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {index < 3 && <Award className="text-yellow-500" size={16} />}
                                                    <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                                                <div className="text-xs text-gray-500">{reg.branch || 'Non-member'}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {reg.email}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.participation_mode === 'Online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {reg.participation_mode}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-xs text-gray-900">
                                                    {new Date(reg.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(reg.created_at).toLocaleTimeString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Outside Zaria Early Birds */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-purple-50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Navigation className="text-purple-600" size={20} />
                            Outside Zaria Early Birds
                        </h2>
                        <button
                            onClick={() => handleExport('outside')}
                            className="flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Download size={16} className="mr-1.5" />
                            Export
                        </button>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {outsideZariaEarlyBirds.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            No early birds from outside Zaria yet
                                        </td>
                                    </tr>
                                ) : (
                                    outsideZariaEarlyBirds.map((reg, index) => (
                                        <tr key={reg.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {index < 3 && <Award className="text-yellow-500" size={16} />}
                                                    <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{reg.full_name}</div>
                                                <div className="text-xs text-gray-500">{reg.branch || 'Non-member'}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {reg.email}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.participation_mode === 'Online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {reg.participation_mode}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-xs text-gray-900">
                                                    {new Date(reg.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(reg.created_at).toLocaleTimeString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Trophy className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">Early Bird Rewards</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            The first 50 registrants from <strong>Within Zaria</strong> and first 50 from <strong>Outside Zaria</strong> are eligible for special early bird rewards.
                            Registrations are tracked by timestamp (created_at). The top 3 in each category receive gold awards.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
