import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Zap,
    Users,
    Monitor,
    MapPin,
    Home,
    Calendar,
    Clock,
    Mail,
    MailPlus,
    Inbox,
    FileText,
    BarChart2,
    MessageSquare,
    Star,
    CreditCard,
    Image,
    File,
    MessageCircle,
    Bot,
    Phone,
    BookOpen,
    BarChart3,
    Download,
    Building,
    UtensilsCrossed,
    UserCheck,
    LineChart,
    CalendarClock,
    Tent,
    ScanLine,
    Activity,
    Radio,
    Megaphone,
    CalendarDays,
    UsersRound,
    CheckSquare,
    MessagesSquare,
    Award,
    History,
    Settings,
    Shield,
    Workflow,
    Plug,
    Database,
    HelpCircle,
    Video,
    Sparkles,
    Bug,
    LifeBuoy,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const menuItems = [
    {
        section: 'OVERVIEW',
        items: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Analytics & Insights', path: '/admin/analytics', icon: TrendingUp },
            { name: 'Quick Actions', path: '/admin/quick-actions', icon: Zap },
        ]
    },
    {
        section: 'REGISTRATIONS',
        items: [
            { name: 'All Registrations', path: '/admin/registrations', icon: Users },
            { name: 'Online Participants', path: '/admin/registrations?mode=online', icon: Monitor },
            { name: 'Onsite Participants', path: '/admin/registrations?mode=onsite', icon: MapPin },
            { name: 'Accommodation', path: '/admin/accommodation', icon: Home },
            { name: 'Arrivals Calendar', path: '/admin/arrivals', icon: Calendar },
            { name: 'Pending', path: '/admin/registrations?status=pending', icon: Clock },
        ]
    },
    {
        section: 'COMMUNICATION',
        items: [
            { name: 'Email Center', path: '/admin/emails', icon: Mail },
            { name: 'Bulk Email', path: '/admin/emails/bulk', icon: MailPlus },
            { name: 'Email Campaigns', path: '/admin/emails/campaigns', icon: Inbox },
            { name: 'Email Templates', path: '/admin/emails/templates', icon: FileText },
            { name: 'Delivery Reports', path: '/admin/emails/reports', icon: BarChart2 },
            { name: 'SMS Center', path: '/admin/sms', icon: MessageSquare },
        ]
    },
    {
        section: 'CONTENT',
        items: [
            { name: 'Testimonials', path: '/admin/testimonials', icon: Star },
            { name: 'Badge Management', path: '/admin/badges', icon: CreditCard },
            { name: 'Media Library', path: '/admin/media', icon: Image },
            { name: 'Documents', path: '/admin/documents', icon: File },
        ]
    },
    {
        section: 'SUPPORT',
        items: [
            { name: 'Support Inbox', path: '/admin/support', icon: MessageCircle },
            { name: 'Chatbot', path: '/admin/chatbot', icon: Bot },
            { name: 'Contact Log', path: '/admin/contacts', icon: Phone },
            { name: 'Help Articles', path: '/admin/help', icon: BookOpen },
        ]
    },
    {
        section: 'REPORTS',
        items: [
            { name: 'All Reports', path: '/admin/reports', icon: BarChart3 },
        ]
    },
    {
        section: 'EVENT',
        items: [
            { name: 'Event Overview', path: '/admin/event', icon: Tent },
            { name: 'Check-In', path: '/admin/check-in', icon: ScanLine },
            { name: 'Session Tracking', path: '/admin/sessions', icon: Activity },
            { name: 'Live Dashboard', path: '/admin/live', icon: Radio },
            { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
            { name: 'Schedule', path: '/admin/schedule', icon: CalendarDays },
        ]
    },
    {
        section: 'TEAM',
        items: [
            { name: 'Admin Users', path: '/admin/team/users', icon: UsersRound },
            { name: 'My Tasks', path: '/admin/tasks', icon: CheckSquare },
            { name: 'Team Chat', path: '/admin/chat', icon: MessagesSquare },
            { name: 'Performance', path: '/admin/performance', icon: Award },
            { name: 'Activity Log', path: '/admin/activity', icon: History },
        ]
    },
    {
        section: 'SYSTEM',
        items: [
            { name: 'Settings', path: '/admin/settings', icon: Settings },
            { name: 'Security', path: '/admin/security', icon: Shield },
            { name: 'Automations', path: '/admin/automations', icon: Workflow },
            { name: 'Integrations', path: '/admin/integrations', icon: Plug },
            { name: 'Backup & Data', path: '/admin/backup', icon: Database },
            { name: 'System Health', path: '/admin/system', icon: Activity },
        ]
    },
    {
        section: 'HELP',
        items: [
            { name: 'Help Center', path: '/admin/help', icon: HelpCircle },
            { name: 'Training Videos', path: '/admin/training', icon: Video },
            { name: 'Documentation', path: '/admin/docs', icon: BookOpen },
            { name: 'What\'s New', path: '/admin/changelog', icon: Sparkles },
            { name: 'Report Bug', path: '/admin/feedback', icon: Bug },
            { name: 'Contact Support', path: '/admin/support-contact', icon: LifeBuoy },
        ]
    }
];

export default function AdminSidebar({ isOpen, isMobile, onClose, collapsed, setCollapsed }) {
    const location = useLocation();
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const sidebarClasses = `
        fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
        ${isMobile
            ? (isOpen ? 'translate-x-0 w-[80%] max-w-xs' : '-translate-x-full w-[80%] max-w-xs')
            : (collapsed ? 'w-[60px]' : 'w-[260px]')
        }
        lg:translate-x-0 lg:static lg:h-screen
    `;

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={sidebarClasses}>
                {/* Header */}
                <div className={`flex items-center justify-between h-16 px-4 border-b border-gray-200 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
                    {!collapsed || isMobile ? (
                        <span className="text-xl font-bold text-gray-900 truncate">GREAT DAYS</span>
                    ) : (
                        <span className="text-xl font-bold text-indigo-600">GD</span>
                    )}

                    {!isMobile && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
                        >
                            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300">
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="mb-2">
                            {(!collapsed || isMobile) && (
                                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {section.section}
                                </div>
                            )}

                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.path}
                                            onClick={isMobile ? onClose : undefined}
                                            className={`
                                                flex items-center px-4 py-2.5 mx-2 rounded-lg transition-colors group relative
                                                ${isActive
                                                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }
                                                ${collapsed && !isMobile ? 'justify-center px-2' : ''}
                                            `}
                                            title={collapsed && !isMobile ? item.name : ''}
                                        >
                                            <item.icon
                                                size={20}
                                                className={`
                                                    flex-shrink-0 transition-colors
                                                    ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}
                                                    ${!collapsed || isMobile ? 'mr-3' : ''}
                                                `}
                                            />

                                            {(!collapsed || isMobile) && (
                                                <span className="truncate flex-1">{item.name}</span>
                                            )}

                                            {(!collapsed || isMobile) && item.badge && (
                                                <span className={`
                                                    ml-auto px-2 py-0.5 rounded-full text-xs font-medium
                                                    ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}
                                                `}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    {(!collapsed || isMobile) ? (
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Storage</span>
                                    <span>425 MB / 10 GB</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '4%' }}></div>
                                </div>
                            </div>
                            <div className="flex items-center text-xs text-green-600 font-medium">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                System Healthy
                            </div>
                            <div className="text-xs text-gray-500">
                                Event in 45 days
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-green-500" title="System Healthy"></div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
