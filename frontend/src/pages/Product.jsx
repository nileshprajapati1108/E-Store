import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const Product = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [productList, setProductList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Check if user is admin
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isLoggedIn = !!localStorage.getItem("token");

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/product/all`);
      setProductList(res.data.products || []);
      setFilteredProducts(res.data.products || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(res.data.products.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      const res = await axios.get(`${API_URL}/api/wishlist/${userId}`);
      if (res.data.success) {
        const wishlistProductIds = res.data.wishlist.map(item => item.productId?._id);
        setWishlistItems(wishlistProductIds);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchWishlist();
    // Check URL for category filter
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  // Search and Filter
  useEffect(() => {
    let result = [...productList];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min) {
      result = result.filter((item) => item.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter((item) => item.price <= Number(priceRange.max));
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [searchTerm, sortBy, selectedCategory, priceRange, productList]);

  const handleAddToCart = async (productId, productPrice) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to add items to cart", "warning");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/cart/add`, {
        productId,
        productPrice,
        userId: localStorage.getItem("userId"),
        quantity: 1,
      });
      showToast(res.data.message, "success");
      // Update cart count in navbar
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.log(error);
      showToast("Failed to add product to cart", "error");
    }
  };

  const handleAddToWishlist = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to add to wishlist", "warning");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/wishlist/add`, {
        productId,
        userId: localStorage.getItem("userId"),
      });
      if (res.data.success) {
        setWishlistItems([...wishlistItems, productId]);
        showToast("Added to wishlist!", "success");
      } else {
        showToast(res.data.message, "info");
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Already in wishlist", "info");
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await axios.get(`${API_URL}/api/wishlist/${userId}`);
      const wishlistItem = res.data.wishlist.find(item => item.productId?._id === productId);
      if (wishlistItem) {
        await axios.delete(`${API_URL}/api/wishlist/remove/${wishlistItem._id}`);
        setWishlistItems(wishlistItems.filter(id => id !== productId));
        showToast("Removed from wishlist", "success");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleWishlist = (productId) => {
    if (wishlistItems.includes(productId)) {
      handleRemoveFromWishlist(productId);
    } else {
      handleAddToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => wishlistItems.includes(productId);

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    const icons = {
      success: "bi-check-circle-fill",
      error: "bi-exclamation-circle-fill",
      warning: "bi-exclamation-triangle-fill",
      info: "bi-info-circle-fill",
    };
    toast.innerHTML = `
      <i class="bi ${icons[type] || icons.info} me-2"></i>
      ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("default");
    setSelectedCategory("All");
    setPriceRange({ min: "", max: "" });
  };

  // Count active filters
  const activeFilterCount = [
    selectedCategory !== "All",
    priceRange.min !== "",
    priceRange.max !== "",
    sortBy !== "default",
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: "#f8fafc" }}>
      {/* Page Header */}
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }} className="text-white py-4 mb-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-2" style={{ fontSize: "14px" }}>
                  <li className="breadcrumb-item">
                    <Link to="/home" className="text-white-50 text-decoration-none">
                      <i className="bi bi-house me-1"></i>Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item text-white active">Products</li>
                </ol>
              </nav>
              <h2 className="fw-bold mb-1">
                {selectedCategory === "All" ? "All Products" : selectedCategory}
              </h2>
              <p className="text-white-50 mb-0">
                Showing {filteredProducts.length} of {productList.length} products
              </p>
            </div>
            <div className="col-md-6">
              {/* Search Bar in Header */}
              <div className="input-group mt-3 mt-md-0">
                <span className="input-group-text bg-white border-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-control-lg border-0"
                  placeholder="Search for products, brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4">
        <div className="row">
          {/* Mobile Filter Overlay */}
          <div 
            className={`filter-overlay ${showFilters ? 'show' : ''}`}
            onClick={() => setShowFilters(false)}
          ></div>

          {/* Mobile Filter Toggle Button */}
          <button 
            className="filter-toggle-btn" 
            onClick={() => setShowFilters(true)}
          >
            <i className="bi bi-sliders"></i>
            {activeFilterCount > 0 && (
              <span className="filter-count">{activeFilterCount}</span>
            )}
          </button>

          {/* Sidebar Filters */}
          <div className="col-lg-3 mb-4">
            <div className={`filter-sidebar ${showFilters ? 'show' : ''}`}>
              {/* Mobile Close Button */}
              <button 
                className="filter-close-btn"
                onClick={() => setShowFilters(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>

              {/* Filter Header */}
              <div className="filter-header d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold d-flex align-items-center">
                  <span className="filter-icon-wrapper me-2">
                    <i className="bi bi-sliders"></i>
                  </span>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="badge bg-primary ms-2 rounded-pill">{activeFilterCount}</span>
                  )}
                </h5>
                <button onClick={clearFilters} className="btn btn-sm btn-outline-danger rounded-pill px-3">
                  <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
                </button>
              </div>

              {/* Categories Section */}
              <div className="filter-section mb-4">
                <h6 className="filter-section-title mb-3">
                  <i className="bi bi-grid-3x3-gap me-2"></i>Categories
                </h6>
                <div className="category-list">
                  <div
                    className={`category-item ${selectedCategory === "All" ? "active" : ""}`}
                    onClick={() => setSelectedCategory("All")}
                  >
                    <span className="category-icon">
                      <i className="bi bi-collection"></i>
                    </span>
                    <span className="category-name">All</span>
                    <span className="category-count">{productList.length}</span>
                  </div>
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className={`category-item ${selectedCategory === cat ? "active" : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span className="category-icon">
                        <i className="bi bi-tag"></i>
                      </span>
                      <span className="category-name">{cat}</span>
                      <span className="category-count">
                        {productList.filter(p => p.category === cat).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Section */}
              <div className="filter-section mb-4">
                <h6 className="filter-section-title mb-3">
                  <i className="bi bi-currency-rupee me-2"></i>Price Range
                </h6>
                <div className="price-inputs d-flex align-items-center gap-2 mb-3">
                  <div className="price-input-wrapper">
                    <span className="price-symbol">₹</span>
                    <input
                      type="number"
                      className="price-input"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    />
                  </div>
                  <span className="text-muted">—</span>
                  <div className="price-input-wrapper">
                    <span className="price-symbol">₹</span>
                    <input
                      type="number"
                      className="price-input"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    />
                  </div>
                </div>
                <div className="quick-price-tags">
                  <span 
                    className={`price-tag ${priceRange.max === "5000" && !priceRange.min ? "active" : ""}`}
                    onClick={() => setPriceRange({ min: "", max: "5000" })}
                  >
                    Under ₹5,000
                  </span>
                  <span 
                    className={`price-tag ${priceRange.min === "5000" && priceRange.max === "15000" ? "active" : ""}`}
                    onClick={() => setPriceRange({ min: "5000", max: "15000" })}
                  >
                    ₹5K - ₹15K
                  </span>
                  <span 
                    className={`price-tag ${priceRange.min === "15000" && priceRange.max === "50000" ? "active" : ""}`}
                    onClick={() => setPriceRange({ min: "15000", max: "50000" })}
                  >
                    ₹15K - ₹50K
                  </span>
                  <span 
                    className={`price-tag ${priceRange.min === "50000" && !priceRange.max ? "active" : ""}`}
                    onClick={() => setPriceRange({ min: "50000", max: "" })}
                  >
                    Above ₹50K
                  </span>
                </div>
              </div>

              {/* Sort Section */}
              <div className="filter-section">
                <h6 className="filter-section-title mb-3">
                  <i className="bi bi-sort-down me-2"></i>Sort By
                </h6>
                <div className="sort-options">
                  {[
                    { value: "default", label: "Default", icon: "bi-arrow-repeat" },
                    { value: "price-low", label: "Price: Low to High", icon: "bi-sort-numeric-up" },
                    { value: "price-high", label: "Price: High to Low", icon: "bi-sort-numeric-down" },
                    { value: "name", label: "Name: A to Z", icon: "bi-sort-alpha-down" },
                    { value: "rating", label: "Highest Rating", icon: "bi-star" },
                    { value: "newest", label: "Newest First", icon: "bi-calendar" }
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`sort-option ${sortBy === option.value ? "active" : ""}`}
                      onClick={() => setSortBy(option.value)}
                    >
                      <i className={`bi ${option.icon} me-2`}></i>
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-lg-9">
            {/* Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
              <div className="d-flex align-items-center gap-3">
                <span className="text-muted">
                  <strong className="text-dark">{filteredProducts.length}</strong> products found
                </span>
                {(searchTerm || selectedCategory !== "All" || priceRange.min || priceRange.max) && (
                  <div className="d-flex gap-2 flex-wrap">
                    {searchTerm && (
                      <span className="badge bg-primary-subtle text-primary rounded-pill">
                        "{searchTerm}" <i className="bi bi-x ms-1" style={{cursor: "pointer"}} onClick={() => setSearchTerm("")}></i>
                      </span>
                    )}
                    {selectedCategory !== "All" && (
                      <span className="badge bg-success-subtle text-success rounded-pill">
                        {selectedCategory} <i className="bi bi-x ms-1" style={{cursor: "pointer"}} onClick={() => setSelectedCategory("All")}></i>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="btn-group">
                <button
                  className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <i className="bi bi-grid-3x3-gap-fill"></i>
                </button>
                <button
                  className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body text-center py-5">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3" 
                     style={{ width: "100px", height: "100px" }}>
                  <i className="bi bi-search text-primary" style={{ fontSize: "40px" }}></i>
                </div>
                <h4 className="fw-bold">No Products Found</h4>
                <p className="text-muted">Try adjusting your search or filter criteria</p>
                <button className="btn btn-primary rounded-pill px-4" onClick={clearFilters}>
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Reset Filters
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="row g-4">
              {filteredProducts.map((item) => (
                <div className="col-6 col-md-4 col-xl-3" key={item._id}>
                  <div className="card border-0 shadow-sm h-100 position-relative rounded-4 overflow-hidden product-card">
                    {/* Wishlist Button - Only for non-admin users */}
                    {!isAdmin && (
                      <button
                        onClick={() => toggleWishlist(item._id)}
                        className={`btn position-absolute top-0 end-0 m-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center wishlist-btn ${isInWishlist(item._id) ? 'btn-danger' : 'btn-light'}`}
                        style={{ width: "38px", height: "38px", zIndex: 10 }}
                        title={isInWishlist(item._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <i className={`bi ${isInWishlist(item._id) ? 'bi-heart-fill text-white' : 'bi-heart text-danger'}`}></i>
                      </button>
                    )}
                    
                    {/* Discount Badge */}
                    {item.originalPrice && (
                      <span className="position-absolute top-0 start-0 badge bg-danger m-2 rounded-pill" style={{ zIndex: 5 }}>
                        {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                      </span>
                    )}
                    
                    {/* Product Image */}
                    <Link to={`/product/${item._id}`} className="text-decoration-none">
                      <div className="bg-light p-3 text-center product-img-wrapper">
                        <img
                          src={item.img?.startsWith("http") ? item.img : `${API_URL}${item.img}`}
                          className="img-fluid product-img"
                          alt={item.name}
                          style={{ height: "160px", objectFit: "contain" }}
                        />
                      </div>
                    </Link>
                    
                    <div className="card-body d-flex flex-column p-3">
                      {/* Category Badge */}
                      <span className="badge bg-primary-subtle text-primary mb-2 align-self-start rounded-pill" style={{ fontSize: "11px" }}>
                        {item.category || "Product"}
                      </span>
                      
                      {/* Product Name */}
                      <Link to={`/product/${item._id}`} className="text-decoration-none">
                        <h6 className="card-title fw-bold mb-1 text-dark" style={{ fontSize: "14px", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {item.name}
                        </h6>
                      </Link>

                      {/* Brand */}
                      {item.brand && <small className="text-muted mb-1">{item.brand}</small>}
                      
                      {/* Rating */}
                      <div className="d-flex align-items-center gap-1 mb-2">
                        <span className="badge bg-success d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                          {item.rating?.toFixed(1) || "4.0"} <i className="bi bi-star-fill"></i>
                        </span>
                        <small className="text-muted">({item.reviewCount || 0})</small>
                      </div>
                      
                      {/* Price */}
                      <div className="mt-auto">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="h6 text-dark fw-bold mb-0">
                            ₹{item.price?.toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <small className="text-muted text-decoration-line-through">
                              ₹{item.originalPrice.toLocaleString()}
                            </small>
                          )}
                        </div>
                        
                        {/* Action Buttons - Different for Admin and User */}
                        {isAdmin ? (
                          <Link to={`/product/${item._id}`} className="btn btn-outline-primary w-100 btn-sm rounded-pill">
                            <i className="bi bi-eye me-1"></i>View Details
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item._id, item.price)}
                            className="btn btn-primary w-100 btn-sm rounded-pill"
                          >
                            <i className="bi bi-cart-plus me-1"></i>Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="d-flex flex-column gap-3">
              {filteredProducts.map((item) => (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden product-card" key={item._id}>
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <Link to={`/product/${item._id}`} className="d-block bg-light rounded-3 p-3 text-center">
                          <img
                            src={item.img?.startsWith("http") ? item.img : `${API_URL}${item.img}`}
                            alt={item.name}
                            className="img-fluid"
                            style={{ maxHeight: "140px", objectFit: "contain" }}
                          />
                        </Link>
                      </div>
                      <div className="col-md-6 mt-3 mt-md-0">
                        <span className="badge bg-primary-subtle text-primary mb-2 rounded-pill">
                          {item.category || "Product"}
                        </span>
                        <Link to={`/product/${item._id}`} className="text-decoration-none">
                          <h5 className="fw-bold text-dark mb-1">{item.name}</h5>
                        </Link>
                        {item.brand && <p className="text-muted small mb-2">{item.brand}</p>}
                        <p className="text-muted mb-2" style={{ fontSize: "14px" }}>{item.description?.substring(0, 120)}...</p>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-success d-flex align-items-center gap-1">
                            {item.rating?.toFixed(1) || "4.0"} <i className="bi bi-star-fill"></i>
                          </span>
                          <small className="text-muted">({item.reviewCount || 0} reviews)</small>
                          {item.stock > 0 ? (
                            <span className="badge bg-success-subtle text-success">In Stock</span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger">Out of Stock</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3 text-md-end mt-3 mt-md-0">
                        <div className="mb-3">
                          <span className="h4 text-dark fw-bold">₹{item.price?.toLocaleString()}</span>
                          {item.originalPrice && (
                            <>
                              <small className="text-muted text-decoration-line-through d-block">
                                ₹{item.originalPrice.toLocaleString()}
                              </small>
                              <span className="badge bg-danger rounded-pill">
                                {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Action Buttons - Different for Admin and User */}
                        {isAdmin ? (
                          <Link to={`/product/${item._id}`} className="btn btn-outline-primary w-100 rounded-pill">
                            <i className="bi bi-eye me-2"></i>View Details
                          </Link>
                        ) : (
                          <div className="d-flex flex-column gap-2">
                            <button
                              onClick={() => handleAddToCart(item._id, item.price)}
                              className="btn btn-primary rounded-pill"
                            >
                              <i className="bi bi-cart-plus me-2"></i>Add to Cart
                            </button>
                            <button
                              onClick={() => toggleWishlist(item._id)}
                              className={`btn rounded-pill ${isInWishlist(item._id) ? 'btn-danger' : 'btn-outline-danger'}`}
                            >
                              <i className={`bi ${isInWishlist(item._id) ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                              {isInWishlist(item._id) ? 'In Wishlist' : 'Wishlist'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
