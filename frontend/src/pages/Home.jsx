import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/product/all");
      setFeaturedProducts(res.data.products?.slice(0, 4) || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 hero-content">
              <span className="badge bg-white text-primary px-3 py-2 mb-3 rounded-pill">
                🎉 New Collection Available
              </span>
              <h1 className="hero-title">
                Discover Your <br />
                <span className="text-warning">Perfect Style</span>
              </h1>
              <p className="hero-subtitle">
                Shop the latest trends with exclusive deals. Free shipping on orders over ₹999.
                Premium quality products at affordable prices.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/product" className="btn btn-light btn-lg px-4">
                  <i className="fa-solid fa-shopping-bag me-2"></i>
                  Shop Now
                </Link>
                <Link to="/product" className="btn btn-outline-light btn-lg px-4">
                  View Collection
                </Link>
              </div>

              {/* Stats */}
              <div className="d-flex gap-4 mt-5">
                <div>
                  <h3 className="text-white fw-bold mb-0">10K+</h3>
                  <small className="text-white-50">Happy Customers</small>
                </div>
                <div>
                  <h3 className="text-white fw-bold mb-0">500+</h3>
                  <small className="text-white-50">Products</small>
                </div>
                <div>
                  <h3 className="text-white fw-bold mb-0">99%</h3>
                  <small className="text-white-50">Satisfaction</small>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-center mt-5 mt-lg-0">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
                alt="Shopping"
                className="img-fluid rounded-4 shadow-lg"
                style={{ maxHeight: "450px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-3 col-6">
              <div className="text-center p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "70px", height: "70px" }}>
                  <i className="fa-solid fa-truck-fast text-primary fa-2x"></i>
                </div>
                <h6 className="fw-bold">Free Shipping</h6>
                <small className="text-muted">On orders over ₹999</small>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="text-center p-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "70px", height: "70px" }}>
                  <i className="fa-solid fa-shield-halved text-success fa-2x"></i>
                </div>
                <h6 className="fw-bold">Secure Payment</h6>
                <small className="text-muted">100% protected</small>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="text-center p-4">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "70px", height: "70px" }}>
                  <i className="fa-solid fa-rotate-left text-warning fa-2x"></i>
                </div>
                <h6 className="fw-bold">Easy Returns</h6>
                <small className="text-muted">30 day return policy</small>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="text-center p-4">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "70px", height: "70px" }}>
                  <i className="fa-solid fa-headset text-info fa-2x"></i>
                </div>
                <h6 className="fw-bold">24/7 Support</h6>
                <small className="text-muted">Dedicated support</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-5">
          <div className="container">
            <div className="text-center mb-5">
              <span className="badge bg-primary px-3 py-2 mb-3">Featured</span>
              <h2 className="fw-bold">Popular Products</h2>
              <p className="text-muted">Discover our most loved items</p>
            </div>
            <div className="row g-4">
              {featuredProducts.map((product) => (
                <div className="col-md-6 col-lg-3" key={product._id}>
                  <div className="card card-product h-100">
                    <div className="position-relative">
                      <img
                        src={product.img?.startsWith("http") ? product.img : `http://localhost:3000${product.img}`}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: "200px", objectFit: "contain", padding: "1rem", background: "#f8fafc" }}
                      />
                    </div>
                    <div className="card-body">
                      <h6 className="card-title fw-semibold text-truncate">{product.name}</h6>
                      <p className="card-text text-muted small text-truncate">{product.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="price">₹{product.price}</span>
                        <Link to="/product" className="btn btn-sm btn-outline-primary">
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-5">
              <Link to="/product" className="btn btn-primary btn-lg px-5">
                View All Products <i className="fa-solid fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-5 bg-gradient-primary text-white" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h3 className="fw-bold mb-2">Subscribe to Our Newsletter</h3>
              <p className="mb-0 opacity-75">Get updates on new arrivals and exclusive offers!</p>
            </div>
            <div className="col-lg-4 mt-4 mt-lg-0">
              <div className="input-group">
                <input type="email" className="form-control form-control-lg" placeholder="Enter your email" />
                <button className="btn btn-dark px-4">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)" }} className="text-white pt-5">
        {/* Features Bar */}
        <div className="border-bottom border-secondary pb-4 mb-4">
          <div className="container">
            <div className="row g-4 text-center">
              <div className="col-6 col-md-3">
                <div className="d-flex flex-column align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" 
                       style={{ width: "50px", height: "50px", background: "rgba(245, 158, 11, 0.2)" }}>
                    <i className="bi bi-truck text-warning fs-4"></i>
                  </div>
                  <h6 className="mb-1 fw-semibold">Free Shipping</h6>
                  <small className="text-secondary">On orders above ₹499</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="d-flex flex-column align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" 
                       style={{ width: "50px", height: "50px", background: "rgba(34, 197, 94, 0.2)" }}>
                    <i className="bi bi-shield-check text-success fs-4"></i>
                  </div>
                  <h6 className="mb-1 fw-semibold">Secure Payment</h6>
                  <small className="text-secondary">100% protected</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="d-flex flex-column align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" 
                       style={{ width: "50px", height: "50px", background: "rgba(59, 130, 246, 0.2)" }}>
                    <i className="bi bi-arrow-repeat text-primary fs-4"></i>
                  </div>
                  <h6 className="mb-1 fw-semibold">Easy Returns</h6>
                  <small className="text-secondary">7 days return policy</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="d-flex flex-column align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" 
                       style={{ width: "50px", height: "50px", background: "rgba(168, 85, 247, 0.2)" }}>
                    <i className="bi bi-headset text-purple fs-4" style={{ color: "#a855f7" }}></i>
                  </div>
                  <h6 className="mb-1 fw-semibold">24/7 Support</h6>
                  <small className="text-secondary">Dedicated support</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container py-4">
          <div className="row g-4">
            {/* Brand Section */}
            <div className="col-lg-4 col-md-6">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle" 
                     style={{ width: "45px", height: "45px", background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" }}>
                  <i className="bi bi-bag-fill text-white fs-5"></i>
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">E-Store</h5>
                  <small className="text-warning" style={{ fontSize: "10px", letterSpacing: "1px" }}>SHOP SMART</small>
                </div>
              </div>
              <p className="text-secondary mb-3" style={{ lineHeight: "1.7" }}>
                Your one-stop destination for quality products at unbeatable prices. 
                Shop with confidence and enjoy seamless shopping experience.
              </p>
              {/* App Download Buttons */}
              <div className="d-flex gap-2 mb-3">
                <a href="#" className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3">
                  <i className="bi bi-google-play"></i>
                  <div className="text-start">
                    <div style={{ fontSize: "8px", lineHeight: "1" }}>GET IT ON</div>
                    <div style={{ fontSize: "12px", fontWeight: "500" }}>Google Play</div>
                  </div>
                </a>
                <a href="#" className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3">
                  <i className="bi bi-apple"></i>
                  <div className="text-start">
                    <div style={{ fontSize: "8px", lineHeight: "1" }}>DOWNLOAD ON</div>
                    <div style={{ fontSize: "12px", fontWeight: "500" }}>App Store</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-6 col-lg-2 col-md-6">
              <h6 className="text-warning fw-bold mb-3 text-uppercase" style={{ fontSize: "13px", letterSpacing: "1px" }}>
                <i className="bi bi-link-45deg me-1"></i> Quick Links
              </h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/home" className="text-secondary text-decoration-none hover-effect">
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px" }}></i> Home
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/product" className="text-secondary text-decoration-none hover-effect">
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px" }}></i> Products
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/cart" className="text-secondary text-decoration-none hover-effect">
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px" }}></i> Cart
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/wishlist" className="text-secondary text-decoration-none hover-effect">
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px" }}></i> Wishlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="col-6 col-lg-2 col-md-6">
              <h6 className="text-warning fw-bold mb-3 text-uppercase" style={{ fontSize: "13px", letterSpacing: "1px" }}>
                <i className="bi bi-headset me-1"></i> Help
              </h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="#" className="text-secondary text-decoration-none hover-effect">
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px" }}></i> FAQ
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-secondary text-decoration-none hover-effect">
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px" }}></i> Shipping Info
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-secondary text-decoration-none hover-effect">
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px" }}></i> Returns
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-secondary text-decoration-none hover-effect">
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px" }}></i> Track Order
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="col-lg-4 col-md-6">
              <h6 className="text-warning fw-bold mb-3 text-uppercase" style={{ fontSize: "13px", letterSpacing: "1px" }}>
                <i className="bi bi-geo-alt me-1"></i> Contact Us
              </h6>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-start gap-2">
                  <i className="bi bi-geo-alt-fill text-danger mt-1"></i>
                  <span className="text-secondary">123 Business Park, Andheri West,<br />Mumbai, Maharashtra 400053</span>
                </li>
                <li className="mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-telephone-fill text-success"></i>
                  <span className="text-secondary">+91 98765 43210</span>
                </li>
                <li className="mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-envelope-fill text-primary"></i>
                  <span className="text-secondary">support@estore.com</span>
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-clock-fill text-warning"></i>
                  <span className="text-secondary">Mon - Sat: 9:00 AM - 9:00 PM</span>
                </li>
              </ul>

              {/* Social Icons */}
              <div className="d-flex gap-2 mt-3">
                <a href="#" className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: "38px", height: "38px" }}>
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: "38px", height: "38px" }}>
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: "38px", height: "38px" }}>
                  <i className="bi bi-twitter-x"></i>
                </a>
                <a href="#" className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: "38px", height: "38px" }}>
                  <i className="bi bi-youtube"></i>
                </a>
                <a href="#" className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: "38px", height: "38px" }}>
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="border-top border-secondary">
          <div className="container py-4">
            <div className="row align-items-center">
              <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                <small className="text-secondary">
                  © 2024 E-Store. All rights reserved. Made with <i className="bi bi-heart-fill text-danger"></i> in India
                </small>
              </div>
              <div className="col-md-6">
                <div className="d-flex justify-content-center justify-content-md-end align-items-center gap-3">
                  <span className="text-secondary small">We Accept:</span>
                  <div className="d-flex gap-2">
                    <div className="bg-white rounded px-2 py-1">
                      <i className="bi bi-credit-card text-dark"></i>
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="fw-bold text-primary" style={{ fontSize: "12px" }}>VISA</span>
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="fw-bold text-danger" style={{ fontSize: "12px" }}>MC</span>
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="fw-bold text-success" style={{ fontSize: "12px" }}>UPI</span>
                    </div>
                    <div className="bg-white rounded px-2 py-1">
                      <span className="fw-bold text-info" style={{ fontSize: "12px" }}>GPay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
