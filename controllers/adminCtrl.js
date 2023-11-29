const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");

const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.status(200).send({
      success: true,
      message: "Users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching users",
      error,
    });
  }
};

const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.findAll();
    res.status(200).send({
      success: true,
      message: "Doctors data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting doctors data",
      error,
    });
  }
};

// Doctor account status
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    const [updatedRows, updatedDoctor] = await doctorModel.update(
      { status },
      { where: { doctorId } }
    );

    if (updatedRows > 0) {
      const doctor = await doctorModel.findOne({ where: { doctorId } });
      const user = await userModel.findOne({ where: { _id: doctor.userId } });
      const notification = user.notification || [];
      notification.push({
        type: "doctor-account-request-updated",
        message: `Your Doctor Account Request Has ${status}`,
        onClickPath: "/notification",
      });
      user.isDoctor = status === "approved";
      await user.save();

      res.status(201).send({
        success: true,
        message: "Account Status Updated",
        data: updatedDoctor,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Doctor not found or not updated",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Account Status",
      error,
    });
  }
};

module.exports = {
  getAllDoctorsController,
  getAllUsersController,
  changeAccountStatusController,
};
