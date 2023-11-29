const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("doctor", "niti", "niti@123", {
  host: "localhost",
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
