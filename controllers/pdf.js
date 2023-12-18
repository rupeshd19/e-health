const pdfFilePath = path.join(__dirname, "prescriptionPdfs", pdfFileName); // Path to save the PDF

try {
  const doc = new PDFDocument();
  const margin = 50;
  // craete directory if not exists
  const directory = path.join(__dirname, "prescriptionPdfs");
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  // Create a write stream
  const outputStream = doc.pipe(fs.createWriteStream(pdfFilePath));

  // Handle errors in the stream
  outputStream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });

  // Handle stream finish event
  outputStream.on("finish", () => {
    console.log("PDF created successfully.");
  });

  // Pipe the PDF content to the file
  // doc.pipe(outputStream);

  // Generate PDF content based on your data
  doc.addPage(); // Add a new page for each appointment after the first

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
      `Patient Note: ${appointment.patientNote}`,
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
    doc.font("Helvetica").fontSize(12).text(medicine.medicineName, startX, y);
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
      .moveTo(startX, startY + (appointment.medicines.length + 1) * rowHeight)
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
