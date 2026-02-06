import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  
  // Get display name - use stored name, fallback to email prefix
  const fullName = localStorage.getItem("userName") || localStorage.getItem("email")?.split("@")[0] || "User";
  // Show only first name for navbar display
  const displayName = fullName.split(" ")[0];
  // Truncate if still too long
  const userName = displayName.length > 12 ? displayName.substring(0, 12) + "..." : displayName;

  // Fetch cart count
  const fetchCartCount = async () => {
    if (!userId || role !== "user") return;
    try {
      const response = await fetch(`http://localhost:3000/api/cart/${userId}`);
      const data = await response.json();
      if (data.success) {
        setCartCount(data.cartItems.length);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch cart count on load and when location changes
  useEffect(() => {
    fetchCartCount();
  }, [userId, location.pathname]);

  // Listen for cart update events
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/product?search=${searchQuery}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Bar */}
      <div className="bg-dark text-white py-2 d-none d-md-block" style={{ fontSize: "13px" }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-4">
            <span><i className="bi bi-telephone me-2"></i>+91 98765 43210</span>
            <span><i className="bi bi-envelope me-2"></i>support@estore.com</span>
          </div>
          <div className="d-flex gap-3">
            <a href="#" className="text-white text-decoration-none"><i className="bi bi-facebook"></i></a>
            <a href="#" className="text-white text-decoration-none"><i className="bi bi-instagram"></i></a>
            <a href="#" className="text-white text-decoration-none"><i className="bi bi-twitter-x"></i></a>
            <a href="#" className="text-white text-decoration-none"><i className="bi bi-youtube"></i></a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`navbar navbar-expand-lg sticky-top ${scrolled ? "shadow-lg" : "shadow-sm"}`} 
           style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div className="container">
          {/* Brand Logo */}
          <Link to="/home" className="navbar-brand d-flex align-items-center gap-2 py-2">
            <div className="d-flex align-items-center justify-content-center rounded-circle" 
                 style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" }}>
              <i className="bi bi-bag-fill text-white fs-5"></i>
            </div>
            <div className="d-flex flex-column">
              <span className="fw-bold text-white fs-5" style={{ lineHeight: "1.1" }}>E-Store</span>
              <small className="text-warning" style={{ fontSize: "10px", letterSpacing: "1px" }}>SHOP SMART</small>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="d-none d-lg-flex flex-grow-1 mx-4" style={{ maxWidth: "500px" }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control border-0 py-2"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderRadius: "8px 0 0 8px" }}
              />
              <button className="btn btn-warning px-4" type="submit" style={{ borderRadius: "0 8px 8px 0" }}>
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler border-0 text-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          {/* Nav Items */}
          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="d-lg-none my-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-warning" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>

            <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
              {/* USER NAVIGATION */}
              {token && role === "user" && (
                <>
                  <li className="nav-item">
                    <Link to="/home" className={`nav-link text-white px-3 py-2 rounded-2 ${isActive("/home") ? "bg-white bg-opacity-10" : ""}`}>
                      <i className="bi bi-house-door me-1"></i> Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/product" className={`nav-link text-white px-3 py-2 rounded-2 ${isActive("/product") ? "bg-white bg-opacity-10" : ""}`}>
                      <i className="bi bi-grid me-1"></i> Products
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/orders" className={`nav-link text-white px-3 py-2 rounded-2 ${isActive("/orders") ? "bg-white bg-opacity-10" : ""}`}>
                      <i className="bi bi-box-seam me-1"></i> Orders
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/contact" className={`nav-link text-white px-3 py-2 rounded-2 ${isActive("/contact") ? "bg-white bg-opacity-10" : ""}`}>
                      <i className="bi bi-headset me-1"></i> Support
                    </Link>
                  </li>
                </>
              )}

              {/* ADMIN NAVIGATION */}
              {token && role === "admin" && (
                <>
                  <li className="nav-item">
                    <Link to="/admin/dashboard" className={`nav-link text-white px-3 py-2 rounded-2 ${isActive("/admin/dashboard") ? "bg-white bg-opacity-10" : ""}`}>
                      <i className="bi bi-speedometer2 me-1"></i> Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/products" className={`nav-link text-white px-3 py-2 rounded-2 ${isActive("/admin/products") ? "bg-white bg-opacity-10" : ""}`}>
                      <i className="bi bi-gear me-1"></i> Products
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/product" className={`nav-link text-white px-3 py-2 rounded-2 ${isActive("/product") ? "bg-white bg-opacity-10" : ""}`}>
                      <i className="bi bi-shop me-1"></i> Store
                    </Link>
                  </li>
                </>
              )}

              {/* GUEST NAVIGATION */}
              {!token && (
                <>
                  <li className="nav-item">
                    <Link to="/home" className={`nav-link text-white px-3 py-2 rounded-2 ${isActive("/home") ? "bg-white bg-opacity-10" : ""}`}>
                      <i className="bi bi-house-door me-1"></i> Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/product" className={`nav-link text-white px-3 py-2 rounded-2 ${isActive("/product") ? "bg-white bg-opacity-10" : ""}`}>
                      <i className="bi bi-grid me-1"></i> Products
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* Right Side Icons */}
            <div className="d-flex align-items-center gap-2 ms-lg-4 mt-3 mt-lg-0">
              {/* Wishlist */}
              {token && role === "user" && (
                <Link to="/wishlist" className="btn btn-link text-white position-relative p-2" title="Wishlist">
                  <i className="bi bi-heart fs-5"></i>
                </Link>
              )}

              {/* Cart */}
              {token && role === "user" && (
                <Link to="/cart" className="btn btn-link text-white position-relative p-2" title="Cart">
                  <i className="bi bi-cart3 fs-5"></i>
                  {cartCount > 0 && (
                    <span 
                      className="position-absolute translate-middle badge rounded-pill bg-danger"
                      style={{ top: '5px', right: '-5px', fontSize: '10px', padding: '4px 6px' }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Auth */}
              {!token ? (
                <div className="d-flex gap-2">
                  <Link to="/login" className="btn btn-outline-light btn-sm px-3">
                    <i className="bi bi-person me-1"></i> Login
                  </Link>
                  <Link to="/signup" className="btn btn-warning btn-sm px-3">
                    <i className="bi bi-person-plus me-1"></i> Sign Up
                  </Link>
                </div>
              ) : (
                <div className="dropdown">
                  <button
                    className="btn btn-link text-white dropdown-toggle d-flex align-items-center gap-2 text-decoration-none"
                    type="button"
                    data-bs-toggle="dropdown"
                    style={{ maxWidth: "180px" }}
                  >
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                         style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
                      <i className="bi bi-person-fill text-white"></i>
                    </div>
                    <span className="d-none d-md-inline text-truncate">{userName}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2" style={{ minWidth: "220px" }}>
                    <li className="px-3 py-2 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                             style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
                          <i className="bi bi-person-fill text-white"></i>
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="fw-semibold text-truncate" style={{ maxWidth: "150px" }} title={fullName}>{fullName}</div>
                          <small className="text-muted">{role === "admin" ? "Administrator" : "Customer"}</small>
                        </div>
                      </div>
                    </li>
                    {role === "user" && (
                      <>
                        <li>
                          <Link to="/profile" className="dropdown-item py-2">
                            <i className="bi bi-person-gear me-2 text-primary"></i> My Account
                          </Link>
                        </li>
                        <li>
                          <Link to="/orders" className="dropdown-item py-2">
                            <i className="bi bi-box-seam me-2 text-success"></i> My Orders
                          </Link>
                        </li>
                        <li>
                          <Link to="/wishlist" className="dropdown-item py-2">
                            <i className="bi bi-heart me-2 text-danger"></i> Wishlist
                          </Link>
                        </li>
                        <li>
                          <Link to="/cart" className="dropdown-item py-2">
                            <i className="bi bi-cart3 me-2 text-warning"></i> My Cart
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                    )}
                    <li>
                      <button onClick={handleLogout} className="dropdown-item py-2 text-danger">
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};



export default Navbar;
