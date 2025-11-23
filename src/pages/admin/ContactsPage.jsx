import { useState } from 'react';
import { Phone, Mail, MessageSquare, Clock, Search, Download, Filter } from 'lucide-react';
import { exportToExcel } from '../../utils/excelExport';

export default function ContactsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Mock contact log data - in production this would come from a contacts table
    const contacts = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+234 801 234 5678',
            method: 'Phone',
            subject: 'Registration Inquiry',
            date: '2025-11-22',
            time: '14:30',
            notes: 'Asked about accommodation options'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+234 802 345 6789',
            method: 'Email',
            subject: 'Schedule Question',
            date: '2025-11-22',
            time: '10:15',
            notes: 'Requested event schedule details'
        }
    ];

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch =
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone.includes(searchTerm);

        if (!matchesSearch) return false;
        if (filterType === 'all') return true;
        return contact.method === filterType;
    });

    const handleExport = () => {
        const dataToExport = filteredContacts.map(contact => ({
            'Name': contact.name,
            'Email': contact.email,
            'Phone': contact.phone,
            'Method': contact.method,
            'Subject': contact.subject,
            'Date': contact.date,
            'Time': contact.time,
            'Notes': contact.notes
        }));
        exportToExcel(dataToExport, 'GreatDays_Contacts');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Contact Log</h1>
                <button
                    onClick={handleExport}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Download size={18} className="mr-2" />
                    Export Excel
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">All Methods</option>
                        <option value="Phone">Phone</option>
                        <option value="Email">Email</option>
                        <option value="Chat">Chat</option>
                    </select>
                </div>
            </div>

            {/* Contact Log List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        No contact records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                                <div className="text-sm text-gray-500">{contact.email}</div>
                                                <div className="text-xs text-gray-400">{contact.phone}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contact.method === 'Phone' ? 'bg-blue-100 text-blue-800' :
                                                    contact.method === 'Email' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'
                                                }`}>
                                                {contact.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{contact.subject}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{contact.date}</div>
                                            <div className="text-xs text-gray-500">{contact.time}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 max-w-xs truncate">{contact.notes}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <MessageSquare className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-sm font-medium text-blue-900">Contact Logging</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            This log tracks all contact interactions. In production, this would integrate with your phone system, email, and chat platforms to automatically log all communications.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
