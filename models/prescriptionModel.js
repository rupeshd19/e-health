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

// prescriptionModel.belongsTo(appointmentModel);
// appointmentModel.hasOne(prescriptionModel);
module.exports = prescriptionModel;
