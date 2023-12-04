const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({
  path: "./routes/.env",
});
// send otp via mail
async function sendOTPByEmail(email, otp) {
  // Create a nodemailer transporter using your email service credentials
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "doctorapp1978@gmail.com", // Your email address
      pass: "kaqt covm slxn psgz", // Your email password or app-specific password
    },
  });

  // Define the email options
  const mailOptions = {
    from: "doctorapp1978@gmail.com", // Sender's email address
    to: email, // Recipient's email address
    subject: "OTP Verification", // Email subject
    text: `Your OTP is: ${otp}`, // Email body
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    return 1;
  }
  return 0;
}

// Register callback
const registerController = async (req, res) => {
  try {
    if (req.body.isPatient) {
      await userModel.sync();
      const existingUser = await userModel.findOne({
        where: { email: req.body.email },
      });
      if (existingUser && existingUser.isVerified == 1) {
        return res.status(200).send({
          message: "already verified , go to login page",
          success: false,
        });
      }
      if (existingUser) {
        var otp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.otp = otp;
        const temp = await sendOTPByEmail(req.body.email, otp);
        if (temp) {
          return res.status(500).send({
            success: false,
            message: "can not send email, please check the email",
          });
        }
        await existingUser.save();
        return res.status(201).send({ message: "verify again", success: true });
      }

      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      req.body.password = hashedPassword;
      var otp = Math.floor(100000 + Math.random() * 900000).toString();
      //send opt by email
      const temp = await sendOTPByEmail(req.body.email, otp);
      if (temp) {
        return res.status(500).send({
          success: false,
          message: "can not send email, please check the email",
        });
      }
      const newUser = await userModel.create({
        ...req.body,
        otp: otp,
      });
    } else {
      // for doctor registration
      await doctorModel.sync();
      const existingDoctor = await doctorModel.findOne({
        where: { email: req.body.email },
      });
      if (existingDoctor && existingDoctor.isVerified == 1) {
        return res.status(200).send({
          message: " doctor is already verified , go to login page",
          success: false,
        });
      }
      if (existingDoctor) {
        var otp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.otp = otp;
        const temp = await sendOTPByEmail(req.body.email, otp);
        if (temp) {
          return res.status(500).send({
            success: false,
            message: "can not send email, please check the email id",
          });
        }
        await existingDoctor.save();
        return res
          .status(201)
          .send({ message: "verify the doctor again", success: true });
      }

      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      req.body.password = hashedPassword;
      var otp = Math.floor(100000 + Math.random() * 900000).toString();
      //send opt by email
      const temp = await sendOTPByEmail(req.body.email, otp);
      if (temp) {
        return res.status(500).send({
          success: false,
          message: "can not send email, please check the email",
        });
      }
      const newUser = await doctorModel.create({
        ...req.body,
        otp: otp,
      });
    }
    // else for doctor ends here

    res
      .status(201)
      .send({ message: " Registered Successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

// verify user registration
const registerVerifyController = async (req, res) => {
  try {
    var table;
    if (req.body.isPatient) {
      table = userModel;
    } else {
      table = doctorModel;
    }
    user = await table.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    if (user.isVerified) {
      return res.status(200).send({
        message: "user is already verified , go to login page",
        success: false,
      });
    }
    if (req.body.otp != user.otp) {
      return res.status(200).send({
        message: "Invalid credentials , please check your mail",
        success: false,
      });
    }

    user.otp = null;
    user.isVerified = true;
    await user.save();

    res.status(201).send({
      success: true,
      message: " account is verified",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: `Error in user verification  CTRL ${error.message}`,
    });
  }
};

// Login callback
const loginController = async (req, res) => {
  try {
    var table;
    if (req.body.isPatient) {
      table = userModel;
    } else {
      table = doctorModel;
    }
    const user = await table.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    if (!user.isVerified) {
      return res.status(200).send({
        message: "user otp not verified ",
        success: false,
        redirect: "/api/v1/user/register-verify",
      });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid Email or Password", success: false });
    }

    const token = jwt.sign(
      { id: user.id, isPatient: req.body.isPatient },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res
      .status(200)
      .send({ message: "Login Success", success: true, token, id: user.id });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};
// get personal data
const authController = async (req, res) => {
  try {
    var table;
    if (req.isPatient) {
      table = userModel;
    } else {
      table = doctorModel;
    }
    const user = await table.findByPk(req.userId);

    if (!user) {
      return res.status(200).send({
        message:
          "requested user is not found in database, with user id " + req.userId,
        success: false,
      });
    } else {
      user.password = undefined;
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Auth error",
      success: false,
      error,
    });
  }
};
// update patient/doctor profile controller
const updatePatientProfileController = async (req, res) => {
  try {
    var table;
    if (req.isPatient) {
      table = userModel;
    } else {
      table = doctorModel;
    }
    const user = await table.findByPk(req.userId);
    if (!user) {
      return res.status(200).send({
        message: "user not found, with user id " + req.userId,
        success: false,
      });
    }
    user.name = req.body.name;
    user.phone = req.body.phone;
    if (req.isPatient) {
      //update patient data
      user.pastDiseases = req.body.pastDiseases;
    } else {
      //update doctor data
      user.address = req.body.address;
      user.specialization = req.body.specialization;
      user.experience = req.body.experience;
      user.feesPerConsultation = req.body.feesPerConsultation;
      user.timings = req.body.timings;
    }

    await user.save();
    res.status(200).send({
      success: true,
      message: " profile updated successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "error in updating profile ",
      error,
    });
  }
};

//  Apply Doctor CTRL
// thsi is integrated in register controller itself
const applyDoctorController = async (req, res) => {
  try {
    const user = await userModel.findByPk(req.userId);
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "user not found",
      });
    }
    // else if (user.isPatient) {
    //   // user registered for patient can not apply for doctor
    //   return res.status(200).send({
    //     success: false,
    //     message:
    //       "you are not eligible to apply for doctor, please  register as a  doctor",
    //   });
    // }
    console.log("id of applying doctor", user.id, req.userId);
    const newDoctor = await doctorModel.create(
      Object.assign(
        {
          doctorId: req.userId,
          email: user.email,
        },
        req.body
      )
    );
    // const adminUser = await userModel.findOne({ where: { isAdmin: true } });
    // const notification = adminUser.notification || [];
    // notification.push({
    //   type: "apply-doctor-request",
    //   message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
    //   data: {
    //     doctorId: newDoctor._id,
    //     name: newDoctor.firstName + " " + newDoctor.lastName,
    //     onClickPath: "/admin/doctors",
    //   },
    // });
    // await userModel.update({ notification }, { where: { _id: adminUser._id } });
    // res.status(201).send({
    //   success: true,
    //   message: "Doctor Account Applied Successfully",
    // });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Applying For Doctor",
    });
  }
};

// Notification CTRL
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findByPk(req.body.userId);
    const seenNotification = user.seenNotification;
    const notification = user.notification;
    seenNotification.push(...notification);
    user.notification = [];
    user.seenNotification = notification;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

// Delete notifications
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findByPk(req.body.userId);
    user.notification = [];
    user.seenNotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Unable to delete all notifications",
      error,
    });
  }
};

// GET ALL DOCTORS
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.findAll({
      // where: { status: "approved" },
      where: { isVerified },
    });
    res.status(200).send({
      success: true,
      message: "Doctors Lists Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Fetching Doctor",
    });
  }
};

// BOOK APPOINTMENT
const bookAppointmentController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";

    const newAppointment = await appointmentModel.create(req.body);
    const user = await userModel.findByPk(req.body.doctorInfo.userId);
    user.notification.push({
      type: "New-appointment-request",
      message: `A New Appointment Request from ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments",
    });
    await user.save();

    res.status(200).send({
      success: true,
      message: "Appointment Booked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }
};

// Booking Availability Controller
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;

    const appointments = await appointmentModel.findAll({
      where: {
        doctorId,
        date,
        time: {
          $gte: fromTime,
          $lte: toTime,
        },
      },
    });

    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not Available at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.findAll({
      where: { userId: req.body.userId },
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};

module.exports = {
  loginController,
  registerController,
  authController,
  updatePatientProfileController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
  registerVerifyController,
};
