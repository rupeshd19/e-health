const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const appointmentModel = sequelize.define(
  "appointmentModel",
  {
    patientId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    doctorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    vclink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { timestamps: true }
);

module.exports = appointmentModel;
