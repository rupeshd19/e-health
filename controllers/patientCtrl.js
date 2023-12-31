const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const sequelize = require("sequelize");
const axios = require("axios");
const { response } = require("express");
dotenv.config({
  path: "./routes/.env",
});

function generateTimeSlots(
  openTime,
  closeTime,
  slotDuration,
  startTimeList,
  today
) {
  const slots = [];

  // Parse openTime and closeTime strings to Date objects
  const openDateTime = new Date(`1970-01-01T${openTime}`);
  const closeDateTime = new Date(`1970-01-01T${closeTime}`);

  // Calculate the number of milliseconds in the slot duration
  const slotDurationMs = slotDuration * 60 * 1000;
  const now = new Date(); // Get the current date and time
  let presentTimeString = now.toTimeString().slice(0, 8);
  //  Get the minutes and pad with leading zero if needed
  // presentTime = new Date(`1970-01-01T${presentTime}`);

  // Initialize the current time to the open time
  let currentTime = openDateTime;

  while (currentTime < closeDateTime) {
    const endTime = new Date(currentTime.getTime() + slotDurationMs);

    const startTimeString = currentTime.toTimeString().slice(0, 8); // Extract 'HH:mm:ss'
    const endTimeString = endTime.toTimeString().slice(0, 8); // Extract 'HH:mm:ss'

    // Check if the startTime is in the startTimeList
    if (!startTimeList.includes(startTimeString)) {
      if (!(today && presentTimeString > startTimeString)) {
        slots.push({
          startTime: startTimeString.slice(0, 5),
          endTime: endTimeString.slice(0, 5),
        });
      }
    }

    // Move to the next slot
    currentTime = endTime;
  }

  return slots;
}

// get patient info
const getPatientInfoController = async (req, res) => {
  try {
    const patient = await userModel.findOne({
      attributes: ["id", "name", "phone", "email", "pastDiseases"],
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
    const whereClause = {};
    // add verified doctor filter
    whereClause.isVerified = true;
    // add location filer
    if (req.body.city) {
      whereClause.city = {
        [sequelize.Op.like]: `%${req.body.city}%`,
      };
    }
    // add speciality filter
    if (req.body.speciality) {
      whereClause.speciality = {
        [sequelize.Op.like]: `%${req.body.speciality}%`,
      };
    }
    // add pincode filter
    if (req.body.pincode) {
      whereClause.pincode = {
        [sequelize.Op.like]: `%${req.body.pincode}%`,
      };
    }
    // add max price filter
    if (req.body.maxPrice) {
      whereClause.price = {
        [sequelize.Op.lte]: req.body.maxPrice,
      };
    }
    // add gender filter this is not added yet
    if (req.body.gender) {
      whereClause.gender = req.body.gender;
    }
    console.log("where clause condtions are : ", whereClause);
    const doctors = await doctorModel.findAll({
      attributes: { exclude: ["password", "otp", "createdAt", "updatedAt"] },
      where: whereClause,
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
    const doctorId = req.body.doctorId;
    const date = req.body.date;
    const time = req.body.startTime;
    var currentDate = new Date();
    var providedDate = new Date(`${date}T${time}`);
    // the date and time should be beyond current time
    if (providedDate < currentDate) {
      return res.status(209).send({
        success: false,
        message: "plase provide future date and time",
      });
    }
    // fetch requested doctor details
    const doctor = await doctorModel.findOne({
      attributes: ["openTime", "closeTime", "slotDuration"],
      where: {
        id: doctorId,
        isVerified: true,
      },
    });
    // check if doctor exists or not
    if (!doctor) {
      return res.status(209).send({
        success: false,
        message: "selected doctor does not exist",
      });
    }
    // check whether selected time slot is within doctor timings
    const openDateTime = new Date(`1970-01-01T${doctor.openTime}`);
    const closeDateTime = new Date(`1970-01-01T${doctor.closeTime}`);
    const slotDateTime = new Date(`1970-01-01T${time}`);

    // Check if the slotDateTime is outside the range [openTime, closeTime - slotDuration]
    if (
      slotDateTime < openDateTime ||
      slotDateTime >=
        new Date(closeDateTime - doctor.slotDuration * 60 * 1000 + 1000)
    ) {
      return res.status(209).send({
        success: false,
        message: "Doctor is not available at this time",
      });
    }
    let lowerlimit = new Date(
      new Date(`${date}T${time}`).getTime() -
        doctor.slotDuration * 60 * 1000 +
        1000
    )
      .toTimeString()
      .slice(0, 8);
    let upperlimit = new Date(
      new Date(`${date}T${time}`).getTime() +
        doctor.slotDuration * 60 * 1000 -
        1000
    )
      .toTimeString()
      .slice(0, 8);

    // check if doctor has any other appointments on selected date and time
    const existingAppointments = await appointmentModel.findOne({
      attributes: ["id"],
      where: {
        doctorId,
        date: new Date(date),
        startTime: {
          [sequelize.Op.between]: [lowerlimit, upperlimit],
        },
      },
    });
    //if yes return false
    if (existingAppointments) {
      return res.status(209).send({
        success: false,
        message: "slot is not available, check available slots",
      });
    }
    // create an appointment
    await appointmentModel.create({ ...req.body, patientId: req.userId });
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
    await appointmentModel.sync({ alter: true });
    const doctorId = req.body.doctorId;
    // check requested date should not be past date
    var currentDate = new Date();
    var providedDate = new Date(req.body.date);

    providedDate.setHours(currentDate.getHours() + 1);
    if (providedDate < currentDate) {
      return res.status(209).send({
        success: false,
        message: "Please provide future date",
      });
    }
    let today = false;
    if (currentDate.toDateString() == providedDate.toDateString()) {
      today = true;
    }
    // fetch doctor details
    const doctor = await doctorModel.findOne({
      attributes: ["openTime", "closeTime", "slotDuration"],
      where: { id: req.body.doctorId, isVerified: true },
    });
    // if doctor not found return
    if (!doctor) {
      return res.status(400).send({
        success: false,
        message: "doctor not found",
      });
    }

    // fetch startTime of all booked slots for a doctor on a given date
    const existingAppointments = await appointmentModel.findAll({
      attributes: ["startTime"],
      where: {
        doctorId,
        date: new Date(req.body.date),
      },
    });
    // save startTime of booked slot in startTimeList
    const startTimeList = existingAppointments.map(
      (appointment) => appointment.startTime
    );
    // generate all  available slots
    const allSlots = generateTimeSlots(
      doctor.openTime,
      doctor.closeTime,
      doctor.slotDuration,
      startTimeList,
      today
    );
    return res.status(200).send({
      success: true,
      message: "here is list of available slots",
      data: allSlots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error in booking",
    });
  }
};
const pastAppointmentsController = async (req, res) => {
  try {
    const patientId = req.userId;
    const pastAppointments = await appointmentModel.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      where: {
        patientId: patientId,
        status: "completed",
      },
      include: [
        {
          model: doctorModel,
          attributes: [
            "name",
            "phone",
            "email",
            "city",
            "pincode",
            "speciality",
            "experience",
          ],
          association: appointmentModel.belongsTo(doctorModel, {
            foreignKey: "doctorId",
          }),
        },
      ],
    });
    // sorting in decreasing order
    pastAppointments.sort((a, b) => {
      // Compare dates in descending order
      const dateComparison =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }

      // If dates are equal, compare startTimes in descending order
      const startTimeA = b.startTime.split(":").join("");
      const startTimeB = a.startTime.split(":").join("");

      return startTimeA.localeCompare(startTimeB);
    });

    return res.status(200).send({
      success: true,
      data: pastAppointments,
      message: "all past appointments are ",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error,
      message: "error in fetching past appointments",
    });
  }
};

const futureAppointmentsController = async (req, res) => {
  try {
    const patientId = req.userId;
    const futureAppointments = await appointmentModel.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      where: {
        patientId: patientId,
        status: ["pending", "running"],
      },
      include: [
        {
          model: doctorModel,
          attributes: [
            "name",
            "phone",
            "email",
            "city",
            "pincode",
            "speciality",
            "experience",
          ],
          association: appointmentModel.belongsTo(doctorModel, {
            foreignKey: "doctorId",
          }),
        },
      ],
    });
    // sort in increasing order
    futureAppointments.sort((a, b) => {
      // Compare dates
      const dateComparison =
        new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }

      // If dates are equal, compare startTimes
      const startTimeA = a.startTime.split(":").map(Number);
      const startTimeB = b.startTime.split(":").map(Number);

      for (let i = 0; i < startTimeA.length; i++) {
        if (startTimeA[i] !== startTimeB[i]) {
          return startTimeA[i] - startTimeB[i];
        }
      }

      return 0; // Dates and startTimes are equal
    });
    return res.status(200).send({
      success: true,
      data: futureAppointments,
      message: "all future appointments are ",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      error,
      message: "error in fetching future appointments",
    });
  }
};
// future appoinments controller ends

// JOIN VC controller starts
const joinVcController = async (req, res) => {
  try {
    const patientId = req.userId;
    const appointmentId = req.body.appointmentId;
    // check wheher the doctor is authorised to end requested vc
    const appointment = await appointmentModel.findOne({
      attributes: ["id", "patientId", "attendeePass", "vclink"],
      where: { id: appointmentId, patientId: patientId },
      include: [
        {
          model: userModel,
          attributes: ["name", "phone"],
          as: "patient", // Use the alias you want for the patient association
        },
      ],
    });
    // check whther such appointment exist or not
    if (!appointment) {
      return res.status(209).send({
        success: false,
        message: "no appointment found for requested appointmentId",
      });
    }
    // check if meeting is created or not
    if (!appointment.attendeePass) {
      return res.status(209).send({
        success: false,
        message: "meeting is not created yet",
      });
    }
    //   join vc request  params
    const params = {
      requestName: "joinVC",
      meetingID: appointment.patient.phone,
      attendeePass: appointment.attendeePass,
      joinName: appointment.patient.name,
      apiKey: process.env.VC_KEY,
    };
    // send join VC request on samvad server
    const response = await axios
      .post(process.env.VC_URL, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .catch(function (err) {
        console.log(err);
      });
    // console.log(params);
    // save the vc link for patient in data base
    appointment.vclink = {
      ...appointment.vclink,
      patientLink: response.data.joinUrl,
    };
    try {
      await appointment.save();
    } catch (error) {
      console.log("my eeror is : ", error);
      return res.status(209).send({
        success: false,
        message: "error in updating joining link",
        error,
      });
    }

    // if error send response message directly
    console.log("my response from join request", response.data);
    if (response.data.statusCode != 200) {
      return res.status(response.data.statusCode).send({
        success: !response.data.isError,
        message: response.data.message,
        vclink: response.data.joinUrl,
      });
    }
    return res.status(response.data.statusCode).send({
      success: !response.data.isError,
      message: " You can join now",
      vclink: response.data.joinUrl,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "unable to join meeting",
      error,
    });
  }
};

module.exports = {
  getAllDoctorsController,
  updatePatientProfileController,
  getPatientInfoController,
  bookAppointmentController,
  bookingAvailabilityController,
  pastAppointmentsController,
  futureAppointmentsController,
  joinVcController,
};
