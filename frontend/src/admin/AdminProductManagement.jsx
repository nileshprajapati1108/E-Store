import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProductManagement = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("Other");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("100");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [viewMode, setViewMode] = useState("table");

  const categories = ["Electronics", "Fashion", "Home & Kitchen", "Sports", "Books", "Beauty", "Toys", "Other"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ADD or UPDATE PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("brand", brand);
      formData.append("stock", stock);
      formData.append("isFeatured", isFeatured);
      if (originalPrice) formData.append("originalPrice", originalPrice);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingId) {
        await axios.put(`${API_URL}/api/product/update/${editingId}`, formData);
        showToast("Product updated successfully!", "success");
      } else {
        await axios.post(`${API_URL}/api/product/add`, formData);
        showToast("Product added successfully!", "success");
      }

      getAllProducts();
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.message || "Error occurred", "danger");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    const icons = {
      success: "bi-check-circle-fill",
      danger: "bi-exclamation-circle-fill",
      warning: "bi-exclamation-triangle-fill",
    };
    toast.innerHTML = `
      <i class="bi ${icons[type] || icons.success} me-2"></i>
      ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setCategory("Other");
    setBrand("");
    setStock("100");
    setIsFeatured(false);
    setImageFile(null);
    setImagePreview("");
    setShowForm(false);
  };

  // GET ALL PRODUCTS
  const getAllProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/product/all`);
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/api/product-remove/${id}`);
      getAllProducts();
      showToast("Product deleted successfully!", "success");
    } catch (err) {
      console.log(err);
      showToast("Failed to delete product", "danger");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setOriginalPrice(product.originalPrice || "");
    setCategory(product.category || "Other");
    setBrand(product.brand || "");
    setStock(product.stock?.toString() || "100");
    setIsFeatured(product.isFeatured || false);
    setImagePreview(product.img?.startsWith("http") ? product.img : `${API_URL}${product.img}`);
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockProducts = products.filter(p => (p.stock || 0) <= 10).length;
  const featuredProducts = products.filter(p => p.isFeatured).length;

  return (
    <div className="min-vh-100" style={{ background: "#f8fafc" }}>
      {/* Admin Header */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }} className="text-white py-4">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-2" style={{ fontSize: "14px" }}>
                  <li className="breadcrumb-item">
                    <Link to="/home" className="text-white-50 text-decoration-none">
                      <i className="bi bi-house me-1"></i>Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item text-white active">Admin Panel</li>
                </ol>
              </nav>
              <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                <div className="d-flex align-items-center justify-content-center rounded-3" 
                     style={{ width: "45px", height: "45px", background: "rgba(255,255,255,0.1)" }}>
                  <i className="bi bi-box-seam fs-4"></i>
                </div>
                Product Management
              </h2>
              <p className="text-white-50 mb-0">Manage your store inventory</p>
            </div>
            <button 
              className={`btn ${showForm ? 'btn-light' : 'btn-warning'} px-4 py-2 fw-semibold`}
              onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
            >
              {showForm ? (
                <><i className="bi bi-x-lg me-2"></i>Cancel</>
              ) : (
                <><i className="bi bi-plus-lg me-2"></i>Add New Product</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: "50px", height: "50px", background: "rgba(79, 70, 229, 0.1)" }}>
                  <i className="bi bi-box-seam text-primary fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small">Total Products</div>
                  <div className="fs-4 fw-bold text-primary">{totalProducts}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: "50px", height: "50px", background: "rgba(16, 185, 129, 0.1)" }}>
                  <i className="bi bi-stack text-success fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small">Total Stock</div>
                  <div className="fs-4 fw-bold text-success">{totalStock}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: "50px", height: "50px", background: "rgba(239, 68, 68, 0.1)" }}>
                  <i className="bi bi-exclamation-triangle text-danger fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small">Low Stock</div>
                  <div className="fs-4 fw-bold text-danger">{lowStockProducts}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: "50px", height: "50px", background: "rgba(245, 158, 11, 0.1)" }}>
                  <i className="bi bi-star-fill text-warning fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small">Featured</div>
                  <div className="fs-4 fw-bold text-warning">{featuredProducts}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card border-0 shadow-lg mb-4 rounded-4 overflow-hidden">
            <div className="card-header py-4 border-0" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-25" 
                     style={{ width: "50px", height: "50px" }}>
                  <i className={`bi ${editingId ? 'bi-pencil-square' : 'bi-plus-lg'} text-white fs-4`}></i>
                </div>
                <div>
                  <h5 className="mb-0 text-white fw-bold">
                    {editingId ? "Update Product" : "Add New Product"}
                  </h5>
                  <small className="text-white-50">Fill in the product details below</small>
                </div>
              </div>
            </div>
            <div className="card-body p-4 p-lg-5" style={{ background: "#fafbfc" }}>
              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  {/* Basic Info Section */}
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" 
                           style={{ width: "28px", height: "28px" }}>
                        <span className="text-white fw-bold small">1</span>
                      </div>
                      <h6 className="mb-0 fw-bold text-dark">Basic Information</h6>
                    </div>
                    <div className="bg-white rounded-4 p-4 shadow-sm">
                      <div className="row g-3">
                        {/* Product Name */}
                        <div className="col-md-8">
                          <label className="form-label fw-semibold text-secondary small text-uppercase">
                            Product Name <span className="text-danger">*</span>
                          </label>
                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-white border-end-0">
                              <i className="bi bi-tag text-primary"></i>
                            </span>
                            <input
                              className="form-control border-start-0 ps-0"
                              placeholder="Enter product name..."
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              style={{ boxShadow: "none" }}
                            />
                          </div>
                        </div>

                        {/* Category */}
                        <div className="col-md-4">
                          <label className="form-label fw-semibold text-secondary small text-uppercase">
                            Category <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select form-select-lg"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Brand */}
                        <div className="col-12">
                          <label className="form-label fw-semibold text-secondary small text-uppercase">
                            Brand Name
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                              <i className="bi bi-building text-secondary"></i>
                            </span>
                            <input
                              className="form-control border-start-0 ps-0"
                              placeholder="Samsung, Nike, Apple, etc. (optional)"
                              value={brand}
                              onChange={(e) => setBrand(e.target.value)}
                              style={{ boxShadow: "none" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="rounded-circle bg-success d-flex align-items-center justify-content-center" 
                           style={{ width: "28px", height: "28px" }}>
                        <span className="text-white fw-bold small">2</span>
                      </div>
                      <h6 className="mb-0 fw-bold text-dark">Pricing & Stock</h6>
                    </div>
                    <div className="bg-white rounded-4 p-4 shadow-sm">
                      <div className="row g-3">
                        {/* Selling Price */}
                        <div className="col-md-4">
                          <label className="form-label fw-semibold text-secondary small text-uppercase">
                            Selling Price <span className="text-danger">*</span>
                          </label>
                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-success text-white fw-bold">₹</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="499"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              required
                              style={{ boxShadow: "none" }}
                            />
                          </div>
                          <small className="text-success"><i className="bi bi-info-circle me-1"></i>Customer pays this</small>
                        </div>

                        {/* Original Price */}
                        <div className="col-md-4">
                          <label className="form-label fw-semibold text-secondary small text-uppercase">
                            MRP / Original Price
                          </label>
                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-secondary text-white fw-bold">₹</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="999"
                              value={originalPrice}
                              onChange={(e) => setOriginalPrice(e.target.value)}
                              style={{ boxShadow: "none" }}
                            />
                          </div>
                          <small className="text-muted"><i className="bi bi-percent me-1"></i>For discount calculation</small>
                        </div>

                        {/* Stock */}
                        <div className="col-md-4">
                          <label className="form-label fw-semibold text-secondary small text-uppercase">
                            Stock Quantity <span className="text-danger">*</span>
                          </label>
                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-info text-white">
                              <i className="bi bi-boxes"></i>
                            </span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="100"
                              value={stock}
                              onChange={(e) => setStock(e.target.value)}
                              required
                              style={{ boxShadow: "none" }}
                            />
                          </div>
                        </div>

                        {/* Discount Preview */}
                        {price && originalPrice && Number(originalPrice) > Number(price) && (
                          <div className="col-12">
                            <div className="alert alert-success d-flex align-items-center gap-3 mb-0 rounded-3">
                              <div className="d-flex align-items-center justify-content-center rounded-circle bg-success" 
                                   style={{ width: "45px", height: "45px" }}>
                                <i className="bi bi-tag-fill text-white fs-5"></i>
                              </div>
                              <div>
                                <div className="fw-bold">Discount Applied!</div>
                                <span className="text-success">
                                  Customers save ₹{Number(originalPrice) - Number(price)} ({Math.round(((originalPrice - price) / originalPrice) * 100)}% off)
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description & Featured */}
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center" 
                           style={{ width: "28px", height: "28px" }}>
                        <span className="text-dark fw-bold small">3</span>
                      </div>
                      <h6 className="mb-0 fw-bold text-dark">Description & Options</h6>
                    </div>
                    <div className="bg-white rounded-4 p-4 shadow-sm">
                      <div className="row g-3">
                        {/* Description */}
                        <div className="col-md-8">
                          <label className="form-label fw-semibold text-secondary small text-uppercase">
                            Product Description <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Describe your product features, specifications, benefits..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            style={{ boxShadow: "none", resize: "none" }}
                          />
                          <small className="text-muted">{description.length}/500 characters</small>
                        </div>

                        {/* Featured Toggle */}
                        <div className="col-md-4">
                          <label className="form-label fw-semibold text-secondary small text-uppercase">
                            Product Status
                          </label>
                          <div 
                            className={`p-3 rounded-3 h-100 d-flex flex-column align-items-center justify-content-center text-center cursor-pointer border-2 ${isFeatured ? 'border-warning bg-warning bg-opacity-10' : 'border-secondary border-opacity-25 bg-light'}`}
                            onClick={() => setIsFeatured(!isFeatured)}
                            style={{ cursor: "pointer", minHeight: "120px" }}
                          >
                            <i className={`bi bi-star${isFeatured ? '-fill text-warning' : ' text-secondary'} fs-1 mb-2`}></i>
                            <div className="form-check form-switch mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) => setIsFeatured(e.target.checked)}
                                style={{ width: "3em", height: "1.5em" }}
                              />
                            </div>
                            <small className={`fw-semibold mt-2 ${isFeatured ? 'text-warning' : 'text-muted'}`}>
                              {isFeatured ? '⭐ Featured Product' : 'Mark as Featured'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div className="rounded-circle bg-danger d-flex align-items-center justify-content-center" 
                          style={{ width: "28px", height: "28px" }}>
                        <span className="text-white fw-bold small">4</span>
                      </div>
                      <h6 className="mb-0 fw-bold text-dark">Product Image</h6>
                    </div>
                    <div className="bg-white rounded-4 p-4 shadow-sm">
                      <div className="row g-3 align-items-center">
                        <div className="col-md-6">
                          <div 
                            className="border-2 border-dashed rounded-4 p-4 text-center bg-light position-relative"
                            style={{ borderStyle: "dashed", minHeight: "180px" }}
                          >
                            <input
                              type="file"
                              className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                              onChange={handleImageChange}
                              accept="image/*"
                              style={{ cursor: "pointer" }}
                            />
                            <i className="bi bi-cloud-arrow-up text-primary" style={{ fontSize: "50px" }}></i>
                            <div className="mt-2">
                              <span className="fw-semibold text-dark">Drop image here or </span>
                              <span className="text-primary fw-bold">Browse</span>
                            </div>
                            <small className="text-muted d-block mt-1">PNG, JPG, WEBP up to 5MB</small>
                          </div>
                        </div>

                        {/* Image Preview */}
                        <div className="col-md-6">
                          {imagePreview ? (
                            <div className="d-flex align-items-center gap-4 p-3 bg-success bg-opacity-10 rounded-4">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="rounded-3 border shadow-sm" 
                                style={{ width: "120px", height: "120px", objectFit: "contain", background: "white" }} 
                              />
                              <div>
                                <div className="d-flex align-items-center gap-2 text-success fw-semibold mb-2">
                                  <i className="bi bi-check-circle-fill fs-5"></i>
                                  Image Ready!
                                </div>
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger rounded-pill"
                                  onClick={() => { setImagePreview(""); setImageFile(null); }}
                                >
                                  <i className="bi bi-trash me-1"></i>Remove Image
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-muted py-4">
                              <i className="bi bi-image fs-1 opacity-25"></i>
                              <p className="mb-0 mt-2">No image selected</p>
                              {!editingId && <small className="text-danger">* Image is required</small>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="col-12">
                    <div className="bg-white rounded-4 p-4 shadow-sm">
                      <div className="d-flex gap-3 flex-wrap justify-content-between align-items-center">
                        <div className="text-muted">
                          <i className="bi bi-info-circle me-2"></i>
                          Fields marked with <span className="text-danger">*</span> are required
                        </div>
                        <div className="d-flex gap-3">
                          <button type="button" className="btn btn-light btn-lg px-4 rounded-pill" onClick={resetForm}>
                            <i className="bi bi-x-lg me-2"></i>Cancel
                          </button>
                          <button type="submit" className="btn btn-primary btn-lg px-5 rounded-pill shadow" disabled={loading}>
                            {loading ? (
                              <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                            ) : (
                              <><i className={`bi ${editingId ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>{editingId ? "Update Product" : "Add Product"}</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {/* Header with Search & Filter */}
          <div className="card-header bg-white py-3 border-bottom">
            <div className="row align-items-center g-3">
              {/* Title */}
              <div className="col-12 col-md-auto">
                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-list-ul text-primary"></i>
                  All Products 
                  <span className="badge bg-primary rounded-pill">{filteredProducts.length}</span>
                </h5>
              </div>
              
              {/* Search */}
              <div className="col-12 col-md">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="col-6 col-md-auto">
                <select
                  className="form-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* View Toggle - Fixed Position */}
              <div className="col-6 col-md-auto">
                <div className="btn-group w-100">
                  <button 
                    className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('table')}
                    title="List View"
                  >
                    <i className="bi bi-list-ul me-1"></i>
                    <span className="d-none d-lg-inline">List</span>
                  </button>
                  <button 
                    className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <i className="bi bi-grid-3x3-gap me-1"></i>
                    <span className="d-none d-lg-inline">Grid</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-5">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3" 
                     style={{ width: "100px", height: "100px" }}>
                  <i className="bi bi-box-seam text-primary" style={{ fontSize: "50px" }}></i>
                </div>
                <h4 className="fw-bold">No Products Found</h4>
                <p className="text-muted">Start by adding your first product</p>
                <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowForm(true)}>
                  <i className="bi bi-plus-lg me-2"></i>Add Product
                </button>
              </div>
            ) : viewMode === 'table' ? (
              /* Table View */
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className="text-center pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p._id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={p.img?.startsWith("http") ? p.img : `${API_URL}${p.img}`}
                              alt={p.name}
                              className="rounded-3 bg-light border"
                              style={{ width: "55px", height: "55px", objectFit: "contain", padding: "5px" }}
                            />
                            <div>
                              <div className="fw-semibold">{p.name}</div>
                              {p.brand && <small className="text-muted">{p.brand}</small>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary rounded-pill">{p.category || "Other"}</span>
                        </td>
                        <td>
                          <div>
                            <span className="fw-bold text-success">₹{p.price?.toLocaleString()}</span>
                            {p.originalPrice && (
                              <>
                                <small className="text-muted text-decoration-line-through d-block">
                                  ₹{p.originalPrice?.toLocaleString()}
                                </small>
                                <small className="text-danger">
                                  {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% off
                                </small>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${
                            (p.stock || 0) > 10 ? "bg-success" : 
                            (p.stock || 0) > 0 ? "bg-warning text-dark" : "bg-danger"
                          }`}>
                            <i className="bi bi-box me-1"></i>
                            {p.stock || 0}
                          </span>
                        </td>
                        <td>
                          {p.isFeatured ? (
                            <span className="badge bg-warning text-dark rounded-pill">
                              <i className="bi bi-star-fill me-1"></i>Featured
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="text-center pe-4">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                              onClick={() => handleEdit(p)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill px-3"
                              onClick={() => handleDelete(p._id)}
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="p-4">
                <div className="row g-4">
                  {filteredProducts.map((p) => (
                    <div key={p._id} className="col-6 col-md-4 col-lg-3">
                      <div className="card border h-100 rounded-4 overflow-hidden position-relative">
                        {/* Featured Badge */}
                        {p.isFeatured && (
                          <div className="position-absolute top-0 start-0 m-2" style={{ zIndex: 5 }}>
                            <span className="badge bg-warning text-dark rounded-pill">
                              <i className="bi bi-star-fill me-1"></i>Featured
                            </span>
                          </div>
                        )}
                        
                        {/* Stock Badge */}
                        <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 5 }}>
                          <span className={`badge rounded-pill ${
                            (p.stock || 0) > 10 ? "bg-success" : 
                            (p.stock || 0) > 0 ? "bg-warning text-dark" : "bg-danger"
                          }`}>
                            {p.stock || 0}
                          </span>
                        </div>

                        <div className="bg-light p-3">
                          <img
                            src={p.img?.startsWith("http") ? p.img : `${API_URL}${p.img}`}
                            alt={p.name}
                            className="w-100"
                            style={{ height: "120px", objectFit: "contain" }}
                          />
                        </div>
                        
                        <div className="card-body p-3">
                          <span className="badge bg-primary-subtle text-primary rounded-pill mb-2" style={{ fontSize: "10px" }}>
                            {p.category || "Other"}
                          </span>
                          <h6 className="fw-bold mb-1 text-truncate">{p.name}</h6>
                          {p.brand && <small className="text-muted d-block mb-2">{p.brand}</small>}
                          
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="fw-bold text-success">₹{p.price?.toLocaleString()}</span>
                            {p.originalPrice && (
                              <small className="text-muted text-decoration-line-through">
                                ₹{p.originalPrice?.toLocaleString()}
                              </small>
                            )}
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-primary flex-grow-1 rounded-pill"
                              onClick={() => handleEdit(p)}
                            >
                              <i className="bi bi-pencil me-1"></i>Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill"
                              onClick={() => handleDelete(p._id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductManagement;
