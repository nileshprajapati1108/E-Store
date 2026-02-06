import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Order = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if coming from successful payment
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [location.state]);

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get(`http://localhost:3000/api/orders/${userId}`);
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      pending: { color: "warning", icon: "fa-clock", text: "Pending" },
      confirmed: { color: "info", icon: "fa-check-circle", text: "Confirmed" },
      processing: { color: "primary", icon: "fa-cog", text: "Processing" },
      shipped: { color: "secondary", icon: "fa-truck", text: "Shipped" },
      delivered: { color: "success", icon: "fa-box-check", text: "Delivered" },
      cancelled: { color: "danger", icon: "fa-times-circle", text: "Cancelled" },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="spinner-custom"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      {/* Success Alert */}
      {showSuccess && (
        <div className="alert alert-success-custom mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="fa-solid fa-circle-check fa-3x me-3"></i>
            <div>
              <h5 className="mb-1 fw-bold">Payment Successful! 🎉</h5>
              <p className="mb-0">
                Your order has been placed successfully. Thank you for shopping with E-Store!
              </p>
            </div>
            <button type="button" className="btn-close btn-close-white ms-auto" onClick={() => setShowSuccess(false)}></button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold mb-1">
                <i className="fa-solid fa-box text-primary me-2"></i>
                My Orders
              </h2>
              <p className="text-muted mb-0">Track and manage your orders</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate("/product")}>
              <i className="fa-solid fa-shopping-bag me-2"></i>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        /* Empty Orders State */
        <div className="card border-0 shadow-sm">
          <div className="card-body empty-state">
            <i className="fa-solid fa-box-open empty-state-icon"></i>
            <h4>No Orders Yet</h4>
            <p>Looks like you haven't placed any orders yet. Start shopping now!</p>
            <button className="btn btn-primary btn-lg px-5" onClick={() => navigate("/product")}>
              <i className="fa-solid fa-shopping-bag me-2"></i>
              Explore Products
            </button>
          </div>
        </div>
      ) : (
        /* Orders List */
        <div className="row g-4">
          {orders.map((order, index) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div key={order._id} className="col-12" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="order-card">
                  {/* Order Header */}
                  <div className="order-card-header">
                    <div className="row align-items-center g-3">
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block mb-1">Order ID</small>
                        <span className="fw-semibold text-truncate d-block" style={{ fontSize: "0.85rem" }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block mb-1">Order Date</small>
                        <span className="fw-medium">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="col-6 col-md-3">
                        <small className="text-muted d-block mb-1">Status</small>
                        <span className={`order-status ${order.status}`}>
                          <i className={`fa-solid ${statusInfo.icon} me-1`}></i>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="col-6 col-md-3 text-md-end">
                        <small className="text-muted d-block mb-1">Total Amount</small>
                        <span className="fw-bold text-primary fs-5">₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3 text-muted">
                      <i className="fa-solid fa-shopping-bag me-2"></i>
                      Order Items ({order.items.length})
                    </h6>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`d-flex align-items-center py-3 ${idx !== order.items.length - 1 ? "border-bottom" : ""}`}
                      >
                        <img
                          src={
                            item.productId?.img?.startsWith("http")
                              ? item.productId.img
                              : (item.productId?.img?.startsWith("http") ? item.productId.img : `http://localhost:3000${item.productId?.img}`)
                          }
                          alt={item.productId?.name || "Product"}
                          className="rounded-3 me-3 bg-light"
                          style={{ width: "70px", height: "70px", objectFit: "contain", padding: "5px" }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-semibold">{item.productId?.name || "Product"}</h6>
                          <small className="text-muted">
                            Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                          </small>
                        </div>
                        <div className="text-end">
                          <span className="fw-bold text-dark">₹{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Info */}
                  <div className="card-footer bg-white border-top">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <small className="text-muted">Payment ID:</small>
                        <span className="ms-2 fw-medium" style={{ fontSize: "0.85rem" }}>{order.paymentId}</span>
                      </div>
                      <div className="col-md-6 text-md-end mt-2 mt-md-0">
                        <span className="badge bg-success px-3 py-2">
                          <i className="fa-solid fa-check-circle me-1"></i>
                          Payment Successful
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Order;
