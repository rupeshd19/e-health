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
  joinVcController,
} = require("../controllers/patientCtrl");
const {
  previousPrescriptionsController,
  getPdfController,
} = require("../controllers/prescriptionCtrl");

//router object
const router = express.Router();

// update profile || post
router.post("/updateProfile", authMiddleware, updatePatientProfileController);

//get all doctors data || POST
router.post("/getAllDoctors", authMiddleware, getAllDoctorsController);

//get patient information || GET
router.get("/getPatientInfo", authMiddleware, getPatientInfoController);

//BOOK APPOINTMENT || POST
router.post("/book-appointment", authMiddleware, bookAppointmentController);

//Booking Avliability || POST
router.post(
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
// POST join meeting as per appointmnet
router.post("/join-vc", authMiddleware, joinVcController);

// POST get previous prescriptions
router.post(
  "/get-previous-prescriptions",
  authMiddleware,
  previousPrescriptionsController
);

// POST get prescription pdf via link
router.post("/get-prescription-pdf", authMiddleware, getPdfController);
module.exports = router;
