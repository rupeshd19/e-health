const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const doctorModel = sequelize.define(
  "doctorModel",
  {
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
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    speciality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    slotDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER, // Assuming fees can be a decimal
      allowNull: true,
    },
    // status: {
    //   type: DataTypes.STRING,
    //   defaultValue: "pending",
    // },
    openTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    closeTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  { timestamps: true }
);

module.exports = doctorModel;
