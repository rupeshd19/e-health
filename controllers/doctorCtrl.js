const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config({
  path: "./routes/.env",
});
// get doctor info
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({
      attributes: {
        exclude: ["password", "isVerified", "otp", "createdAt", "updatedAt"],
      },
      where: { id: req.userId },
    });
    res.status(200).send({
      success: true,
      message: "Doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching doctor details",
    });
  }
};

// update doctor profile
const updateDoctorProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.update(req.body, {
      attributes: {
        exclude: ["password", "isVerified", "otp", "createdAt", "updatedAt"],
      },
      where: { id: req.userId },
    });
    res.status(201).send({
      success: true,
      message: "Doctor profile updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Doctor profile update issue",
      error,
    });
  }
};

// get single doctor by id
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({
      attributes: {
        exclude: ["password", "isVerified", "otp", "createdAt", "updatedAt"],
      },
      where: { id: req.body.doctorId },
    });
    res.status(200).send({
      success: true,
      message: "Single Doctor info fetched",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching single doctor info",
    });
  }
};

// get doctor's all  appointments
const pastAppointmentsController = async (req, res) => {
  try {
    const doctorId = req.userId;
    const pastAppointments = await appointmentModel.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      where: { status: "completed" },
    });
    return res.status(200).send({
      success: true,
      message: "all past appointements ",
      pastAppointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching doctor's past appointments",
    });
  }
};

// get doctor's all  appointments
const futureAppointmentsController = async (req, res) => {
  try {
    const doctorId = req.userId;
    const futureAppointments = await appointmentModel.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      where: { status: "pending" },
    });
    return res.status(200).send({
      success: true,
      message: "all future appointements ",
      futureAppointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching doctor's future appointments",
    });
  }
};

// update appointment status
const confirmAppointmentController = async (req, res) => {
  try {
    const appointmentId = req.body;
    // write logic that we recieved payment from patient for this appointment
    await appointmentModel.update(
      { status: "confirmed" },
      { where: { id: appointmentId } }
    );
    res.status(200).send({
      success: true,
      message: "Appointment status is confirmed",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in confirming  appointment ",
    });
  }
};
// code for doctor to launch/ craete virtual confrence
const createVcController = async (req, res) => {
  try {
    const meetingId = patient.phone;
    const meetingName = `${patient.name} Room`;
    const modPass = "12345";
    const attendeePass = "54321";
    const joinName = doctor.password;
    const apiKey = process.env.VC_Key;
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "error in creating VC, retry again",
      error,
    });
  }
};

module.exports = {
  getDoctorInfoController,
  updateDoctorProfileController,
  getDoctorByIdController,
  pastAppointmentsController,
  futureAppointmentsController,
  confirmAppointmentController,
  createVcController,
};
