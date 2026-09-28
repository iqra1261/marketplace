const express = require("express");
const { protect, requireRole } = require("../middleware/auth");
const c = require("../controllers/orderController");

const router = express.Router();

router.post("/", protect, requireRole("customer"), c.createOrder);
router.get("/mine", protect, requireRole("customer"), c.myOrders);
router.get("/seller", protect, requireRole("seller"), c.sellerOrders);

module.exports = router;