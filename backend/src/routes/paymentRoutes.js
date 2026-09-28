const express = require("express");
const { protect, requireRole } = require("../middleware/auth");
const c = require("../controllers/paymentController");

const router = express.Router();

router.post("/checkout", protect, requireRole("customer"), c.createCheckout);
router.get("/confirm", protect, requireRole("customer"), c.confirmPayment);

module.exports = router;