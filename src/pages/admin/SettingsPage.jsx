import { useState } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        eventName: 'GREAT DAYS 2025',
        eventDates: {
            start: '2025-12-15',
            end: '2025-12-21'
        },
        registrationOpen: true,
        maxCapacity: 500,
        accommodationCapacity: 200,
        emailNotifications: true,
        smsNotifications: false,
        autoApproveRegistrations: true,
        requirePayment: false
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
        setSaved(false);
    };

    const handleDateChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            eventDates: {
                ...prev.eventDates,
                [field]: value
            }
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">Manage your event configuration and preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Save size={18} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {saved && (
                <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <p className="text-sm text-green-800">Settings saved successfully!</p>
                </div>
            )}

            {/* Event Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                        <input
                            type="text"
                            value={settings.eventName}
                            onChange={(e) => handleChange('eventName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity</label>
                        <input
                            type="number"
                            value={settings.maxCapacity}
                            onChange={(e) => handleChange('maxCapacity', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={settings.eventDates.start}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={settings.eventDates.end}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Registration Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Settings</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Registration Open</p>
                            <p className="text-xs text-gray-500">Allow new registrations</p>
                        </div>
                        <button
                            onClick={() => handleChange('registrationOpen', !settings.registrationOpen)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.registrationOpen ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.registrationOpen ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Auto-Approve Registrations</p>
                            <p className="text-xs text-gray-500">Automatically approve new registrations</p>
                        </div>
                        <button
                            onClick={() => handleChange('autoApproveRegistrations', !settings.autoApproveRegistrations)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoApproveRegistrations ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoApproveRegistrations ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Require Payment</p>
                            <p className="text-xs text-gray-500">Require payment for registration</p>
                        </div>
                        <button
                            onClick={() => handleChange('requirePayment', !settings.requirePayment)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.requirePayment ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.requirePayment ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Accommodation Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Accommodation Settings</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation Capacity</label>
                    <input
                        type="number"
                        value={settings.accommodationCapacity}
                        onChange={(e) => handleChange('accommodationCapacity', parseInt(e.target.value))}
                        className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total beds available for accommodation</p>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                            <p className="text-xs text-gray-500">Send email notifications to attendees</p>
                        </div>
                        <button
                            onClick={() => handleChange('emailNotifications', !settings.emailNotifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                            <p className="text-xs text-gray-500">Send SMS notifications to attendees</p>
                        </div>
                        <button
                            onClick={() => handleChange('smsNotifications', !settings.smsNotifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.smsNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Warning */}
            <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-yellow-800">Important</p>
                    <p className="text-xs text-yellow-700 mt-1">
                        Changes to these settings will affect all future registrations and system behavior. Make sure to save your changes.
                    </p>
                </div>
            </div>
        </div>
    );
}
