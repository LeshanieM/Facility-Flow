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

          <Route path="/tech/tasks" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
