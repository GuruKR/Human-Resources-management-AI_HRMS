import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API = "http://localhost:5000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Remove gradient and use light background
    document.body.style.background = "#f9fafb"; // light neutral background
    document.body.classList.remove("auth-background");
    return () => {
      document.body.style.background = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      toast.success("Password reset link sent successfully!");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card fade-in">
        <h1 className="auth-title">🔑 Forgot Password?</h1>
        <p className="auth-subtitle">
          Enter your registered email to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ color: "#111", background: "#fff", border: "1px solid #ccc" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div
            className="auth-link"
            style={{
              marginTop: "1rem",
              textAlign: "center",
              color: "#333",
              fontSize: "14px",
            }}
          >
            <p>
              Remember your password?{" "}
              <span
                onClick={() => navigate("/")}
                style={{
                  color: "#3b82f6", // bright blue link
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Back to Login
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
