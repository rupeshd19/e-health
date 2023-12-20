const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("doctor", "root", "root@123", {
  host: "13.228.225.19",
  dialect: "mysql",
});
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the database".cyan);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = sequelize;
