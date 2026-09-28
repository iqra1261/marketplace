import { useNavigate, Navigate } from "react-router-dom";
import SellerDashboard from "./SellerDashboard";
import Shop from "./Shop";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/login" />;

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="page">
      <div className="topbar">
        <span>{user.email} · <b>{user.role}</b></span>
        <button onClick={logout}>Logout</button>
      </div>
      {user.role === "seller" && <SellerDashboard />}
      {user.role === "customer" && <Shop />}
    </div>
  );
}