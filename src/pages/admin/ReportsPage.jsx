import { useState } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { generateComprehensiveReport, exportToExcel } from '../../utils/excelExport';
import { FileSpreadsheet, Download, Loader, FileText, Users, Home, Utensils } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
    const { metrics, loading: dataLoading } = useDashboardData();
    const [generating, setGenerating] = useState(false);

    const handleFullExport = async () => {
        setGenerating(true);
        try {
            // Simulate a small delay for UX or fetch fresh data if needed
            await new Promise(resolve => setTimeout(resolve, 1000));
            generateComprehensiveReport(metrics.registrations);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSingleExport = (type) => {
        const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
        let data = [];
        let fileName = '';

        switch (type) {
            case 'accommodation':
                data = metrics.registrations
                    .filter(r => r.needs_accommodation)
                    .map(r => ({
                        'Name': r.full_name,
                        'Gender': r.gender,
                        'Type': r.accommodation_type,
                        'Arrival': r.arrival_date,
                        'Departure': r.departure_date,
                        'Phone': r.phone
                    }));
                fileName = `Accommodation_List_${timestamp}`;
                break;
            case 'meals':
                data = metrics.registrations
                    .filter(r => r.location_type === 'Outside Zaria' && r.participation_mode === 'Onsite')
                    .map(r => ({
                        'Name': r.full_name,
                        'Dietary': r.dietary_requirements || 'None',
                        'Arrival': r.arrival_date,
                        'Departure': r.departure_date
                    }));
                fileName = `Meal_Plan_${timestamp}`;
                break;
            case 'contacts':
                data = metrics.registrations.map(r => ({
                    'Name': r.full_name,
                    'Email': r.email,
                    'Phone': r.phone,
                    'Branch': r.church_branch
                }));
                fileName = `Contact_List_${timestamp}`;
                break;
            default:
                return;
        }

        exportToExcel(data, fileName, type.charAt(0).toUpperCase() + type.slice(1));
    };

    if (dataLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Exports</h1>
                <p className="text-gray-500">Generate and download detailed reports for the event.</p>
            </div>

            {/* Main Export Card */}
            <div className="bg-indigo-50 rounded-xl p-8 border border-indigo-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                            <FileSpreadsheet size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-indigo-900">Comprehensive Event Report</h3>
                            <p className="text-indigo-700 mt-1 max-w-xl">
                                This is the master report containing all data sheets: All Registrations, Accommodation List, Meal Planning, Daily Arrivals, and Contact List.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleFullExport}
                        disabled={generating}
                        className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    >
                        {generating ? (
                            <>
                                <Loader size={20} className="animate-spin mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download size={20} className="mr-2" />
                                Download Master Report
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Accommodation Report */}
                <ReportCard
                    title="Accommodation List"
                    description="List of all attendees requiring accommodation with arrival dates."
                    icon={Home}
                    color="green"
                    onClick={() => handleSingleExport('accommodation')}
                />

                {/* Meal Planning */}
                <ReportCard
                    title="Meal Planning"
                    description="Dietary requirements and counts for outside Zaria attendees."
                    icon={Utensils}
                    color="orange"
                    onClick={() => handleSingleExport('meals')}
                />

                {/* Contact List */}
                <ReportCard
                    title="Contact List"
                    description="Names, emails, and phone numbers for all registered attendees."
                    icon={Users}
                    color="blue"
                    onClick={() => handleSingleExport('contacts')}
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Definitions</h3>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-48 flex-shrink-0 font-medium text-gray-700">All Registrations</div>
                        <div className="text-gray-600">Complete raw data of every single registration form submission.</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-48 flex-shrink-0 font-medium text-gray-700">Accommodation</div>
                        <div className="text-gray-600">Filtered list of only those who selected "Yes" for accommodation, grouped by type (General/Hotel).</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-48 flex-shrink-0 font-medium text-gray-700">Meal Planning</div>
                        <div className="text-gray-600">Attendees from "Outside Zaria" who are attending "Onsite". Used for catering estimates.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReportCard({ title, description, icon: Icon, color, onClick }) {
    const colors = {
        green: "bg-green-50 text-green-600 hover:bg-green-100",
        orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
        blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    };

    return (
        <button
            onClick={onClick}
            className="flex flex-col items-start p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all text-left w-full group"
        >
            <div className={`p-3 rounded-lg mb-4 ${colors[color]} transition-colors`}>
                <Icon size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
            <p className="text-sm text-gray-500 mt-2">{description}</p>
            <div className="mt-4 flex items-center text-sm font-medium text-gray-400 group-hover:text-indigo-600">
                <Download size={16} className="mr-2" />
                Download CSV
            </div>
        </button>
    );
}
