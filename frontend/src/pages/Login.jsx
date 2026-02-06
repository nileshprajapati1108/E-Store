import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/user/login", {
        email,
        password,
      });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user.id);
        localStorage.setItem("userName", res.data.user.name);
        localStorage.setItem("email", res.data.user.email);
        localStorage.setItem("role", res.data.user.role);
        navigate("/home");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
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
                  <h2 className="fw-bold">Welcome Back!</h2>
                  <p className="text-muted">Sign in to continue shopping</p>
                </div>

                <form onSubmit={handleLogin}>
                  <div className="mb-4">
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

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fa-solid fa-lock me-2 text-muted"></i>Password
                    </label>
                    <div className="input-group">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg"
                        placeholder="Enter your password"
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="remember" />
                      <label className="form-check-label small" htmlFor="remember">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="small text-primary text-decoration-none">
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <span className="text-muted">Don't have an account? </span>
                    <Link to="/signup" className="text-primary fw-semibold text-decoration-none">
                      Create Account
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* Demo Accounts Info */}
            <div className="card mt-3 border-0 shadow-sm">
              <div className="card-body p-3">
                <small className="text-muted d-block mb-2">
                  <i className="fa-solid fa-info-circle me-1"></i> Demo Accounts:
                </small>
                <div className="d-flex gap-2">
                  <span className="badge bg-primary">User: user@test.com</span>
                  <span className="badge bg-success">Admin: admin@test.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
