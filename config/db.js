const Sequelize = require("sequelize");

const connectDB = new Sequelize("doctor", "niti", "niti@123", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = connectDB;
