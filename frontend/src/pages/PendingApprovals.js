import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiEye, FiUpload } from 'react-icons/fi';

const PendingApprovals = () => {
  const { user, setUser } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [directorSignature, setDirectorSignature] = useState(user?.signature || null);

  useEffect(() => {
    fetchPendingVouchers();
  }, []);

  const fetchPendingVouchers = async () => {
    try {
      const response = await api.get('/vouchers?status=submitted');
      setVouchers(response.data.vouchers);
    } catch (error) {
      toast.error('Failed to fetch pending vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureUpload = async () => {
    if (!signatureFile) {
      toast.error('Please select a signature image first');
      return;
    }

    setUploadingSignature(true);
    try {
      const formData = new FormData();
      formData.append('signature', signatureFile);
      const response = await api.post('/vouchers/director/signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDirectorSignature(response.data.signature);
      setSignatureFile(null);
      // Update user context with new signature
      if (user) {
        setUser({ ...user, signature: response.data.signature });
      }
      toast.success('Signature uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload signature');
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleApprove = async (id) => {
    if (!directorSignature) {
      toast.error('Please upload your signature before approving vouchers');
      return;
    }
    try {
      await api.post(`/vouchers/${id}/approve`);
      toast.success('Voucher approved successfully');
      fetchPendingVouchers();
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
      await api.post(`/vouchers/${selectedVoucher}/reject`, { rejectionReason });
      toast.success('Voucher rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchPendingVouchers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject voucher');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading pending approvals...</div>;
  }

  return (
    <div>
      {/* Director Signature Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Signature</h2>
        {directorSignature ? (
          <div className="flex items-center space-x-4">
            <div>
              <img
                src={`http://localhost:5000${directorSignature}`}
                alt="Director Signature"
                className="h-16 object-contain border rounded p-1"
              />
              <span className="text-xs text-green-600 font-medium mt-1 block">✓ Signature uploaded</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">Upload a new signature to replace the current one:</p>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSignatureFile(e.target.files[0])}
                  className="text-sm"
                />
                {signatureFile && (
                  <button
                    onClick={handleSignatureUpload}
                    disabled={uploadingSignature}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FiUpload className="mr-1" />
                    {uploadingSignature ? 'Uploading...' : 'Replace'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 mb-3">
              ⚠️ You must upload your signature before you can approve vouchers.
            </p>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSignatureFile(e.target.files[0])}
                className="text-sm"
              />
              <button
                onClick={handleSignatureUpload}
                disabled={uploadingSignature || !signatureFile}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <FiUpload className="mr-2" />
                {uploadingSignature ? 'Uploading...' : 'Upload Signature'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Accepted formats: JPG, PNG, GIF (max 5MB)</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
          {vouchers.length} pending
        </span>
      </div>

      {vouchers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-medium text-gray-900">No pending approvals</h3>
          <p className="text-gray-500 mt-2">All vouchers have been processed</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{voucher.voucherNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{voucher.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{voucher.employee?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{voucher.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(voucher.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Link to={`/vouchers/${voucher.id}`} className="text-blue-600 hover:text-blue-800">
                          <FiEye size={18} />
                        </Link>
                        <button onClick={() => handleApprove(voucher.id)} className="text-green-600 hover:text-green-800" title="Approve">
                          <FiCheckCircle size={18} />
                        </button>
                        <button onClick={() => { setSelectedVoucher(voucher.id); setShowRejectModal(true); }} className="text-red-600 hover:text-red-800" title="Reject">
                          <FiXCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
              <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;