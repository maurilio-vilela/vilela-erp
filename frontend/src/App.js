import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Persons from './pages/admin/Persons';
import Reminders from './pages/admin/Reminders';
import PageLayout from './components/PageLayout';

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" />;
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
                <h2>Dashboard</h2>
                <p>Bem-vindo ao Vilela ERP!</p>
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageLayout pageTitle="Home">
                <h2>Home</h2>
                <p>Bem-vindo ao Vilela ERP!</p>
              </PageLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
