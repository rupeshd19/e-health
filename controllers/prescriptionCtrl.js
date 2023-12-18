const { model } = require("mongoose");
const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const medicineModel = require("../models/medicineModel");
const userModel = require("../models/userModel");
const dotenv = require("dotenv");
const sequelize = require("../models/index");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
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
      where: {
        id: appointmentId,
        doctorId: doctorId,
        patientId: patientId,
        status: ["pending", "running"],
      },
    });
    // check if request is valid or not
    if (!appointment) {
      return res.status(400).send({
        success: false,
        message: "error in fetching data",
      });
    }
    // create list of objects for medicines
    medicines.forEach((element) => {
      element.appointmentId = appointmentId;
    });
    // insert data using bulkcreate method to store multiple data at a time
    try {
      await sequelize.transaction(async (t) => {
        // Delete previous medicines associated with the appointment
        await medicineModel.destroy({
          where: { appointmentId: appointmentId },
          transaction: t,
        });

        // Insert new medicines
        await medicineModel.bulkCreate(medicines, { transaction: t });

        // Update the doctor note in the appointment
        await appointmentModel.update(
          { doctorNote: doctorNote },
          { where: { id: appointmentId }, transaction: t }
        );
      });
      console.log("Prescription updated successfully");
    } catch (error) {
      console.error("Error updating prescription:", error);
    }
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

// get previous prescriptions at patient side || POST
const previousPrescriptionsController = async (req, res) => {
  try {
    const patientId = req.userId;
    // get all appointments
    const appointments = await appointmentModel
      .findAll({
        attributes: [
          [sequelize.literal("SUBSTRING(`date`, 1, 10)"), "date"],
          "startTime",
          ["note", "patientNote"],
          "doctorNote",
          "prescription",
        ],
        where: {
          patientId: patientId,
          status: "completed",
        },
        include: [
          {
            model: medicineModel,
            attributes: ["medicineName", "dosage", "duration"],
            as: "medicines",
          },
          {
            model: userModel,
            attributes: ["name", "phone", "email"],
            as: "patient",
          },
          {
            model: doctorModel,
            attributes: [
              "name",
              "phone",
              "email",
              "address",
              "speciality",
              "experience",
              "price",
            ],
            as: "doctor",
          },
        ],
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
      });
    // if no appointments exist
    if (!appointments.length) {
      return res.status(400).send({
        success: false,
        message: "no appointments exist",
      });
    }

    console.log(appointments);
    // return success message
    return res.status(200).send({
      success: true,
      message: "here is your's all past precription",
      data: appointments,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "error in fetching previous prescriptions",
      error,
    });
  }
};

//  getPreviousPrescriptionsController at doctor side
const getPreviousPrescriptionsController = async (req, res) => {
  try {
    //save body paramters
    const doctorId = req.userId;
    const patientId = req.body.patientId;
    // check if appointment exist for given patient
    const appointments = await appointmentModel.findAll({
      attributes: [
        [sequelize.literal("SUBSTRING(`date`, 1, 10)"), "date"],
        ["note", "patientNote"],
        "doctorNote",
        "startTime",
        "endTime",
      ],
      where: { doctorId: doctorId, patientId: patientId, status: "completed" },
      include: [
        {
          model: medicineModel,
          attributes: ["medicineName", "dosage", "duration"],
          as: "medicines",
        },
      ],
    });
    // return if no appointments
    if (!appointments.length) {
      return res.status(400).send({
        success: false,
        message: "no prescriptions exist",
      });
    }
    // return sappointments
    return res.status(200).send({
      success: true,
      message: "all prescriptions are ",
      data: appointments,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in fetching patinet's previous prescriptions",
      error,
    });
  }
};

// export controllers
module.exports = {
  savePrescriptionController,
  previousPrescriptionsController,
  getPreviousPrescriptionsController,
};
