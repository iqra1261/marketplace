import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Shop() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState("");
  const [msg, setMsg] = useState("");

  const loadProducts = async () => {
    const r = await api.get("/products", { params: category ? { category } : {} });
    setProducts(r.data);
  };
  const loadOrders = async () => {
    const r = await api.get("/orders/mine");
    setOrders(r.data);
  };

  useEffect(() => {
    api.get("/products/categories").then((r) => setCategories(r.data));
    loadOrders();
  }, []);
  useEffect(() => { loadProducts(); }, [category]);

  const buy = async (p) => {
    setMsg("");
    try {
      await api.post("/orders", { product_id: p.id, quantity: 1 });
      setMsg(`Order placed for "${p.name}". Payment comes next.`);
      loadOrders();
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <h2>Shop</h2>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All categories</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {msg && <p>{msg}</p>}

      <div className="grid">
        {products.map((p) => (
          <div className="item" key={p.id}>
            {p.image_url && <img src={p.image_url} alt={p.name} />}
            <h4>{p.name}</h4>
            <small>{p.category_name}</small>
            <p>{p.description}</p>
            <p><b>${p.price}</b> · {p.stock} left</p>
            <button onClick={() => buy(p)}>Buy now</button>
          </div>
        ))}
        {!products.length && <p>No products found.</p>}
      </div>

      <h2>My orders</h2>
      {orders.map((o) => (
        <div className="box" key={o.id}>
          #{o.id} · {o.product_name} × {o.quantity} · ${o.total} · {o.status}
        </div>
      ))}
      {!orders.length && <p>No orders yet.</p>}
    </>
  );
}