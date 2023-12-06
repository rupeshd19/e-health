const express = require("express");
const {
  getDoctorInfoController,
  getDoctorByIdController,
  updateStatusController,
  updateDoctorProfileController,
  pastAppointmentsController,
  futureAppointmentsController,
} = require("../controllers/doctorCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
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

//POST Update Status
router.post("/update-status", authMiddleware, updateStatusController);

module.exports = router;
