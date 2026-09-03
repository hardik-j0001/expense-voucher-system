const { Voucher } = require('../models');

exports.generateVoucherNumber = async () => {
  const year = new Date().getFullYear();

  // Find all existing vouchers for the current year
  const vouchers = await Voucher.findAll({
    attributes: ['voucherNumber'],
    where: {
      voucherNumber: { $like: `VOUCH-${year}-%` },
    },
  });

  let maxNum = 0;
  for (const v of vouchers) {
    if (v.voucherNumber) {
      const parts = v.voucherNumber.split('-');
      if (parts.length >= 3) {
        const n = parseInt(parts[2], 10);
        if (!isNaN(n) && n > maxNum) {
          maxNum = n;
        }
      }
    }
  }

  // Ensure unique number
  let candidateNum = maxNum + 1;
  let voucherNumber = `VOUCH-${year}-${String(candidateNum).padStart(4, '0')}`;

  while (await Voucher.findOne({ where: { voucherNumber } })) {
    candidateNum++;
    voucherNumber = `VOUCH-${year}-${String(candidateNum).padStart(4, '0')}`;
  }

  return voucherNumber;
};