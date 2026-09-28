require("dotenv").config();
const pool = require("./src/config/db");

pool
  .query("SELECT NOW()")
  .then((r) => {
    console.log("DB connected:", r.rows[0]);
    process.exit();
  })
  .catch((e) => {
    console.error("DB failed:", e.message);
    process.exit(1);
  });