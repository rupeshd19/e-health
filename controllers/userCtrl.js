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
    const user = await table.findOne({
      attributes: {
        exclude: [
          "otp",
          "notification",
          "seenNotification",
          "createdAt",
          "updatedAt",
        ],
      },
      where: { email: req.body.email },
    });
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
    user.password = undefined;
    user.isVerified = undefined;
    res.status(200).send({
      message: "Login Success",
      success: true,
      token,
      userId: user.id,
      userInfo: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
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
  getAllNotificationController,
  deleteAllNotificationController,
  userAppointmentsController,
  registerVerifyController,
};
