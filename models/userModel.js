const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const userModel = sequelize.define("userModel", {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  otp: {
    type: DataTypes.STRING,
  },
  isPatient: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  pastDiseases: {
    type: DataTypes.STRING,
  },
  notification: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  seenNotification: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
});

module.exports = userModel;
