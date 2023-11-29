const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");

// get doctor info
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await DoctorModel.findOne({
      where: { userId: req.body.userId },
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
const updateProfileController = async (req, res) => {
  try {
    const doctor = await DoctorModel.update(req.body, {
      where: { userId: req.body.userId },
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
    const doctor = await DoctorModel.findOne({
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

// get doctor appointments
const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await DoctorModel.findOne({
      where: { userId: req.body.userId },
    });
    const appointments = await AppointmentModel.findAll({
      where: { doctorId: doctor.id },
    });
    res.status(200).send({
      success: true,
      message: "Doctor appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching doctor appointments",
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
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
};
