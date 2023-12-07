const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const appointmentModel = require("./appointmentModel");
const prescriptionModel = sequelize.define("prescriptionModel", {
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  medicene: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dosesPerDay: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
// establish relation to appointmentModel
prescriptionModel.belongsTo(appointmentModel, {
  foreignKey: "appointmentId",
  as: "appointment",
});
appointmentModel.hasMany(prescriptionModel, { foreignKey: "appointmentId" });

// establish relation to userModel
prescriptionModel.belongsTo(userModel, {
  foreignKey: "patientId",
  as: "patient",
});
userModel.hasMany(prescriptionModel, { foreignKey: "patientId" });

// establish relation to doctorModel
prescriptionModel.belongsTo(doctorModel, {
  foreignKey: "doctorId",
  as: "doctor",
});
doctorModel.hasMany(prescriptionModel, { foreignKey: "doctorId" });

// export model
module.exports = prescriptionModel;
