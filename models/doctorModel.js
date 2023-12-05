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
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.INTEGER, // Adjust data type based on your requirement
      allowNull: true,
    },
    feesPerConsultation: {
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
