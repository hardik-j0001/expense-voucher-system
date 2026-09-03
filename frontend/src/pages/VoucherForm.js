import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const VoucherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [existingSignature, setExistingSignature] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: user?.department || '',
    expenseDate: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
  });

  const isEdit = Boolean(id);



  useEffect(() => {
    if (isEdit) {
      fetchVoucher();
    }
  }, [id]);

  const fetchVoucher = async () => {
    try {
      const response = await api.get(`/vouchers/${id}`);
      const voucher = response.data.voucher;
      if (voucher.employeeId !== user.id) {
        toast.error('You can only edit your own vouchers');
        navigate('/vouchers');
        return;
      }
      if (voucher.status !== 'draft') {
        toast.error('Only draft vouchers can be edited');
        navigate('/vouchers');
        return;
      }
      setFormData({
        title: voucher.title,
        description: voucher.description || '',
        department: voucher.department,
        expenseDate: new Date(voucher.expenseDate).toISOString().split('T')[0],
        amount: voucher.amount,
        category: voucher.category || '',
      });
      setExistingSignature(voucher.employeeSignature || null);
    } catch (error) {
      toast.error('Failed to fetch voucher');
      navigate('/vouchers');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSignatureFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let voucherId = id;

      if (isEdit) {
        await api.put(`/vouchers/${id}`, formData);
        toast.success('Voucher updated successfully');
      } else {
        const response = await api.post('/vouchers', formData);
        voucherId = response.data.voucher.id;
        toast.success('Voucher created successfully');
      }

      // Upload signature if provided
      if (signatureFile && voucherId) {
        const formDataFile = new FormData();
        formDataFile.append('signature', signatureFile);
        await api.post(`/vouchers/${voucherId}/signature`, formDataFile, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Signature uploaded successfully');
      }

      navigate(`/vouchers/${voucherId}`);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to save voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAndSubmit = async () => {
    // Validate required fields before proceeding
    if (!formData.title || !formData.department || !formData.expenseDate || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Signature is required for submission
    if (!signatureFile) {
      toast.error('Please upload your signature before submitting');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create the voucher
      const response = await api.post('/vouchers', formData);
      const voucherId = response.data.voucher.id;
      toast.success('Voucher created successfully');

      // Step 2: Upload signature if provided
      if (signatureFile) {
        const formDataFile = new FormData();
        formDataFile.append('signature', signatureFile);
        await api.post(`/vouchers/${voucherId}/signature`, formDataFile, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Step 3: Submit the voucher for approval
      await api.post(`/vouchers/${voucherId}/submit`);
      toast.success('Voucher submitted for approval');
      navigate('/vouchers');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to save and submit voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Voucher' : 'Create New Voucher'}
        </h1>
        <button
          onClick={() => navigate('/vouchers')}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expense Date *
              </label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Signature (Image) <span className="text-red-500">* required for submission</span>
            </label>
            {existingSignature && (
              <div className="mt-1 flex items-center space-x-2">
                <img src={`http://localhost:5000${existingSignature}`} alt="Current Signature" className="h-12 object-contain border rounded" />
                <span className="text-xs text-green-600 font-medium">✓ Signature uploaded</span>
              </div>
            )}
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1 w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {existingSignature ? 'Upload a new signature to replace the existing one' : 'Upload your signature image (JPG, PNG, GIF)'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Voucher' : 'Save as Draft'}
          </button>
          
          {!isEdit && (
            <button
              type="button"
              onClick={handleSubmitAndSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Save & Submit
            </button>
          )}
          
          {isEdit && (
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                // Check signature exists (either previously uploaded or new file)
                if (!existingSignature && !signatureFile) {
                  toast.error('Please upload your signature before submitting');
                  return;
                }
                setLoading(true);
                try {
                  // First update the voucher
                  await api.put(`/vouchers/${id}`, formData);

                  // Upload signature if provided
                  if (signatureFile) {
                    const formDataFile = new FormData();
                    formDataFile.append('signature', signatureFile);
                    await api.post(`/vouchers/${id}/signature`, formDataFile, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    });
                  }

                  // Then submit it
                  await api.post(`/vouchers/${id}/submit`);
                  toast.success('Voucher submitted for approval');
                  navigate('/vouchers');
                } catch (error) {
                  console.error('Error:', error.response?.data || error.message);
                  toast.error(error.response?.data?.message || 'Failed to submit voucher');
                } finally {
                  setLoading(false);
                }
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Submit for Approval
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VoucherForm;