import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/wishlist/${userId}`);
      const data = await response.json();
      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeFromWishlist = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/wishlist/remove/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setWishlist(wishlist.filter((item) => item._id !== itemId));
        showToast("Removed from wishlist", "success");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const addToCart = async (productId, price) => {
    try {
      const response = await fetch("http://localhost:3000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId,
          productPrice: price,
          quantity: 1,
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

  const moveAllToCart = async () => {
    for (const item of wishlist) {
      await addToCart(item.productId?._id, item.productId?.price);
    }
    showToast("All items added to cart!", "success");
  };

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
      <i class="bi ${type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"} me-2"></i>
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

  return (
    <div className="container py-5 fade-in">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-2">
                  <li className="breadcrumb-item"><Link to="/home" className="text-decoration-none">Home</Link></li>
                  <li className="breadcrumb-item active">Wishlist</li>
                </ol>
              </nav>
              <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
                <span className="d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10" style={{ width: "50px", height: "50px" }}>
                  <i className="bi bi-heart-fill text-danger fs-4"></i>
                </span>
                My Wishlist
              </h2>
              <p className="text-muted mb-0">
                {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved for later
              </p>
            </div>
            <div className="d-flex gap-2">
              {wishlist.length > 0 && (
                <button onClick={moveAllToCart} className="btn btn-success">
                  <i className="bi bi-cart-plus me-2"></i>
                  Add All to Cart
                </button>
              )}
              <Link to="/product" className="btn btn-primary">
                <i className="bi bi-bag me-2"></i>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <div className="mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10" style={{ width: "120px", height: "120px" }}>
                <i className="bi bi-heart text-danger" style={{ fontSize: "60px" }}></i>
              </div>
            </div>
            <h3 className="fw-bold mb-2">Your Wishlist is Empty</h3>
            <p className="text-muted mb-4">Save items you love by clicking the heart icon on products.</p>
            <Link to="/product" className="btn btn-primary btn-lg px-5">
              <i className="bi bi-bag me-2"></i>
              Explore Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {wishlist.map((item) => (
            <div key={item._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="card border-0 shadow-sm h-100 position-relative rounded-4 overflow-hidden">
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(item._id)}
                  className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                  style={{ width: "38px", height: "38px", zIndex: 10 }}
                  title="Remove from Wishlist"
                >
                  <i className="bi bi-x-lg text-danger"></i>
                </button>

                {/* Heart Badge */}
                <div className="position-absolute top-0 start-0 m-2" style={{ zIndex: 10 }}>
                  <span className="badge bg-danger d-flex align-items-center gap-1">
                    <i className="bi bi-heart-fill"></i> Saved
                  </span>
                </div>
                
                <Link to={`/product/${item.productId?._id}`}>
                  <div className="bg-light p-3">
                    <img
                      src={item.productId?.img?.startsWith("http") ? item.productId.img : `http://localhost:3000${item.productId?.img}`}
                      className="card-img-top"
                      alt={item.productId?.name}
                      style={{ height: "180px", objectFit: "contain" }}
                    />
                  </div>
                </Link>
                
                <div className="card-body d-flex flex-column">
                  <span className="badge bg-primary-subtle text-primary mb-2 align-self-start rounded-pill">
                    {item.productId?.category || "Product"}
                  </span>
                  
                  <Link to={`/product/${item.productId?._id}`} className="text-decoration-none">
                    <h6 className="card-title fw-bold mb-2 text-dark text-truncate">
                      {item.productId?.name}
                    </h6>
                  </Link>
                  
                  <div className="d-flex align-items-center gap-1 mb-2">
                    <div className="rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`bi ${i < Math.floor(item.productId?.rating || 0) ? "bi-star-fill text-warning" : "bi-star text-muted"}`}
                        ></i>
                      ))}
                    </div>
                    <small className="text-muted">({item.productId?.reviewCount || 0})</small>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="h5 text-primary fw-bold mb-0">
                        ₹{item.productId?.price?.toLocaleString()}
                      </span>
                      {item.productId?.originalPrice && (
                        <div className="text-end">
                          <small className="text-muted text-decoration-line-through d-block">
                            ₹{item.productId.originalPrice.toLocaleString()}
                          </small>
                          <small className="text-success fw-semibold">
                            {Math.round(((item.productId.originalPrice - item.productId.price) / item.productId.originalPrice) * 100)}% off
                          </small>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => addToCart(item.productId?._id, item.productId?.price)}
                      className="btn btn-primary w-100 rounded-pill"
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      Move to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
