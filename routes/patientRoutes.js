const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getAllDoctorsController,
  updatePatientProfileController,
  getPatientInfoController,
  bookAppointmentController,
  bookingAvailabilityController,
  pastAppointmentsController,
  futureAppointmentsController,
} = require("../controllers/patientCtrl");

//router object
const router = express.Router();

// update profile || post
router.post("/updateProfile", authMiddleware, updatePatientProfileController);

//get all doctors data || GET
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

//get patient information || GET
router.get("/getPatientInfo", authMiddleware, getPatientInfoController);

//BOOK APPOINTMENT || POST
router.post("/book-appointment", authMiddleware, bookAppointmentController);

//Booking Avliability || GET
router.get(
  "/booking-availbility",
  authMiddleware,
  bookingAvailabilityController
);
// past appointments || GET
router.get("/past-appointments", authMiddleware, pastAppointmentsController);

// future appointments || GET
router.get(
  "/future-appointments",
  authMiddleware,
  futureAppointmentsController
);

module.exports = router;
