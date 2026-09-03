const { Voucher } = require('../models');

exports.generateVoucherNumber = async () => {
  const count = await Voucher.count();
  const year = new Date().getFullYear();
  const num = String(count + 1).padStart(4, '0');
  return `VOUCH-${year}-${num}`;
};