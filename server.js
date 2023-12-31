const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const sequelize = require("./models/index");
// const authMiddleware = require("./middlewares/authMiddleware");
const cors = require("cors");

//dotenv conig
dotenv.config({
  path: "./routes/.env",
});

// table creation
const userModel = require("./models/userModel");

// Sync the model with the database

//mysql  connection
(async () => {
  try {
    // Sync the model with the database
    await userModel.sync({ force: false });
    console.log("Connected to the database".cyan);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
//rest obejct
const app = express();

//middlewares
app.use(express.json());
app.use(morgan("dev"));

// solve cors error
app.use(cors());
// give permission for public files
app.use(express.static("public"));

//routes
app.use("/api/v1/user", require("./routes/userRoutes")); // handle all login and register requests
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes")); // handle all doctor's requests
app.use("/api/v1/patient", require("./routes/patientRoutes")); // handle all patient's request

//port
const port = 9000;
//listen port
app.listen(port, () => {
  console.log(
    `Server Running in ${process.env.NODE_MODE} Mode on port ${port}`.bgCyan
      .white
  );
});
