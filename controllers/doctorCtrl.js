const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");
const dotenv = require("dotenv");
const path = require("path");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const crypto = require("crypto");
dotenv.config({
  path: "./routes/.env",
});
const axios = require("axios");
const sequelize = require("../models/index");
const medicineModel = require("../models/medicineModel");

// get doctor info
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({
      attributes: {
        exclude: ["password", "isVerified", "otp", "createdAt", "updatedAt"],
      },
      where: { id: req.userId },
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
const updateDoctorProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.update(req.body, {
      attributes: {
        exclude: ["password", "isVerified", "otp", "createdAt", "updatedAt"],
      },
      where: { id: req.userId },
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
    const doctor = await doctorModel.findOne({
      attributes: {
        exclude: ["password", "isVerified", "otp", "createdAt", "updatedAt"],
      },
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

// get doctor's all past  appointments
const pastAppointmentsController = async (req, res) => {
  try {
    const doctorId = req.userId;
    var pastAppointments = await appointmentModel.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "modPass", "attendeePass"],
      },
      where: { status: "completed" },
      include: [
        {
          model: userModel,
          attributes: ["name", "phone", "email", "pastDiseases"],
          association: appointmentModel.belongsTo(userModel, {
            foreignKey: "patientId",
          }),
        },
        {
          model: medicineModel,
          attributes: ["medicineName", "dosage", "duration"],
          as: "medicines",
        },
      ],
    });
    // sort in decreasing order
    pastAppointments.sort((a, b) => {
      // Compare dates in descending order
      const dateComparison =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }

      // If dates are equal, compare startTimes in descending order
      const startTimeA = b.startTime.split(":").join("");
      const startTimeB = a.startTime.split(":").join("");

      return startTimeA.localeCompare(startTimeB);
    });
    return res.status(200).send({
      success: true,
      message: "all past appointements ",
      pastAppointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching doctor's past appointments",
    });
  }
};

// get doctor's all  appointments
const futureAppointmentsController = async (req, res) => {
  try {
    const doctorId = req.userId;
    const futureAppointments = await appointmentModel.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "modPass", "attendeePass"],
      },
      where: { status: ["pending", "running"] },
      include: [
        {
          model: userModel,
          attributes: ["name", "phone", "email", "pastDiseases"],
          association: appointmentModel.belongsTo(userModel, {
            foreignKey: "patientId",
          }),
        },
        {
          model: medicineModel,
          attributes: ["medicineName", "dosage", "duration"],
          as: "medicines",
        },
      ],
    });
    if (!futureAppointments.medicines) {
      futureAppointments.medicines = [];
    }
    // sort in increasing order
    futureAppointments.sort((a, b) => {
      // Compare dates
      const dateComparison =
        new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }

      // If dates are equal, compare startTimes
      const startTimeA = a.startTime.split(":").map(Number);
      const startTimeB = b.startTime.split(":").map(Number);

      for (let i = 0; i < startTimeA.length; i++) {
        if (startTimeA[i] !== startTimeB[i]) {
          return startTimeA[i] - startTimeB[i];
        }
      }

      return 0; // Dates and startTimes are equal
    });
    return res.status(200).send({
      success: true,
      message: "all future appointements ",
      futureAppointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching doctor's future appointments",
    });
  }
};

// update appointment status
const confirmAppointmentController = async (req, res) => {
  try {
    const appointmentId = req.body;
    // write logic that we recieved payment from patient for this appointment
    await appointmentModel.update(
      { status: "confirmed" },
      { where: { id: appointmentId } }
    );
    res.status(200).send({
      success: true,
      message: "Appointment status is confirmed",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in confirming  appointment ",
    });
  }
};

// code for doctor to launch/ craete virtual confrence
const createVcController = async (req, res) => {
  try {
    // request params
    const doctorId = req.userId;
    const appointmentId = req.body.appointmentId;
    // check whether the doctor is as per requested appointmentId

    const appointment = await appointmentModel.findOne({
      attributes: [
        "id",
        "doctorId",
        "patientId",
        "vclink",
        "modPass",
        "attendeePass",
        "status",
      ],
      where: { id: appointmentId, doctorId: doctorId },
      include: [
        {
          model: doctorModel,
          attributes: ["name"],
          as: "doctor", // Use the alias you want for the doctor association
        },
        {
          model: userModel,
          attributes: ["phone"],
          as: "patient", // Use the alias you want for the patient association
        },
      ],
    });
    // check if request is valid
    if (!appointment) {
      return res.status(209).send({
        success: false,
        message: "no appointment found for requested appointmentId",
      });
    }
    // geneate password for moderator
    const modPass = Math.floor(100000 + Math.random() * 900000).toString();
    const attendeePass = Math.floor(100000 + Math.random() * 900000).toString();

    //   vc create params
    const params = {
      requestName: "createVC",
      meetingID: appointment.patient.phone,
      meetingName: appointment.doctor.name + " Room ",
      modPass: modPass,
      attendeePass: attendeePass,
      joinName: appointment.doctor.name,
      apiKey: process.env.VC_KEY,
    };
    // console.log("request url: ", process.env.VC_URL);
    // console.log("requested params : ", params);
    const response = await axios
      .post(process.env.VC_URL, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .catch(function (err) {
        console.log(err);
      });
    if (!response.data.isError) {
      // update appointment table and save modPass and attendeePass
      appointment.modPass = modPass;
      appointment.attendeePass = attendeePass;
      appointment.status = "running";
      appointment.vclink = {
        ...appointment.vclink,
        doctorLink: response.data.joinUrl,
      };
      try {
        await appointment.save();
      } catch (error) {
        console.log("my error is : ", error);
        return res.status(209).send({
          success: false,
          message: "error in updating appointment credentials",
          error,
        });
      }
    }
    if (response.data.statusCode != 200) {
      return res.status(response.data.statusCode).send({
        success: !response.data.isError,
        message: response.data.message,
        vclink: response.data.joinUrl,
      });
    }
    return res.status(response.data.statusCode).send({
      success: !response.data.isError,
      message: "meeting created , you can join now",
      vclink: response.data.joinUrl,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "error in creating VC, retry again",
      error,
    });
  }
};
// create vc end

//endVC controller
const endVcController = async (req, res) => {
  try {
    const doctorId = req.userId;
    const appointmentId = req.body.appointmentId;
    // check wheher the doctor is authorised to end requested vc
    const appointment = await appointmentModel.findOne({
      attributes: [
        "id",
        "doctorId",
        "patientId",
        "modPass",
        [sequelize.literal("SUBSTRING(`date`, 1, 10)"), "date"],
        "note",
        "doctorNote",
        "startTime",
        "prescription",
        "status",
      ],
      where: { id: appointmentId, doctorId: doctorId, status: "running" },
      include: [
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
          as: "doctor", // Use the alias you want for the doctor association
        },
        {
          model: userModel,
          attributes: ["name", "phone", "email"],
          as: "patient", // Use the alias you want for the patient association
        },
        {
          model: medicineModel,
          attributes: ["medicineName", "dosage", "duration"],
          as: "medicines",
        },
      ],
    });
    // check if request is valid
    if (!appointment) {
      return res.status(209).send({
        success: false,
        message: "no appointment found for requested appointmentId",
      });
    }
    // check if meeting is running or not
    if (!appointment.modPass) {
      return res.status(209).send({
        success: false,
        message: "meeting is not running",
      });
    }
    //   end vc request  params
    const params = {
      requestName: "endVC",
      meetingID: appointment.patient.phone,
      modPass: appointment.modPass,
      apiKey: process.env.VC_KEY,
    };
    // send end VC request on samvad server
    const response = await axios
      .post(process.env.VC_URL, params, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .catch(function (err) {
        console.log(err);
      });
    // if meeting is successfully ended craete  a pdf
    // Create a unique identifier combining appointment and doctor IDs
    const uniqueIdentifier = appointment.id + "_" + appointment.doctorId;

    // Generate a hash for the unique identifier using crypto
    const hashedIdentifier = crypto
      .createHash("md5")
      .update(uniqueIdentifier)
      .digest("hex");
    // create filename and filepath
    const pdfFileName = `prescription_${hashedIdentifier}.pdf`;
    const pdfFilePath = path.join(__dirname, "../public", pdfFileName); // Path to save the PDF

    try {
      const doc = new PDFDocument();
      const margin = 50;
      // craete directory if not exists
      const directory = path.join(__dirname, "../public");
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
      }

      // Create a write stream
      const outputStream = doc.pipe(fs.createWriteStream(pdfFilePath));

      // Handle errors in the stream
      outputStream.on("error", (err) => {
        console.error("Error creating PDF:", err);
        return res.status(500).send({
          success: false,
          message: "Error creating PDF",
          error: err,
        });
      });

      // Handle stream finish event
      outputStream.on("finish", () => {
        console.log("PDF created successfully.");
        // You can continue with other actions or respond to the client here if needed
      });

      // Generate PDF content based on your data
      // Date and Time in the Header (Top Left)
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(
          `Date: ${appointment.date} | Time: ${appointment.startTime}`,
          margin,
          margin
        );
      // Logo below the Date and Time (Top Left)
      doc.image("./logo.jpeg", margin, margin + 30, { width: 100 });

      // Doctor Info (Top Right and Parallel to Date, Time)
      const doctorInfoX = doc.page.width - margin - 200;
      const doctorInfoY = margin;
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(appointment.doctor.name, doctorInfoX, doctorInfoY);
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`M ${appointment.doctor.phone}`, doctorInfoX, doctorInfoY + 20);
      doc.text(`${appointment.doctor.email}`, doctorInfoX, doctorInfoY + 40);
      doc.text(
        `Address: ${appointment.doctor.address}`,
        doctorInfoX,
        doctorInfoY + 60
      );
      doc.text(
        `Speciality: ${appointment.doctor.speciality}`,
        doctorInfoX,
        doctorInfoY + 80
      );
      doc.text(
        `Experience: ${appointment.doctor.experience} years`,
        doctorInfoX,
        doctorInfoY + 100
      );
      doc.text(
        `Price: $${appointment.doctor.price}`,
        doctorInfoX,
        doctorInfoY + 120
      );

      // Header Separator Line
      doc
        .moveTo(margin, margin + 150) // Adjust the vertical position for the line
        .lineTo(doc.page.width - margin, margin + 150) // Same adjustment here
        .stroke();

      // Patient Information (Below Header Line in Rows from Left Side)
      const patientInfoX = margin;
      const patientInfoY = margin + 170; // Adjust the vertical position for patient info

      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `Patient Note: ${appointment.note}`,
          patientInfoX,
          patientInfoY + 20
        );
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `Phone: ${appointment.patient.phone}`,
          patientInfoX,
          patientInfoY + 40
        );
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(
          `Email: ${appointment.patient.email}`,
          patientInfoX,
          patientInfoY + 60
        );

      // Doctor Note
      doc.moveDown();
      doc.font("Helvetica-Bold").fontSize(14).text("Doctor Note");
      doc.font("Helvetica").fontSize(12).text(appointment.doctorNote);

      // Medicine table headers
      doc.moveDown();
      doc.font("Helvetica-Bold").fontSize(14).text("Medicines");

      // Medicine table headers
      const medicineTableHeaders = ["Medicine Name", "Dosage", "Duration"];
      const startX = margin;
      const startY = doc.y;
      const rowHeight = 20;
      const columnWidth = 200;

      // Draw headers
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(medicineTableHeaders[0], startX, startY);
      doc
        .moveTo(startX, startY + rowHeight)
        .lineTo(startX + 3 * columnWidth, startY + rowHeight)
        .stroke();
      doc.text(medicineTableHeaders[1], startX + columnWidth, startY);
      doc
        .moveTo(startX + columnWidth, startY)
        .lineTo(startX + columnWidth, startY + rowHeight)
        .stroke();
      doc.text(medicineTableHeaders[2], startX + 2 * columnWidth, startY);
      doc
        .moveTo(startX + 2 * columnWidth, startY)
        .lineTo(startX + 2 * columnWidth, startY + rowHeight)
        .stroke();

      // Medicine table rows
      appointment.medicines.forEach((medicine, medicineIndex) => {
        const y = startY + (medicineIndex + 1) * rowHeight;
        doc
          .font("Helvetica")
          .fontSize(12)
          .text(medicine.medicineName, startX, y);
        doc
          .moveTo(startX, y)
          .lineTo(startX + 3 * columnWidth, y)
          .stroke();
        doc.text(medicine.dosage, startX + columnWidth, y);
        doc
          .moveTo(startX + columnWidth, y)
          .lineTo(startX + columnWidth, y + rowHeight)
          .stroke();
        doc.text(medicine.duration, startX + 2 * columnWidth, y);
        doc
          .moveTo(startX + 2 * columnWidth, y)
          .lineTo(startX + 2 * columnWidth, y + rowHeight)
          .stroke();

        // Bottom line for the table
        doc
          .moveTo(
            startX,
            startY + (appointment.medicines.length + 1) * rowHeight
          )
          .lineTo(
            startX + 3 * columnWidth,
            startY + (appointment.medicines.length + 1) * rowHeight
          )
          .stroke();
      });

      // Finalize the PDF creation
      doc.end();
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: "error in generating pdf ",
        error,
      });
    }

    // update parameters
    if (!response.data.isError) {
      appointment.prescription = `http://localhost:9000/${pdfFileName}`;
      await appointmentModel.update(
        {
          modPass: null,
          attendeePass: null,
          vclink: { doctorLink: null, patientLink: null },
          status: "completed",
          prescription: `http://localhost:9000/${pdfFileName}`,
        },
        {
          where: { id: appointmentId },
        }
      );
    }

    return res.status(response.data.statusCode).send({
      success: response.data.isError,
      message: response.data.message,
      prescriptionLink: appointment.prescription,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "unanle to end meeting",
      error,
    });
  }
};
module.exports = {
  getDoctorInfoController,
  updateDoctorProfileController,
  getDoctorByIdController,
  pastAppointmentsController,
  futureAppointmentsController,
  confirmAppointmentController,
  createVcController,
  endVcController,
};
