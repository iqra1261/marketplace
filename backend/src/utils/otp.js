const crypto = require("crypto");

function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

module.exports = { generateOtp, hashOtp };