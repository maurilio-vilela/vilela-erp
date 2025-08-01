import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Persons from './pages/admin/Persons';
import Reminders from './pages/admin/Reminders';
import Dashboard from './pages/admin/Dashboard';
import PageLayout from './components/PageLayout';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  console.log('ProtectedRoute - Token:', token); // Depuração (remover em produção)
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin/persons"
          element={
            <ProtectedRoute>
              <PageLayout pageTitle="Gerenciamento de Pessoas">
                <Persons />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reminders"
          element={
            <ProtectedRoute>
              <PageLayout pageTitle="Lembretes">
                <Reminders />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <PageLayout pageTitle="Dashboard">
                <Dashboard />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route path="*" element={<NotFound />} /> {/* Fallback para 404 */}
      </Routes>
    </Router>
  );
};

export default App;