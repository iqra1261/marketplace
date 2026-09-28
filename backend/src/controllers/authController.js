const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { generateOtp, hashOtp } = require("../utils/otp");
const { sendOtpEmail } = require("../config/mailer");

async function createAndSendOtp(email) {
  const otp = generateOtp();
  await pool.query("DELETE FROM email_otps WHERE email = $1", [email]);
  await pool.query(
    `INSERT INTO email_otps (email, otp_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '5 minutes')`,
    [email, hashOtp(otp)]
  );
  await sendOtpEmail(email, otp);
}

exports.register = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const { password, role } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ message: "Valid email and password (min 6 characters) required" });
    }
    if (!["customer", "seller"].includes(role)) {
      return res.status(400).json({ message: "Role must be customer or seller" });
    }

    const existing = await pool.query("SELECT is_verified FROM users WHERE email = $1", [email]);
    if (existing.rows.length && existing.rows[0].is_verified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (existing.rows.length) {
      await pool.query(
        "UPDATE users SET password_hash = $1, role = $2 WHERE email = $3",
        [passwordHash, role, email]
      );
    } else {
      await pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
        [email, passwordHash, role]
      );
    }

    await createAndSendOtp(email);
    res.status(201).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const otp = (req.body.otp || "").trim();

    const result = await pool.query(
      "SELECT *, (expires_at < NOW()) AS expired FROM email_otps WHERE email = $1",
      [email]
    );
    if (!result.rows.length) {
      return res.status(400).json({ message: "No OTP found. Please register again." });
    }

    const record = result.rows[0];
    if (record.expired) {
      return res.status(400).json({ message: "OTP expired" });
    }
    if (record.attempts >= 5) {
      return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
    }

    await pool.query("UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1", [record.id]);

    if (hashOtp(otp) !== record.otp_hash) {
      return res.status(400).json({ message: "Wrong OTP" });
    }

    await pool.query("UPDATE users SET is_verified = TRUE WHERE email = $1", [email]);
    await pool.query("DELETE FROM email_otps WHERE email = $1", [email]);
    res.json({ message: "Email verified. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};