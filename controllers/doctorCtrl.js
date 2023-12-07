const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");
const dotenv = require("dotenv");
dotenv.config({
  path: "./routes/.env",
});
const axios = require("axios");
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
      include: [
        {
          model: userModel,
          attributes: ["name", "phone", "email", "pastDiseases"],
          association: appointmentModel.belongsTo(userModel, {
            foreignKey: "patientId",
          }),
        },
      ],
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
      include: [
        {
          model: userModel,
          attributes: ["name", "phone", "email", "pastDiseases"],
          association: appointmentModel.belongsTo(userModel, {
            foreignKey: "patientId",
          }),
        },
      ],
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
    // request params
    const doctorId = req.userId;
    const appointmentId = req.body.appointmentId;
    // check whether the doctor is as per requested appointmentId

    const appointment = await appointmentModel.findOne({
      attributes: ["id", "doctorId", "patientId"],
      where: { id: appointmentId, doctorId: doctorId },
      include: [
        {
          model: doctorModel,
          attributes: ["name"],
          as: "doctor", // Use the alias you want for the doctor association
        },
        {
          model: userModel,
          attributes: ["phone"],
          as: "patient", // Use the alias you want for the patient association
        },
      ],
    });
    if (!appointment) {
      return res.status(209).send({
        success: false,
        message: "no appointment found for requested appointmentId",
      });
    }
    // geneate password for moderator
    const modPass = Math.floor(100000 + Math.random() * 900000).toString();
    const attendeePass = Math.floor(100000 + Math.random() * 900000).toString();

    //   vc create params
    const params = {
      requestName: "createVC",
      meetingID: "9754264090", //appointment.patient.phone,
      meetingName: appointment.doctor.name + "Room ",
      modPass: modPass,
      attendeePass: attendeePass,
      joinName: appointment.doctor.name,
      apiKey: process.env.VC_KEY,
    };
    // console.log("request url: ", process.env.VC_URL);
    // console.log("requested params : ", params);
    const response = await axios
      .post(process.env.VC_URL, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .catch(function (err) {
        console.log(err);
      });
    if (response.data.isError) {
      // update appointment table and save modPass and attendeePass
      try {
        await appointmentModel.update(
          {
            modPass: modPass,
            attendeePass: attendeePass,
          },
          {
            where: { id: appointmentId },
          }
        );
      } catch (error) {
        res.status(209).send({
          success: false,
          message: "error in updating appointment credentials",
          error,
        });
      }
    }
    if (response.data.statusCode != 200) {
      return res.status(response.data.statusCode).send({
        success: !response.data.isError,
        message: response.data.message,
        vclink: response.data.joinUrl,
      });
    }
    return res.status(response.data.statusCode).send({
      success: !response.data.isError,
      message: "meeting created , you can join now",
      vclink: response.data.joinUrl,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "error in creating VC, retry again",
      error,
    });
  }
};
// create vc end
//endVC controller

module.exports = {
  getDoctorInfoController,
  updateDoctorProfileController,
  getDoctorByIdController,
  pastAppointmentsController,
  futureAppointmentsController,
  confirmAppointmentController,
  createVcController,
};
