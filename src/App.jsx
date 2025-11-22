import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Register from './pages/Register';
import SubmitTestimonyPage from './pages/SubmitTestimonyPage';
import AboutPage from './pages/AboutPage';
import ScrollToTop from './components/ScrollToTop';

// Admin Imports
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import RegistrationsPage from './pages/admin/RegistrationsPage';
import TestimonialsPage from './pages/admin/TestimonialsPage';
import BadgesPage from './pages/admin/BadgesPage';
import SupportRequestsPage from './pages/admin/SupportRequestsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ReportsPage from './pages/admin/ReportsPage';

// Placeholder components for routes we haven't built yet
// const AdminRegistrations = () => <div className="p-4">Registrations Page (Coming Soon)</div>;
const AdminTestimonials = () => <div className="p-4">Testimonials Management (Coming Soon)</div>;
const AdminSupport = () => <div className="p-4">Support Requests (Coming Soon)</div>;
const AdminBadges = () => <div className="p-4">Badge Management (Coming Soon)</div>;
import AdminSettings from './pages/admin/AdminSettings';

function Home() {
  return (
    <>
      <Hero />
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
    </div>
  );
}

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
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

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="registrations" element={<RegistrationsPage />} />
              <Route path="testimonials" element={<TestimonialsPage />} />
              <Route path="support" element={<SupportRequestsPage />} />
              <Route path="badges" element={<BadgesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
