import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { 
  FiFileText, FiCheckCircle, FiXCircle, FiClock, 
  FiDollarSign, FiTrendingUp
} from 'react-icons/fi';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, vouchersRes] = await Promise.all([
        api.get('/vouchers/dashboard'),
        api.get('/vouchers?limit=5'),
      ]);
      setStats(statsRes.data.stats);
      setRecentVouchers(vouchersRes.data.vouchers || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Vouchers', value: stats?.total || 0, icon: FiFileText, color: 'bg-blue-500' },
    { label: 'Draft', value: stats?.draft || 0, icon: FiFileText, color: 'bg-gray-500' },
    { label: 'Pending Approval', value: stats?.submitted || 0, icon: FiClock, color: 'bg-yellow-500' },
    { label: 'Approved', value: stats?.approved || 0, icon: FiCheckCircle, color: 'bg-green-500' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: FiXCircle, color: 'bg-red-500' },
    { label: 'Total Amount', value: `₹${stats?.totalAmount?.toFixed(2) || '0.00'}`, icon: FiDollarSign, color: 'bg-purple-500' },
  ];

  if (user?.role === 'director' || user?.role === 'accounts') {
    statCards.push(
      { label: 'Pending Amount', value: `₹${stats?.pendingAmount?.toFixed(2) || '0.00'}`, icon: FiTrendingUp, color: 'bg-indigo-500' }
    );
  }

  const pieData = [
    { name: 'Draft', value: stats?.draft || 0 },
    { name: 'Submitted', value: stats?.submitted || 0 },
    { name: 'Approved', value: stats?.approved || 0 },
    { name: 'Rejected', value: stats?.rejected || 0 },
  ];

  const COLORS = ['#9CA3AF', '#FBBF24', '#10B981', '#EF4444'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Voucher Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentVouchers.length > 0 ? (
              recentVouchers.map((voucher) => (
                <div key={voucher.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{voucher.title}</p>
                    <p className="text-sm text-gray-500">{voucher.voucherNumber}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      voucher.status === 'approved' ? 'bg-green-100 text-green-800' :
                      voucher.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      voucher.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {voucher.status}
                    </span>
                    <span className="text-sm font-semibold">₹{voucher.amount}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent vouchers</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;