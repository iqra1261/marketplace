const pool = require("../config/db");

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  });

exports.createOrder = wrap(async (req, res) => {
  const quantity = Number(req.body.quantity) || 1;
  const p = await pool.query("SELECT * FROM products WHERE id = $1", [req.body.product_id]);
  const product = p.rows[0];
  if (!product) return res.status(404).json({ message: "Product not found" });
  if (quantity < 1 || product.stock < quantity) {
    return res.status(400).json({ message: "Not enough stock" });
  }
  // seller_id and total always come from the database, never from the browser
  const total = (Number(product.price) * quantity).toFixed(2);
  const r = await pool.query(
    `INSERT INTO orders (customer_id, seller_id, product_id, product_name, quantity, total)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, product.seller_id, product.id, product.name, quantity, total]
  );
  res.status(201).json(r.rows[0]);
});

exports.myOrders = wrap(async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC",
    [req.user.id]
  );
  res.json(r.rows);
});

exports.sellerOrders = wrap(async (req, res) => {
  const r = await pool.query(
    `SELECT o.*, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.customer_id
     WHERE o.seller_id = $1 ORDER BY o.created_at DESC`,
    [req.user.id]
  );
  res.json(r.rows);
});