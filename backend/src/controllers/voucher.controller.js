const { Voucher, User, sequelize } = require('../models');
const { generateVoucherNumber } = require('../utils/helpers');

const getVoucherWithAssociations = async (id) => {
  return await Voucher.findById(id, {
    include: [
      { model: User, as: 'employee', attributes: ['id', 'name', 'email', 'department', 'signature'] },
      { model: User, as: 'director', attributes: ['id', 'name', 'email', 'signature'] },
    ],
  });
};

exports.getVouchers = async (req, res) => {
  try {
    const { status, category, startDate, endDate, minAmount, maxAmount, search, limit } = req.query;
    const where = {};
    let order = [['createdAt', 'DESC']];

    if (req.user.role === 'employee') {
      where.employeeId = req.user.id;
    }

    if (status) where.status = status;
    if (category) where.category = { $like: `%${category}%` };

    if (startDate && endDate) {
      where.expenseDate = {
        $between: [new Date(startDate), new Date(endDate)],
      };
    }

    if (minAmount && maxAmount) {
      where.amount = {
        $between: [parseFloat(minAmount), parseFloat(maxAmount)],
      };
    }

    if (search) {
      where.$or = [
        { title: { $like: `%${search}%` } },
        { voucherNumber: { $like: `%${search}%` } },
      ];
    }

    const options = {
      where,
      include: [
        { model: User, as: 'employee', attributes: ['id', 'name', 'email', 'department', 'signature'] },
        { model: User, as: 'director', attributes: ['id', 'name', 'email', 'signature'] },
      ],
      order,
    };

    if (limit) {
      options.limit = parseInt(limit);
    }

    const vouchers = await Voucher.findAll(options);
    res.json({ success: true, count: vouchers.length, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVoucher = async (req, res) => {
  try {
    const voucher = await getVoucherWithAssociations(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    if (req.user.role === 'employee' && voucher.employeeId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createVoucher = async (req, res) => {
  try {
    const { title, description, department, expenseDate, amount, category } = req.body;

    const voucherNumber = await generateVoucherNumber();

    const voucher = await Voucher.create({
      voucherNumber,
      title,
      description,
      department: department || req.user.department,
      expenseDate,
      amount: parseFloat(amount),
      category,
      employeeId: req.user.id,
      status: 'draft',
    });

    const createdVoucher = await getVoucherWithAssociations(voucher.id);
    res.status(201).json({ success: true, voucher: createdVoucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    if (voucher.employeeId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (voucher.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft vouchers can be edited' });
    }

    const { title, description, department, expenseDate, amount, category } = req.body;

    await voucher.update({
      title: title || voucher.title,
      description: description || voucher.description,
      department: department || voucher.department,
      expenseDate: expenseDate || voucher.expenseDate,
      amount: amount ? parseFloat(amount) : voucher.amount,
      category: category || voucher.category,
    });

    const updatedVoucher = await getVoucherWithAssociations(voucher.id);
    res.json({ success: true, voucher: updatedVoucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    if (voucher.employeeId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (voucher.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft vouchers can be deleted' });
    }

    await voucher.destroy();
    res.json({ success: true, message: 'Voucher deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    if (voucher.employeeId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (voucher.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft vouchers can be submitted' });
    }

    if (!voucher.employeeSignature) {
      return res.status(400).json({ success: false, message: 'Employee signature is required before submission' });
    }

    await voucher.update({ status: 'submitted' });
    const updatedVoucher = await getVoucherWithAssociations(voucher.id);
    res.json({ success: true, voucher: updatedVoucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadSignature = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    if (voucher.employeeId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (voucher.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft vouchers can be modified' });
    }

    const signaturePath = `/uploads/signatures/${req.file.filename}`;
    await voucher.update({ employeeSignature: signaturePath });

    const updatedVoucher = await getVoucherWithAssociations(voucher.id);
    res.json({ success: true, voucher: updatedVoucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    if (voucher.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Only submitted vouchers can be approved' });
    }

    const director = await User.findById(req.user.id);
    if (!director.signature) {
      return res.status(400).json({ success: false, message: 'Please upload your signature first' });
    }

    await voucher.update({
      status: 'approved',
      directorId: req.user.id,
      directorSignature: director.signature,
      approvalDate: new Date(),
    });

    const updatedVoucher = await getVoucherWithAssociations(voucher.id);
    res.json({ success: true, voucher: updatedVoucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectVoucher = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    if (voucher.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Only submitted vouchers can be rejected' });
    }

    await voucher.update({
      status: 'rejected',
      directorId: req.user.id,
      rejectionReason,
      approvalDate: new Date(),
    });

    const updatedVoucher = await getVoucherWithAssociations(voucher.id);
    res.json({ success: true, voucher: updatedVoucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadDirectorSignature = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    const signaturePath = `/uploads/signatures/${req.file.filename}`;
    await user.update({ signature: signaturePath });

    res.json({ success: true, signature: signaturePath });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const where = {};
    
    if (req.user.role === 'employee') {
      where.employeeId = req.user.id;
    }

    const total = await Voucher.count({ where });
    const draft = await Voucher.count({ where: { ...where, status: 'draft' } });
    const submitted = await Voucher.count({ where: { ...where, status: 'submitted' } });
    const approved = await Voucher.count({ where: { ...where, status: 'approved' } });
    const rejected = await Voucher.count({ where: { ...where, status: 'rejected' } });

    const totalAmount = await Voucher.sum('amount', { 
      where: { ...where, status: 'approved' } 
    });

    let pendingApproval = 0;
    let approvedToday = 0;
    let rejectedToday = 0;
    let pendingAmount = 0;

    if (req.user.role === 'director' || req.user.role === 'accounts') {
      pendingApproval = await Voucher.count({ where: { status: 'submitted' } });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      approvedToday = await Voucher.count({ 
        where: { 
          status: 'approved',
          approvalDate: { $gte: today }
        } 
      });
      
      rejectedToday = await Voucher.count({ 
        where: { 
          status: 'rejected',
          approvalDate: { $gte: today }
        } 
      });

      pendingAmount = await Voucher.sum('amount', { 
        where: { status: 'submitted' } 
      });
    }

    res.json({
      success: true,
      stats: {
        total,
        draft,
        submitted,
        approved,
        rejected,
        totalAmount: totalAmount || 0,
        pendingApproval,
        approvedToday,
        rejectedToday,
        pendingAmount: pendingAmount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};