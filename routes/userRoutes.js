const express = require("express");
const {
  loginController,
  registerController,
  getAllNotificationController,
  deleteAllNotificationController,
  userAppointmentsController,
  registerVerifyController,
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);
// register verify || POST
router.post("/register-verify", registerVerifyController);

//Notifiaction  Doctor || POST
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
//Notifiaction  Doctor || POST
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

//Appointments List
router.get("/user-appointments", authMiddleware, userAppointmentsController);

module.exports = router;
