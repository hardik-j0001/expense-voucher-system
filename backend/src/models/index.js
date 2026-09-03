const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');

// Use mysql2 explicitly
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectModule: require('mysql2'),  // ← Add this line
    logging: config.logging || false,
    pool: config.pool,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user.model')(sequelize, DataTypes);
db.Voucher = require('./voucher.model')(sequelize, DataTypes);

db.User.hasMany(db.Voucher, { foreignKey: 'employeeId', as: 'employeeVouchers' });
db.User.hasMany(db.Voucher, { foreignKey: 'directorId', as: 'directorVouchers' });

db.Voucher.belongsTo(db.User, { foreignKey: 'employeeId', as: 'employee' });
db.Voucher.belongsTo(db.User, { foreignKey: 'directorId', as: 'director' });

module.exports = db;