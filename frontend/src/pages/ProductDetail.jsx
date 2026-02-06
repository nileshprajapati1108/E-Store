import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (userId) checkWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/product/${id}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.product);
        fetchRelatedProducts(data.product.category);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/reviews/${id}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await fetch(`http://localhost:3000/api/products/search?category=${category}`);
      const data = await response.json();
      if (data.success) {
        setRelatedProducts(data.products.filter((p) => p._id !== id).slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const checkWishlist = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/wishlist/check/${userId}/${id}`);
      const data = await response.json();
      if (data.success) {
        setInWishlist(data.inWishlist);
        setWishlistItemId(data.wishlistItemId);
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (inWishlist) {
        await fetch(`http://localhost:3000/api/wishlist/remove/${wishlistItemId}`, {
          method: "DELETE",
        });
        setInWishlist(false);
        setWishlistItemId(null);
        showToast("Removed from wishlist", "success");
      } else {
        const response = await fetch("http://localhost:3000/api/wishlist/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, productId: id }),
        });
        const data = await response.json();
        if (data.success) {
          setInWishlist(true);
          showToast("Added to wishlist!", "success");
          checkWishlist();
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const addToCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: id,
          productPrice: product.price,
          quantity,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToast("Added to cart!", "success");
        // Update cart count in navbar
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const buyNow = async () => {
    await addToCart();
    navigate("/cart");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/review/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: id,
          ...reviewForm,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showToast("Review submitted!", "success");
        setReviewForm({ rating: 5, comment: "" });
        fetchReviews();
        fetchProduct();
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} me-2"></i>
      ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

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

  if (!product) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h3>Product not found</h3>
          <Link to="/product" className="btn btn-primary mt-3">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container py-5 fade-in">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/home" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/product" className="text-decoration-none">Products</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/product?category=${product.category}`} className="text-decoration-none">
              {product.category}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="row g-5">
        {/* Product Images */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm overflow-hidden sticky-top" style={{ top: "100px" }}>
            <div className="position-relative">
              {discount > 0 && (
                <span className="position-absolute top-0 start-0 badge bg-danger m-3 px-3 py-2 fs-6">
                  -{discount}% OFF
                </span>
              )}
              <button
                onClick={toggleWishlist}
                className={`detail-wishlist-btn ${
                  inWishlist ? "active" : ""
                }`}
                title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <i className={`fa-${inWishlist ? "solid" : "regular"} fa-heart`}></i>
              </button>
              <img
                src={product.img?.startsWith("http") ? product.img : `http://localhost:3000${product.img}`}
                alt={product.name}
                className="w-100"
                style={{ height: "450px", objectFit: "contain", padding: "2rem" }}
              />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="col-lg-6">
          <span className="badge bg-primary-subtle text-primary mb-3 px-3 py-2">
            {product.category}
          </span>

          <h1 className="fw-bold mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="rating-stars fs-5">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fa-star ${i < Math.floor(product.rating || 0) ? "fa-solid text-warning" : "fa-regular text-muted"}`}
                ></i>
              ))}
            </div>
            <span className="text-muted">
              {product.rating?.toFixed(1) || "0.0"} ({product.reviewCount || 0} reviews)
            </span>
            {product.stock > 0 ? (
              <span className="badge bg-success-subtle text-success">In Stock</span>
            ) : (
              <span className="badge bg-danger-subtle text-danger">Out of Stock</span>
            )}
          </div>

          {/* Price */}
          <div className="bg-light rounded-4 p-4 mb-4">
            <div className="d-flex align-items-end gap-3">
              <span className="display-5 fw-bold text-primary">
                ₹{product.price?.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="h4 text-muted text-decoration-line-through mb-2">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="badge bg-success fs-6 mb-2">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
                </>
              )}
            </div>
            <small className="text-muted">Inclusive of all taxes</small>
          </div>

          {/* Brand */}
          {product.brand && (
            <div className="mb-3">
              <span className="text-muted">Brand: </span>
              <span className="fw-semibold">{product.brand}</span>
            </div>
          )}

          {/* Quantity - Hide for Admin */}
          {!isAdmin && (
            <div className="mb-4">
              <label className="form-label fw-semibold">Quantity</label>
              <div className="d-flex align-items-center gap-3">
                <div className="btn-group" role="group">
                  <button
                    className="btn btn-outline-primary px-3"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <span className="btn btn-outline-primary px-4 fw-bold">{quantity}</span>
                  <button
                    className="btn btn-outline-primary px-3"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
                <small className="text-muted">Maximum 10 per order</small>
              </div>
            </div>
          )}

          {/* Actions - Hide for Admin */}
          {!isAdmin && (
            <div className="d-flex gap-3 mb-4">
              <button onClick={addToCart} className="btn btn-outline-primary btn-lg flex-grow-1" disabled={product.stock === 0}>
                <i className="fa-solid fa-cart-plus me-2"></i>
                Add to Cart
              </button>
              <button onClick={buyNow} className="btn btn-primary btn-lg flex-grow-1" disabled={product.stock === 0}>
                <i className="fa-solid fa-bolt me-2"></i>
                Buy Now
              </button>
            </div>
          )}

          {/* Features */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <i className="fa-solid fa-truck text-primary fs-4"></i>
                <div>
                  <small className="text-muted d-block">Delivery</small>
                  <span className="fw-semibold">Free Shipping</span>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <i className="fa-solid fa-rotate-left text-primary fs-4"></i>
                <div>
                  <small className="text-muted d-block">Returns</small>
                  <span className="fw-semibold">7 Days Return</span>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <i className="fa-solid fa-shield-halved text-primary fs-4"></i>
                <div>
                  <small className="text-muted d-block">Warranty</small>
                  <span className="fw-semibold">1 Year</span>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <i className="fa-solid fa-credit-card text-primary fs-4"></i>
                <div>
                  <small className="text-muted d-block">Payment</small>
                  <span className="fw-semibold">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="card border-0 shadow-sm mt-5">
        <div className="card-header bg-white border-0 pt-4">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
              >
                <i className="fa-solid fa-info-circle me-2"></i>
                Description
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                <i className="fa-solid fa-star me-2"></i>
                Reviews ({reviews.length})
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-4">
          {activeTab === "description" && (
            <div>
              <h5 className="fw-bold mb-3">Product Description</h5>
              <p className="text-muted mb-0" style={{ lineHeight: "1.8" }}>
                {product.description}
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              {/* Review Form */}
              {token && (
                <div className="bg-light rounded-4 p-4 mb-4">
                  <h5 className="fw-bold mb-3">Write a Review</h5>
                  <form onSubmit={submitReview}>
                    <div className="mb-3">
                      <label className="form-label">Rating</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fa-star fa-2x cursor-pointer ${
                              star <= reviewForm.rating ? "fa-solid text-warning" : "fa-regular text-muted"
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          ></i>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Your Review</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Share your experience with this product..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      <i className="fa-solid fa-paper-plane me-2"></i>
                      Submit Review
                    </button>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fa-regular fa-comment-dots fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="review-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-bottom pb-4 mb-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                            style={{ width: "45px", height: "45px" }}
                          >
                            <i className="fa-solid fa-user"></i>
                          </div>
                          <div>
                            <h6 className="mb-0 fw-semibold">
                              {review.userId?.name || review.userId?.email?.split("@")[0]}
                            </h6>
                            <div className="rating-stars">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fa-star ${i < review.rating ? "fa-solid text-warning" : "fa-regular text-muted"}`}
                                ></i>
                              ))}
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </small>
                      </div>
                      <p className="text-muted mb-0 ms-5 ps-3">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">Related Products</h3>
            <Link to={`/product?category=${product.category}`} className="btn btn-outline-primary">
              View All <i className="fa-solid fa-arrow-right ms-2"></i>
            </Link>
          </div>
          <div className="row g-4">
            {relatedProducts.map((relProduct) => (
              <div key={relProduct._id} className="col-6 col-md-3">
                <Link to={`/product/${relProduct._id}`} className="text-decoration-none">
                  <div className="card card-product h-100">
                    <img
                      src={relProduct.img?.startsWith("http") ? relProduct.img : `http://localhost:3000${relProduct.img}`}
                      className="card-img-top"
                      alt={relProduct.name}
                      style={{ height: "180px", objectFit: "contain", padding: "1rem" }}
                    />
                    <div className="card-body">
                      <h6 className="card-title fw-semibold text-dark text-truncate">{relProduct.name}</h6>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-primary">₹{relProduct.price?.toLocaleString()}</span>
                        {relProduct.originalPrice && (
                          <small className="text-muted text-decoration-line-through">
                            ₹{relProduct.originalPrice.toLocaleString()}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
