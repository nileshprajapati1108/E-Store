import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/user/register`, {
        name,
        email,
        password,
      });
      if (res.data.success) {
        alert("Account created successfully! Please login.");
        navigate("/login");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="auth-card">
              <div className="card-body">
                {/* Logo */}
                <div className="auth-header">
                  <div className="mb-4">
                    <i className="fa-solid fa-store text-primary fa-3x"></i>
                  </div>
                  <h2 className="fw-bold">Create Account</h2>
                  <p className="text-muted">Join us and start shopping</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fa-solid fa-user me-2 text-muted"></i>Full Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fa-solid fa-envelope me-2 text-muted"></i>Email Address
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fa-solid fa-lock me-2 text-muted"></i>Password
                    </label>
                    <div className="input-group">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg"
                        placeholder="Create a password"
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </button>
                    </div>
                    <small className="text-muted">Minimum 6 characters</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fa-solid fa-lock me-2 text-muted"></i>Confirm Password
                    </label>
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      className="form-control form-control-lg"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <div className="form-check mb-4">
                    <input className="form-check-input" type="checkbox" id="terms" required />
                    <label className="form-check-label small" htmlFor="terms">
                      I agree to the <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-user-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                      Sign In
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
