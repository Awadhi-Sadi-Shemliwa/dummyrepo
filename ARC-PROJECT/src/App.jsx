import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import LoginForm from './components/auth/LoginForm';
import AccessPortal from './pages/AccessPortal';
import CeoDashboard from './pages/CeoDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import OperationsDashboard from './pages/OperationsDashboard';
import PermissionManagement from './pages/PermissionManagement';
import { AuthProvider } from './context/AuthContext';
import { ArcProvider } from './components/auth/ArcContext';
import RoleRoute from './components/auth/RoleRoute';

function App() {
  return (
    <AuthProvider>
      <ArcProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <LandingPage />
                  </main>
                  <Footer />
                </div>
              }
            />
            <Route
              path="/login"
              element={
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <LoginForm />
                  </main>
                  <Footer />
                </div>
              }
            />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            
            {/* Access Portal - Role Selection */}
            <Route path="/access" element={<AccessPortal />} />
            
            {/* Protected Role Routes */}
            <Route
              path="/ceo"
              element={
                <RoleRoute allow="ceo">
                  <CeoDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/finance"
              element={
                <RoleRoute allow="finance">
                  <FinanceDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/operations"
              element={
                <RoleRoute allow="operations">
                  <OperationsDashboard />
                </RoleRoute>
              }
            />
            
            {/* Permission Management - CEO Only */}
            <Route
              path="/permissions"
              element={
                <RoleRoute allow="ceo">
                  <PermissionManagement />
                </RoleRoute>
              }
            />
            
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ArcProvider>
    </AuthProvider>
  );
}

export default App;
