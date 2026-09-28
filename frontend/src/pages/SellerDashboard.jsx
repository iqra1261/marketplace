import { useEffect, useState } from "react";
import api from "../api/axios";

const empty = { name: "", description: "", price: "", stock: "", category_id: "", image_url: "" };

export default function SellerDashboard() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [c, p, o] = await Promise.all([
      api.get("/products/categories"),
      api.get("/products/mine"),
      api.get("/orders/seller"),
    ]);
    setCategories(c.data);
    setProducts(p.data);
    setOrders(o.data);
  };

  useEffect(() => { load(); }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/products", form);
      setForm(empty);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    }
  };

  const remove = async (id) => {
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <>
      <h2>Add a product</h2>
      <form className="box" onSubmit={addProduct}>
        <input placeholder="Product name" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select required value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="row">
          <input type="number" step="0.01" placeholder="Price" required value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input type="number" placeholder="Stock" required value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <input placeholder="Image URL (optional)" value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <button>Add product</button>
        {msg && <p className="error">{msg}</p>}
      </form>

      <h2>My products</h2>
      <div className="grid">
        {products.map((p) => (
          <div className="item" key={p.id}>
            {p.image_url && <img src={p.image_url} alt={p.name} />}
            <h4>{p.name}</h4>
            <small>{p.category_name}</small>
            <p>${p.price} · stock {p.stock}</p>
            <button className="danger" onClick={() => remove(p.id)}>Delete</button>
          </div>
        ))}
        {!products.length && <p>No products yet.</p>}
      </div>

      <h2>Orders received</h2>
      {orders.map((o) => (
        <div className="box" key={o.id}>
          #{o.id} · {o.product_name} × {o.quantity} · ${o.total} · {o.status} · {o.customer_email}
        </div>
      ))}
      {!orders.length && <p>No orders yet.</p>}
    </>
  );
}