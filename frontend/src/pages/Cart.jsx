import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios'

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);


  const fetchCartItems = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/cart/${localStorage.getItem("userId")}`);
      const data = await response.json();
      if (data.success) {
        setCartItems(data.cartItems);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRemoveItem = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cart/remove/${itemId}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
        showToast("Item removed from cart", "success");
        // Update cart count in navbar
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const fetchClearCart = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/cart/clear/${localStorage.getItem("userId")}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        setCartItems([]);
        setAppliedCoupon(null);
        showToast("Cart cleared", "success");
        // Update cart count in navbar
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  useEffect(() => {
  fetchCartItems();
}, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > 10) {
      showToast("Maximum 10 items allowed", "error");
      return;
    }
    
    try {
      // Optimistic update
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      // API call to update
      await fetch(`http://localhost:3000/api/cart/update/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Revert on error
      fetchCartItems();
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    
    setCouponLoading(true);
    setCouponError("");
    
    try {
      const response = await fetch("http://localhost:3000/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: calculateSubtotal(),
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponError("");
        showToast(`Coupon applied! You save ₹${data.coupon.discount.toFixed(2)}`, "success");
      } else {
        setCouponError(data.message);
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.log(error);   
      setCouponError("Error validating coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    showToast("Coupon removed", "success");
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

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.productPrice * item.quantity,
      0
    );
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discount;
  };

  const calculateTax = () => {
    return (calculateSubtotal() - calculateDiscount()) * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
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

  const handlePayment = async () => {
    const totalAmount = Math.round(calculateTotal());
        try {
            // Create order via backend
            const response = await axios.post('http://localhost:3000/create-order', {
                amount: totalAmount, // Amount in rupees
                currency: 'INR',
            });

            const { id: order_id, amount, currency } = response.data;

            // Set up RazorPay options
            const options = {
                key: 'rzp_test_RuGHFJ0Pe2wy75', // Replace with your RazorPay Key ID
                amount: amount,
                currency: currency,
                name: "E Store",
                description: "Test Transaction",
                order_id: order_id,
                handler: async (paymentResponse) => {
                    try {
                        // Create order in database
                        const orderItems = cartItems.map(item => ({
                            productId: item.productId._id,
                            quantity: item.quantity,
                            price: item.productPrice,
                        }));

                        await axios.post('http://localhost:3000/api/orders/create', {
                            userId: localStorage.getItem("userId"),
                            items: orderItems,
                            totalAmount: calculateTotal(),
                            paymentId: paymentResponse.razorpay_payment_id,
                            razorpayOrderId: paymentResponse.razorpay_order_id,
                        });

                        // Update cart count in navbar (cart is cleared after order)
                        window.dispatchEvent(new Event("cartUpdated"));

                        // Redirect to orders page with success state
                        navigate('/orders', { 
                            state: { 
                                paymentSuccess: true,
                                paymentId: paymentResponse.razorpay_payment_id 
                            } 
                        });
                    } catch (error) {
                        console.error('Error creating order:', error);
                        alert('Payment successful but failed to create order. Please contact support.');
                    }
                },
                prefill: {
                    name: localStorage.getItem("userName") || localStorage.getItem("email")?.split("@")[0] || "Customer",
                    email: localStorage.getItem("email") || "customer@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#4f46e5",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Payment initiation failed:', error);
        }
    };


  return (
    <div className="container py-5 fade-in">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold mb-1">
                <i className="fa-solid fa-cart-shopping text-primary me-2"></i>
                Shopping Cart
              </h2>
              <p className="text-muted mb-0">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        /* Empty Cart */
        <div className="card border-0 shadow-sm">
          <div className="card-body empty-state">
            <i className="fa-solid fa-cart-arrow-down empty-state-icon"></i>
            <h4>Your Cart is Empty</h4>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <a href="/product" className="btn btn-primary btn-lg px-5">
              <i className="fa-solid fa-shopping-bag me-2"></i>
              Start Shopping
            </a>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Cart Items */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="fa-solid fa-shopping-bag me-2 text-primary"></i>
                  Cart Items
                </h5>
                <button className="btn btn-outline-danger btn-sm" onClick={fetchClearCart}>
                  <i className="fa-solid fa-trash me-1"></i>
                  Clear All
                </button>
              </div>
              <div className="card-body p-0">
                {cartItems.map((item, index) => {
                  // Skip rendering if productId is null (product was deleted)
                  if (!item.productId) {
                    return (
                      <div key={item._id} className={`cart-item ${index !== cartItems.length - 1 ? "border-bottom" : ""}`}>
                        <div className="d-flex align-items-center">
                          <div className="cart-item-img bg-light d-flex align-items-center justify-content-center">
                            <i className="fa-solid fa-image-slash text-muted fs-3"></i>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="fw-bold mb-1 text-muted">Product Unavailable</h6>
                            <p className="text-muted small mb-2">This product has been removed</p>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => fetchRemoveItem(item._id)}>
                              <i className="fa-solid fa-trash me-1"></i>Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                  <div key={item._id} className={`cart-item ${index !== cartItems.length - 1 ? "border-bottom" : ""}`}>
                    <div className="d-flex align-items-center">
                      <img
                        src={item.productId?.img?.startsWith("http") ? item.productId.img : `http://localhost:3000${item.productId?.img || ''}`}
                        alt={item.productId?.name || 'Product'}
                        className="cart-item-img bg-light"
                        style={{ objectFit: "contain", padding: "10px" }}
                      />
                      <div className="flex-grow-1 ms-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="fw-bold mb-1">{item.productId?.name || 'Unknown Product'}</h6>
                            <p className="text-muted small mb-2 d-none d-md-block" style={{ maxWidth: "300px" }}>
                              {item.productId?.description?.substring(0, 60)}...
                            </p>
                            <span className="text-muted">₹{item.productPrice?.toFixed(2)} each</span>
                          </div>
                          <button className="btn btn-link text-danger p-0 d-md-none" onClick={() => fetchRemoveItem(item._id)}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="d-flex align-items-center">
                            <button
                              className="cart-quantity-btn"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <i className="fa-solid fa-minus"></i>
                            </button>
                            <span className="mx-3 fw-bold">{item.quantity}</span>
                            <button
                              className="cart-quantity-btn"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <i className="fa-solid fa-plus"></i>
                            </button>
                          </div>
                          <div className="d-flex align-items-center gap-3">
                            <span className="fw-bold text-primary fs-5">
                              ₹{(item.productPrice * item.quantity).toFixed(2)}
                            </span>
                            <button
                              className="btn btn-outline-danger btn-sm d-none d-md-inline-block"
                              onClick={() => fetchRemoveItem(item._id)}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-3">
              <a href="/product" className="btn btn-outline-primary">
                <i className="fa-solid fa-arrow-left me-2"></i>
                Continue Shopping
              </a>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-12 col-lg-4" style={{ position: 'sticky', top: '100px', alignSelf: 'flex-start' }}>
            <div className="order-summary">
              <h5>
                <i className="fa-solid fa-receipt me-2 text-primary"></i>
                Order Summary
              </h5>
              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal ({cartItems.length} items)</span>
                <span className="fw-semibold">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>
                    <i className="fa-solid fa-tag me-1"></i>
                    Discount ({appliedCoupon.code})
                  </span>
                  <span className="fw-semibold">-₹{calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Shipping</span>
                <span className="text-success fw-semibold">
                  <i className="fa-solid fa-truck me-1"></i>Free
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Tax (10%)</span>
                <span className="fw-semibold">₹{calculateTax().toFixed(2)}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="fs-5 fw-bold">Total</span>
                <span className="fs-4 fw-bold text-primary">₹{calculateTotal().toFixed(2)}</span>
              </div>

              {/* Promo Code */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Have a promo code?</label>
                {appliedCoupon ? (
                  <div className="alert alert-success d-flex justify-content-between align-items-center py-2 mb-0">
                    <span>
                      <i className="fa-solid fa-check-circle me-2"></i>
                      <strong>{appliedCoupon.code}</strong> applied
                    </span>
                    <button onClick={removeCoupon} className="btn btn-sm btn-outline-danger">
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className={`form-control ${couponError ? "is-invalid" : ""}`}
                        placeholder="Enter coupon code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <button 
                        className="btn btn-outline-primary" 
                        type="button"
                        onClick={applyCoupon}
                        disabled={couponLoading}
                      >
                        {couponLoading ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <div className="text-danger small mt-1">
                        <i className="fa-solid fa-exclamation-circle me-1"></i>
                        {couponError}
                      </div>
                    )}
                    <small className="text-muted mt-1 d-block">
                      Try: SAVE10, NILESH07, FLAT50
                    </small>
                  </>
                )}
              </div>

              {/* Checkout Button */}
              <button onClick={handlePayment} className="btn btn-primary btn-lg w-100 mb-3">
                <i className="fa-solid fa-lock me-2"></i>
                Pay ₹{calculateTotal().toFixed(2)}
              </button>

              {/* Security Info */}
              <div className="text-center">
                <small className="text-muted">
                  <i className="fa-solid fa-shield-halved text-success me-1"></i>
                  Secure checkout powered by Razorpay
                </small>
              </div>

              {/* Payment Methods */}
              <div className="text-center mt-3 pt-3 border-top">
                <small className="text-muted d-block mb-2">We accept</small>
                <div className="d-flex justify-content-center gap-2">
                  <i className="fa-brands fa-cc-visa fa-2x text-primary"></i>
                  <i className="fa-brands fa-cc-mastercard fa-2x text-danger"></i>
                  <i className="fa-brands fa-google-pay fa-2x text-dark"></i>
                  <i className="fa-solid fa-building-columns fa-2x text-secondary"></i>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="card border-0 shadow-sm mt-3">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-2 bg-success-subtle rounded-circle">
                    <i className="fa-solid fa-truck text-success"></i>
                  </div>
                  <div>
                    <strong className="d-block">Free Delivery</strong>
                    <small className="text-muted">Orders above ₹499</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-2 bg-primary-subtle rounded-circle">
                    <i className="fa-solid fa-rotate-left text-primary"></i>
                  </div>
                  <div>
                    <strong className="d-block">Easy Returns</strong>
                    <small className="text-muted">7 days return policy</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 bg-warning-subtle rounded-circle">
                    <i className="fa-solid fa-headset text-warning"></i>
                  </div>
                  <div>
                    <strong className="d-block">24/7 Support</strong>
                    <small className="text-muted">Dedicated support</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
