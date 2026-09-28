const pool = require("../config/db");

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  });

exports.getCategories = wrap(async (req, res) => {
  const r = await pool.query("SELECT * FROM categories ORDER BY name");
  res.json(r.rows);
});

exports.getProducts = wrap(async (req, res) => {
  const params = [];
  let where = "WHERE p.stock > 0";
  if (req.query.category) {
    params.push(req.query.category);
    where += ` AND p.category_id = $${params.length}`;
  }
  const r = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p JOIN categories c ON c.id = p.category_id
     ${where} ORDER BY p.created_at DESC`,
    params
  );
  res.json(r.rows);
});

exports.myProducts = wrap(async (req, res) => {
  const r = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.seller_id = $1 ORDER BY p.created_at DESC`,
    [req.user.id]
  );
  res.json(r.rows);
});

exports.createProduct = wrap(async (req, res) => {
  const { name, description, price, stock, category_id, image_url } = req.body;
  if (!name || !category_id || !(Number(price) > 0) || !(Number(stock) >= 0)) {
    return res.status(400).json({ message: "Name, category, price (>0) and stock are required" });
  }
  const r = await pool.query(
    `INSERT INTO products (seller_id, category_id, name, description, price, stock, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.user.id, category_id, name.trim(), description || "", price, stock, image_url || null]
  );
  res.status(201).json(r.rows[0]);
});

exports.deleteProduct = wrap(async (req, res) => {
  const r = await pool.query(
    "DELETE FROM products WHERE id = $1 AND seller_id = $2",
    [req.params.id, req.user.id]
  );
  if (!r.rowCount) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Deleted" });
});