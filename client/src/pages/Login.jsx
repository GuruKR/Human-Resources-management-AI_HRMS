import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API = "http://localhost:5000/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "employee",
  });

  useEffect(() => {
    // Remove gradient background
    document.body.style.background = "#f9fafb"; // light neutral
    document.body.classList.remove("auth-background");
    return () => {
      document.body.style.background = "";
    };
  }, []);

  // ✅ LOGIN HANDLER
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, loginData);
      const { token, user } = res.data;
      toast.success("Welcome back!");
      login(token, user);
      setTimeout(() => {
        if (user.role === "admin") navigate("/admin-dashboard");
        else if (user.role === "hr") navigate("/hr-dashboard");
        else if (user.role === "manager") navigate("/manager-dashboard");
        else navigate("/employee-dashboard");
      }, 200);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ✅ REGISTER HANDLER
  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/register`, registerData);
      const { token, user } = res.data;
      toast.success("Account created successfully!");
      login(token, user);
      setTimeout(() => navigate("/employee-dashboard"), 300);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <h1 className="auth-title">RecruitIQ</h1>
        <p className="auth-subtitle">
          AI intelligence for hiring and HR management
        </p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        {/* LOGIN FORM */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="auth-form fade-in">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="your.email@company.com"
                style={{ color: "#111", background: "#fff", border: "1px solid #ccc" }}
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                style={{ color: "#111", background: "#fff", border: "1px solid #ccc" }}
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="forgot-password">
              <span onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </span>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="auth-form fade-in">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                style={{ color: "#111", background: "#fff", border: "1px solid #ccc" }}
                value={registerData.full_name}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    full_name: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="john.doe@company.com"
                style={{ color: "#111", background: "#fff", border: "1px solid #ccc" }}
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  style={{ color: "#111", background: "#fff", border: "1px solid #ccc" }}
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm</label>
                <input
                  type="password"
                  placeholder="Re-enter"
                  style={{ color: "#111", background: "#fff", border: "1px solid #ccc" }}
                  value={registerData.confirm_password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirm_password: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                style={{ color: "#111", background: "#fff", border: "1px solid #ccc" }}
                value={registerData.role}
                onChange={(e) =>
                  setRegisterData({ ...registerData, role: e.target.value })
                }
              >
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
