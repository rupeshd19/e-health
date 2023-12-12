const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config({
  path: "./routes/.env",
});
// doctor will save prescription of patient corresponding to an appointment
const savePrescriptionController = async (req, res) => {
  try {
    const doctorId = req.userId;
    const patientId = req.body.patientId;
    const appoinmentId = req.body.appoinmentId;
    const doctorNote = req.body.note;
    const medicines = req.body.medicines;
    // check wheher the doctor is authorised to save the prescription
    try {
      const appointment = await appointmentModel.findOne({
        attributes: ["id"],
        where: { id: appoinmentId, doctorId: doctorId, patientId: patientId },
      });
    } catch (error) {
      console.log(error);
    }
    console.log("my appointment is : ", appointment);
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
