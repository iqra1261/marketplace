import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", role: "customer" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await api.post("/auth/register", form);
      navigate("/verify", { state: { email: form.email } });
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <input type="email" placeholder="Email" required
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password (min 6)" required
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
        </select>
        <button disabled={loading}>{loading ? "Sending OTP..." : "Register"}</button>
      </form>
      {msg && <p className="error">{msg}</p>}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}