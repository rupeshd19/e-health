const express = require("express");
const {
  getDoctorInfoController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
  updateDoctorProfileController,
} = require("../controllers/doctorCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

//GET SINGLE DOC INFO
router.get("/getDoctorInfo", authMiddleware, getDoctorInfoController);

//POST UPDATE PROFILE
router.post("/updateProfile", authMiddleware, updateDoctorProfileController);

// GET SINGLE DOC INFO
router.get("/getDoctorById", authMiddleware, getDoctorByIdController);

//GET Appointments
router.get(
  "/doctor-appointments",
  authMiddleware,
  doctorAppointmentsController
);

//POST Update Status
router.post("/update-status", authMiddleware, updateStatusController);

module.exports = router;
