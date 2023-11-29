const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const userModel = sequelize.define("userModel", {
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
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPatient: {
    type: DataTypes.BOOLEAN,
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
