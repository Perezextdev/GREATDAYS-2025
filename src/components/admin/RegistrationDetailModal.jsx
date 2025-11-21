import { X } from 'lucide-react';

export default function RegistrationDetailModal({ registration, onClose }) {
    if (!registration) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-900">Registration Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        {registration.profile_photo_url ? (
                            <img
                                src={registration.profile_photo_url}
                                alt={registration.full_name}
                                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                {registration.full_name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{registration.full_name}</h3>
                            <p className="text-gray-500">{registration.email}</p>
                            <span className={`mt-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${registration.participation_mode === 'Online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                {registration.participation_mode}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem label="Phone" value={registration.phone_number} />
                        <DetailItem label="Title" value={registration.title} />
                        <DetailItem label="Church Unit" value={registration.church_unit} />
                        <DetailItem label="Branch" value={registration.branch || 'Non-member'} />
                        <DetailItem label="Location" value={registration.location_type} />
                        <DetailItem label="Accommodation" value={registration.accommodation_type} />
                        <DetailItem label="Arrival Date" value={registration.arrival_date || 'N/A'} />
                        <DetailItem label="Registered At" value={new Date(registration.created_at).toLocaleString()} />
                    </div>

                    {registration.badge_generated && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-2">Badge Information</h4>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Badge Number</p>
                                    <p className="font-mono font-medium">{registration.badge_number}</p>
                                </div>
                                {registration.badge_url && (
                                    <a
                                        href={registration.badge_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                    >
                                        View Badge
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-base text-gray-900">{value || '-'}</p>
        </div>
    );
}
