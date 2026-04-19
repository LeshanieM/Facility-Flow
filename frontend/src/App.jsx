import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Redirect from './pages/Redirect';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import TechDashboard from './pages/TechDashboard';
import Unauthorized from './pages/Unauthorized';
import { StudentStaffMaintenanceModule } from './modules/student-user-ui';
import AdminMaintenancePage from './modules/admin-user-ui/pages/AdminMaintenancePage';
import FacilityCataloguePage from './modules/facility-catalogue/pages/FacilityCataloguePage';
import AdminFacilityPage from './modules/facility-catalogue/pages/AdminFacilityPage';
import CreateBookingPage from './pages/bookings/CreateBookingPage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';
import AdminBookingsPage from './pages/bookings/AdminBookingsPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth2/redirect" element={<Redirect />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/maintenance" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <StudentStaffMaintenanceModule />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/incidents" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminMaintenancePage />
            </ProtectedRoute>
          } />

          <Route path="/facilities" element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}>
              <FacilityCataloguePage />
            </ProtectedRoute>
          } />

          <Route path="/admin/facilities" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminFacilityPage />
            </ProtectedRoute>
          } />

          <Route path="/tech/tasks" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechDashboard />
            </ProtectedRoute>
          } />

          {/* ── Booking Module (Module B) ── */}
          <Route path="/bookings/new" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <CreateBookingPage />
            </ProtectedRoute>
          } />

          <Route path="/bookings/my" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyBookingsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminBookingsPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
