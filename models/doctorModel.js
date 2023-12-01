const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const doctorModel = sequelize.define(
  "doctorModel",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    experience: {
      type: DataTypes.INTEGER, // Adjust data type based on your requirement
      allowNull: false,
    },
    feesPerConsultation: {
      type: DataTypes.NUMBER, // Assuming fees can be a decimal
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    timings: {
      type: DataTypes.JSON, // Assuming you want to store JSON data for timings
      allowNull: false,
    },
  },
  { timestamps: true }
);

module.exports = doctorModel;
