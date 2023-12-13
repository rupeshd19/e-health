const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const medicineModel = require("../models/medicineModel");
const userModel = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config({
  path: "./routes/.env",
});

// doctor will save prescription of patient corresponding to an appointment
const savePrescriptionController = async (req, res) => {
  try {
    await medicineModel.sync({ alter: true });
    const doctorId = req.userId;
    const patientId = req.body.patientId;
    const appointmentId = req.body.appointmentId;
    const doctorNote = req.body.note;
    var medicines = req.body.medicines;
    // check wheher the doctor is authorised to save the prescription
    const appointment = await appointmentModel.findOne({
      attributes: ["id"],
      where: { id: appointmentId, doctorId: doctorId, patientId: patientId },
    });
    // check if request is valid or not
    if (!appointment) {
      return res.status(400).send({
        success: false,
        message: "error in fetching data",
      });
    }
    // create list of objects for medicines
    medicines.array.forEach((element) => {
      element.appointmentId = appointmentId;
    });
    // insert data using bulkcreate method to store multiple data at a time
    medicineModel
      .bulkCreate(medicines)
      .then((medicine) => {
        console.log("Medicines inserted successfully:", medicine);
      })
      .catch((error) => {
        console.error("Error inserting medicines:", error);
      });
    // send success message
    return res.status(200).send({
      success: true,
      message: "saved successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "error in saving prescription ",
      error,
    });
  }
};

// export controllers
module.exports = { savePrescriptionController };
