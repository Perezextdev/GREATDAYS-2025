import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import ParallaxSection from './components/ParallaxSection';
import gallery3 from './assets/gallery-3.jpg';
import Register from './pages/Register';
import SubmitTestimonyPage from './pages/SubmitTestimonyPage';
import TestimoniesPage from './pages/TestimoniesPage';
import AboutPage from './pages/AboutPage';
import ScrollToTop from './components/ScrollToTop';
import ChatBot from './components/ChatBot';

// Admin Imports
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminSignupPage from './pages/admin/AdminSignupPage';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import RegistrationsPage from './pages/admin/RegistrationsPage';
import NewRegistrationPage from './pages/admin/NewRegistrationPage';
import ArrivalsPage from './pages/admin/ArrivalsPage';
import AccommodationPage from './pages/admin/AccommodationPage';
import MealsPage from './pages/admin/MealsPage';
import TestimonialsPage from './pages/admin/TestimonialsPage';
import BadgesPage from './pages/admin/BadgesPage';
import SupportRequestsPage from './pages/admin/SupportRequestsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ReportsPage from './pages/admin/ReportsPage';
import EmailsPage from './pages/admin/EmailsPage';
import AutomationsPage from './pages/admin/AutomationsPage';
import SecurityPage from './pages/admin/SecurityPage';
import ChatbotManagementPage from './pages/admin/ChatbotManagementPage';
import SettingsPage from './pages/admin/SettingsPage';
import CheckInPage from './pages/admin/CheckInPage';
import QuickActionsPage from './pages/admin/QuickActionsPage';
import EventOverviewPage from './pages/admin/EventOverviewPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import EarlyBirdsPage from './pages/admin/EarlyBirdsPage';

import AdminUsersPage from './pages/admin/team/AdminUsersPage';
import MyTasksPage from './pages/admin/team/MyTasksPage';
import TeamChatPage from './pages/admin/team/TeamChatPage';
import PerformancePage from './pages/admin/team/PerformancePage';
import ActivityLogPage from './pages/admin/team/ActivityLogPage';

// Placeholder components for routes we haven't built yet
// const AdminRegistrations = () => <div className="p-4">Registrations Page (Coming Soon)</div>;
const AdminTestimonials = () => <div className="p-4">Testimonials Management (Coming Soon)</div>;
const AdminSupport = () => <div className="p-4">Support Requests (Coming Soon)</div>;
const AdminBadges = () => <div className="p-4">Badge Management (Coming Soon)</div>;
import AdminSettings from './pages/admin/AdminSettings';
import PlaceholderPage from './pages/admin/PlaceholderPage';

function Home() {
  return (
    <>
      <Hero />
      <ParallaxSection bgImage={gallery3} className="text-white text-center">
        <div className="max-w-4xl mx-auto bg-black/40 p-8 md:p-12 rounded-3xl backdrop-blur-md border border-white/10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">About The Event</h2>
          <p className="text-xl md:text-2xl text-slate-200 leading-relaxed">
            Great Days 2026 is more than just a conference; it's a spiritual journey.
            Join us for 7 days of intense worship, word, and wonders as we seek the face of God together.
          </p>
        </div>
      </ParallaxSection>
      <Testimonials />
      <CTA />
    </>
  );
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500/30">
      <Navbar />
      {children}
      <Footer />
      <ChatBot />
    </div>
  );
}

import { AuthProvider } from './context/AuthContext';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            } />
            <Route path="/register" element={
              <PublicLayout>
                <Register />
              </PublicLayout>
            } />
            <Route path="/submit-testimony" element={
              <PublicLayout>
                <SubmitTestimonyPage />
              </PublicLayout>
            } />
            <Route path="/about" element={
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            } />
            <Route path="/testimonies" element={
              <PublicLayout>
                <TestimoniesPage />
              </PublicLayout>
            } />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/signup" element={<AdminSignupPage />} />

            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="quick-actions" element={<QuickActionsPage />} />

                {/* Registrations */}
                <Route path="registrations" element={<RegistrationsPage />} />
                <Route path="arrivals" element={<ArrivalsPage />} />
                <Route path="accommodation" element={<AccommodationPage />} />
                <Route path="medals" element={<MealsPage />} />
                <Route path="early-birds" element={<EarlyBirdsPage />} />
                <Route path="testimonials" element={<TestimonialsPage />} />

                {/* Communication */}
                <Route path="emails" element={<EmailsPage />} />
                <Route path="emails/bulk" element={<PlaceholderPage />} />
                <Route path="emails/campaigns" element={<PlaceholderPage />} />
                <Route path="emails/templates" element={<PlaceholderPage />} />
                <Route path="emails/reports" element={<PlaceholderPage />} />
                <Route path="sms" element={<PlaceholderPage />} />

                {/* Content */}
                <Route path="testimonials" element={<TestimonialsPage />} />
                <Route path="badges" element={<BadgesPage />} />
                <Route path="media" element={<PlaceholderPage />} />
                <Route path="documents" element={<PlaceholderPage />} />

                {/* Support */}
                <Route path="support" element={<SupportRequestsPage />} />
                <Route path="chatbot" element={<ChatbotManagementPage />} />
                <Route path="contacts" element={<PlaceholderPage />} />
                <Route path="help" element={<PlaceholderPage />} />

                {/* Reports */}
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/registrations" element={<PlaceholderPage />} />
                <Route path="reports/accommodation" element={<PlaceholderPage />} />
                <Route path="reports/meals" element={<PlaceholderPage />} />
                <Route path="reports/contacts" element={<PlaceholderPage />} />
                <Route path="reports/custom" element={<PlaceholderPage />} />
                <Route path="reports/scheduled" element={<PlaceholderPage />} />

                {/* Event */}
                <Route path="event" element={<EventOverviewPage />} />
                <Route path="check-in" element={<CheckInPage />} />
                <Route path="sessions" element={<PlaceholderPage />} />
                <Route path="live" element={<PlaceholderPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="schedule" element={<PlaceholderPage />} />

                {/* Team */}
                <Route path="team/users" element={<AdminUsersPage />} />
                <Route path="tasks" element={<MyTasksPage />} />
                <Route path="chat" element={<TeamChatPage />} />
                <Route path="performance" element={<PerformancePage />} />
                <Route path="activity" element={<ActivityLogPage />} />

                {/* System */}
                <Route path="settings" element={<SettingsPage />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="automations" element={<AutomationsPage />} />
                <Route path="integrations" element={<PlaceholderPage />} />
                <Route path="backup" element={<PlaceholderPage />} />
                <Route path="system" element={<PlaceholderPage />} />

                {/* Help */}
                <Route path="training" element={<PlaceholderPage />} />
                <Route path="docs" element={<PlaceholderPage />} />
                <Route path="changelog" element={<PlaceholderPage />} />
                <Route path="feedback" element={<PlaceholderPage />} />
                <Route path="support-contact" element={<PlaceholderPage />} />
                <Route path="quick-actions" element={<PlaceholderPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
