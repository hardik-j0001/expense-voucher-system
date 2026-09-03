import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VoucherList from './pages/VoucherList';
import VoucherForm from './pages/VoucherForm';
import VoucherDetail from './pages/VoucherDetail';
import PendingApprovals from './pages/PendingApprovals';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vouchers" element={<VoucherList />} />
          <Route path="vouchers/new" element={<VoucherForm />} />
          <Route path="vouchers/:id" element={<VoucherDetail />} />
          <Route path="vouchers/:id/edit" element={<VoucherForm />} />
          <Route path="pending" element={
            <ProtectedRoute roles={['director']}>
              <PendingApprovals />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;