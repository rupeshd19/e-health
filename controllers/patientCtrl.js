const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const sequelize = require("sequelize");
dotenv.config({
  path: "./routes/.env",
});
const dayjs = require("dayjs");
// get patient info
const getPatientInfoController = async (req, res) => {
  try {
    const patient = await userModel.findOne({
      where: { id: req.userId },
    });
    res.status(200).send({
      success: true,
      message: "Patient data fetch success",
      data: patient,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching patient details",
    });
  }
};

// update patient/doctor profile controller
const updatePatientProfileController = async (req, res) => {
  try {
    const patient = await userModel.findByPk(req.userId);
    if (!patient) {
      return res.status(200).send({
        message: "user not found, with user id " + req.userId,
        success: false,
      });
    }
    patient.name = req.body.name;
    patient.phone = req.body.phone;
    patient.pastDiseases = req.body.pastDiseases;

    await patient.save();
    res.status(200).send({
      success: true,
      message: " profile updated successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "error in updating profile ",
      error,
    });
  }
};

// GET ALL DOCTORS
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.findAll({
      // where: { status: "approved" },
      where: { isVerified: true },
    });
    res.status(200).send({
      success: true,
      message: "Here is all doctors",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Fetching Doctor",
    });
  }
};

// BOOK APPOINTMENT
const bookAppointmentController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({
      attributes: ["openTime", "closeTime"],
      where: { id: req.body.doctorId },
    });
    const newAppointment = await appointmentModel.create(req.body);
    // send notification to doctor|| optional
    // const doctor = await doctorModel.findByPk(req.body.doctorInfo.userId);
    // user.notification.push({
    //   type: "New-appointment-request",
    //   message: `A New Appointment Request from ${req.body.userInfo.name}`,
    //   onClickPath: "/patient/appointments",
    // });
    // await doctor.save();

    res.status(200).send({
      success: true,
      message: "Appointment Booked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }
};

// Booking Availability Controller
const bookingAvailabilityController = async (req, res) => {
  try {
    await appointmentModel.sync();
    // Convert datetime string to Date object
    const selectedDateTime = req.body.datetime;
    // Extract time and date components
    // DateFormat formatter = new SimpleDateFormat("HH:mm");
    const selectedTime = selectedDateTime.split("T")[1];
    const selectedDate = selectedDateTime.split("T")[0];

    // Check if patient selected beyond doctor's open and close timings
    if (
      selectedTime < req.body.openTime ||
      selectedTime >= req.body.closeTime
    ) {
      return res.status(202).json({
        success: false,
        message: "Doctor is not available at this time.",
      });
    }
    // Check for existing appointments at the selected time
    const fromTime = moment(selectedTime, "HH:mm")
      .subtract(1, "hours")
      .format("hh:mm");

    const toTime = moment(selectedTime, "HH:mm")
      .add(1, "hours")
      .format("hh:mm");
    console.log(fromTime, toTime, "deepak", typeof fromTime);
    const doctorId = req.body.doctorId;
    const existingAppointments = await appointmentModel.findOne({
      doctorId,
      date: new Date(selectedDate),
      startTime: {
        $gte: fromTime,
        $lte: toTime,
      },
    });

    console.log("appointments : ", existingAppointments.id);
    if (existingAppointments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Yes, the current slot is available.",
      });
    } else {
      return res.status(409).json({
        success: false,
        message: "Slot is not available.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error in booking",
    });
  }
};

module.exports = {
  getAllDoctorsController,
  updatePatientProfileController,
  getPatientInfoController,
  bookAppointmentController,
  bookingAvailabilityController,
};
