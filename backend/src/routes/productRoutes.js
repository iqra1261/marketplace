const express = require("express");
const { protect, requireRole } = require("../middleware/auth");
const c = require("../controllers/productController");

const router = express.Router();

router.get("/categories", c.getCategories);
router.get("/", c.getProducts);
router.get("/mine", protect, requireRole("seller"), c.myProducts);
router.post("/", protect, requireRole("seller"), c.createProduct);
router.delete("/:id", protect, requireRole("seller"), c.deleteProduct);

module.exports = router;