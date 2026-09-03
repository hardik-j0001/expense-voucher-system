import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';

const VoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  const fetchVoucher = async () => {
    try {
      const response = await api.get(`/vouchers/${id}`);
      setVoucher(response.data.voucher);
    } catch (error) {
      toast.error('Failed to fetch voucher details');
      navigate('/vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/vouchers/${id}/approve`);
      toast.success('Voucher approved successfully');
      fetchVoucher();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve voucher');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await api.post(`/vouchers/${id}/reject`, { rejectionReason });
      toast.success('Voucher rejected');
      setShowRejectModal(false);
      fetchVoucher();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject voucher');
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 text-sm rounded-full ${classes[status] || classes.draft}`}>{status}</span>;
  };

  if (loading) {
    return <div className="text-center py-10">Loading voucher details...</div>;
  }

  if (!voucher) {
    return <div className="text-center py-10">Voucher not found</div>;
  }

  const canApprove = user?.role === 'director' && voucher.status === 'submitted';
  const canEdit = user?.role === 'employee' && voucher.status === 'draft' && voucher.employeeId === user.id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Voucher Details</h1>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <button onClick={() => navigate(`/vouchers/${id}/edit`)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
              Edit
            </button>
          )}
          <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            <FiDownload className="inline mr-2" />
            Print
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Voucher Number</p>
              <p className="text-lg font-semibold">{voucher.voucherNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              {getStatusBadge(voucher.status)}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="text-lg">{voucher.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="text-2xl font-bold text-blue-600">₹{voucher.amount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Department</h3>
              <p>{voucher.department}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p>{voucher.category || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Expense Date</h3>
              <p>{new Date(voucher.expenseDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Submitted Date</h3>
              <p>{new Date(voucher.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-gray-700">{voucher.description || 'No description provided'}</p>
          </div>
        </div>

        <div className="border-t px-6 py-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Signatures</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium">Employee Signature</p>
              {voucher.employeeSignature ? (
                <img src={voucher.employeeSignature} alt="Employee Signature" className="mt-2 h-16 object-contain border rounded" />
              ) : (
                <p className="text-sm text-gray-400 mt-1">Not uploaded</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{voucher.employee?.name} ({voucher.employee?.department})</p>
            </div>
            <div>
              <p className="text-sm font-medium">Director Signature</p>
              {voucher.directorSignature ? (
                <img src={voucher.directorSignature} alt="Director Signature" className="mt-2 h-16 object-contain border rounded" />
              ) : (
                <p className="text-sm text-gray-400 mt-1">Pending</p>
              )}
              {voucher.director && (
                <p className="text-xs text-gray-500 mt-1">
                  {voucher.director.name}
                  {voucher.approvalDate && ` • ${new Date(voucher.approvalDate).toLocaleDateString()}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {voucher.status === 'rejected' && voucher.rejectionReason && (
          <div className="border-t px-6 py-4 bg-red-50">
            <h3 className="text-sm font-medium text-red-700">Rejection Reason</h3>
            <p className="mt-1 text-red-600">{voucher.rejectionReason}</p>
          </div>
        )}

        {canApprove && (
          <div className="border-t px-6 py-4 bg-gray-50">
            <div className="flex space-x-3">
              <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Approve
              </button>
              <button onClick={() => setShowRejectModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Reject Voucher</h2>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this voucher.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex space-x-3 mt-4">
              <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Confirm Reject
              </button>
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherDetail;