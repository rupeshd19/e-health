const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");

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
const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    await AppointmentModel.update(
      { status },
      { where: { id: appointmentsId } }
    );

    const user = await UserModel.findOne({
      where: { id: appointments.userId },
    });
    const notification = user.notification || [];
    notification.push({
      type: "status-updated",
      message: `Your appointment has been updated ${status}`,
      onClickPath: "/doctor-appointments",
    });

    await user.update({ notification });

    res.status(200).send({
      success: true,
      message: "Appointment status updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating appointment status",
    });
  }
};

module.exports = {
  getDoctorInfoController,
  updateDoctorProfileController,
  getDoctorByIdController,
  pastAppointmentsController,
  futureAppointmentsController,
  updateStatusController,
};
