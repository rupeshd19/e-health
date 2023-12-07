const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const userModel = require("./userModel");
const doctorModel = require("./doctorModel");

const AppointmentModel = sequelize.define(
  "appointmentModel",
  {
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: userModel,
        key: "id",
      },
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: doctorModel,
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
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

AppointmentModel.belongsTo(userModel, {
  foreignKey: "patientId",
  as: "patient",
});
userModel.hasMany(AppointmentModel, { foreignKey: "patientId" });

AppointmentModel.belongsTo(doctorModel, {
  foreignKey: "doctorId",
  as: "doctor",
});
doctorModel.hasMany(AppointmentModel, { foreignKey: "doctorId" });

module.exports = AppointmentModel;
