import { Link } from 'react-router-dom';
import {
    Users, UserPlus, Mail, Download, FileText, Calendar,
    Home, Utensils, MessageSquare, Star, CreditCard, Settings,
    BarChart3, Shield, Zap
} from 'lucide-react';

export default function QuickActionsPage() {
    const actions = [
        {
            category: 'Registrations',
            items: [
                { name: 'New Registration', path: '/admin/registrations/new', icon: UserPlus, color: 'blue', description: 'Manually add a new registration' },
                { name: 'View All Registrations', path: '/admin/registrations', icon: Users, color: 'indigo', description: 'Browse all event registrations' },
                { name: 'Export Registrations', path: '/admin/reports', icon: Download, color: 'green', description: 'Download registration data' },
            ]
        },
        {
            category: 'Event Management',
            items: [
                { name: 'Check-In Attendees', path: '/admin/check-in', icon: Calendar, color: 'purple', description: 'Manage event check-ins' },
                { name: 'Accommodation', path: '/admin/accommodation', icon: Home, color: 'orange', description: 'Manage accommodation requests' },
                { name: 'Arrivals Calendar', path: '/admin/arrivals', icon: Calendar, color: 'blue', description: 'View upcoming arrivals' },
                { name: 'Meal Planning', path: '/admin/meals', icon: Utensils, color: 'red', description: 'Manage meal assignments' },
            ]
        },
        {
            category: 'Communication',
            items: [
                { name: 'Send Email', path: '/admin/emails', icon: Mail, color: 'blue', description: 'Send emails to attendees' },
                { name: 'View Support Requests', path: '/admin/support', icon: MessageSquare, color: 'yellow', description: 'Manage support tickets' },
            ]
        },
        {
            category: 'Content',
            items: [
                { name: 'Manage Testimonials', path: '/admin/testimonials', icon: Star, color: 'yellow', description: 'Review and approve testimonials' },
                { name: 'Generate Badges', path: '/admin/badges', icon: CreditCard, color: 'purple', description: 'Create attendee badges' },
            ]
        },
        {
            category: 'Reports & Analytics',
            items: [
                { name: 'View Analytics', path: '/admin/analytics', icon: BarChart3, color: 'green', description: 'View detailed analytics' },
                { name: 'Generate Reports', path: '/admin/reports', icon: FileText, color: 'blue', description: 'Create custom reports' },
            ]
        },
        {
            category: 'System',
            items: [
                { name: 'Settings', path: '/admin/settings', icon: Settings, color: 'gray', description: 'Configure system settings' },
                { name: 'Security', path: '/admin/security', icon: Shield, color: 'red', description: 'Manage security settings' },
                { name: 'Automations', path: '/admin/automations', icon: Zap, color: 'yellow', description: 'Set up automations' },
            ]
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quick Actions</h1>
                <p className="text-gray-500">Frequently used actions for efficient event management</p>
            </div>

            {actions.map((category, idx) => (
                <div key={idx}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.items.map((action, actionIdx) => (
                            <Link
                                key={actionIdx}
                                to={action.path}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 hover:border-indigo-200"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-lg bg-${action.color}-50`}>
                                        <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{action.name}</h3>
                                        <p className="text-xs text-gray-500">{action.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
