const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const appointmentModel = require("./appointmentModel");
const medicineModel = sequelize.define("medicineModel", {
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: appointmentModel,
      key: "id",
    },
  },
  medicineName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// establish relation with  appointmentModel
medicineModel.belongsTo(userModel, {
  foreignKey: "appointmentId",
  as: "appointment",
});
appointmentModel.hasMany(medicineModel, { foreignKey: "appointmentId" });

// export model
module.exports = medicineModel;
