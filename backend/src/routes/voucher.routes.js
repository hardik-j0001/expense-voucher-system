const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const voucherController = require('../controllers/voucher.controller');

router.use(protect);

router.get('/dashboard', voucherController.getDashboardStats);

// Director signature route MUST be before /:id routes to avoid "director" being matched as an :id
router.post('/director/signature', 
  authorize('director'), 
  upload.single('signature'), 
  voucherController.uploadDirectorSignature
);

router.get('/', voucherController.getVouchers);
router.get('/:id', voucherController.getVoucher);
router.post('/', voucherController.createVoucher);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);

router.post('/:id/submit', voucherController.submitVoucher);
router.post('/:id/signature', upload.single('signature'), voucherController.uploadSignature);

router.post('/:id/approve', authorize('director'), voucherController.approveVoucher);
router.post('/:id/reject', authorize('director'), voucherController.rejectVoucher);

module.exports = router;