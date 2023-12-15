const express = require("express");
const {
  getDoctorInfoController,
  getDoctorByIdController,
  updateStatusController,
  updateDoctorProfileController,
  pastAppointmentsController,
  futureAppointmentsController,
  confirmAppointmentController,
  createVcController,
  endVcController,
} = require("../controllers/doctorCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  savePrescriptionController,
  getPreviousPrescriptionsController,
} = require("../controllers/prescriptionCtrl");
const { get } = require("mongoose");
const router = express.Router();

//GET SINGLE DOC INFO
router.get("/getDoctorInfo", authMiddleware, getDoctorInfoController);

//POST UPDATE PROFILE
router.post("/updateProfile", authMiddleware, updateDoctorProfileController);

// GET SINGLE DOC INFO
router.get("/getDoctorById", authMiddleware, getDoctorByIdController);

//GET past Appointments
router.get("/past-appointments", authMiddleware, pastAppointmentsController);

//GET future Appointments
router.get(
  "/future-appointments",
  authMiddleware,
  futureAppointmentsController
);

//POST confirm appointment
router.post(
  "/confirm-appointment",
  authMiddleware,
  confirmAppointmentController
);
// POST create vritual conference
router.post("/create-vc", authMiddleware, createVcController);

//POST end Virtual conference
router.post("/end-vc", authMiddleware, endVcController);

// POST save prescription
router.post("/save-prescription", authMiddleware, savePrescriptionController);

// POST get previous prescriptions of a patient
router.post(
  "/get-previous-prescriptions",
  authMiddleware,
  getPreviousPrescriptionsController
);

module.exports = router;
