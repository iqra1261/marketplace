import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import api from "../api/axios";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  if (!state?.email) return <Navigate to="/register" />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/verify-otp", { email: state.email, otp });
      navigate("/login");
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="card">
      <h2>Verify your email</h2>
      <p>We sent a 6-digit code to <b>{state.email}</b></p>
      <form onSubmit={submit}>
        <input placeholder="Enter OTP" maxLength={6} required
          value={otp} onChange={(e) => setOtp(e.target.value)} />
        <button>Verify</button>
      </form>
      {msg && <p className="error">{msg}</p>}
    </div>
  );
}