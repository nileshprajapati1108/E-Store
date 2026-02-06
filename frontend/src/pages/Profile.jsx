import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchUserProfile();
    fetchUserOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchUserMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const fetchUserMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/contact/user/${encodeURIComponent(user.email)}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/profile/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
          address: {
            street: data.user.address?.street || "",
            city: data.user.address?.city || "",
            state: data.user.address?.state || "",
            pincode: data.user.address?.pincode || "",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${userId}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/user/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setEditing(false);
        showToast("Profile updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Error updating profile", "error");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "processing":
        return "warning";
      case "shipped":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
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
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: "100px" }}>
            <div className="card-body text-center py-4">
              <div
                className="rounded-circle bg-gradient-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: "100px",
                  height: "100px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontSize: "2.5rem",
                }}
              >
                <i className="fa-solid fa-user"></i>
              </div>
              <h5 className="fw-bold mb-1">{user?.name}</h5>
              <p className="text-muted small mb-3">{user?.email}</p>
              <span className="badge bg-primary-subtle text-primary px-3 py-2">
                <i className="fa-solid fa-crown me-1"></i>
                {user?.role === "admin" ? "Administrator" : "Customer"}
              </span>
            </div>
            <hr className="m-0" />
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="fa-solid fa-user"></i>
                My Profile
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <i className="fa-solid fa-box"></i>
                My Orders
                <span className="badge bg-primary ms-auto">{orders.length}</span>
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${activeTab === "address" ? "active" : ""}`}
                onClick={() => setActiveTab("address")}
              >
                <i className="fa-solid fa-location-dot"></i>
                Address
              </button>
              <button
                className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${activeTab === "messages" ? "active" : ""}`}
                onClick={() => setActiveTab("messages")}
              >
                <i className="fa-solid fa-envelope"></i>
                My Messages
                {messages.filter(m => m.status === "replied").length > 0 && (
                  <span className="badge bg-success ms-auto">
                    {messages.filter(m => m.status === "replied").length} replied
                  </span>
                )}
              </button>
              <Link to="/wishlist" className="list-group-item list-group-item-action d-flex align-items-center gap-3">
                <i className="fa-solid fa-heart"></i>
                Wishlist
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="fa-solid fa-user-gear me-2 text-primary"></i>
                  Profile Information
                </h5>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="btn btn-primary btn-sm">
                    <i className="fa-solid fa-pen me-2"></i>
                    Edit Profile
                  </button>
                )}
              </div>
              <div className="card-body p-4">
                {editing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Full Name</label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control form-control-lg"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Email (Cannot be changed)</label>
                        <input
                          type="email"
                          className="form-control form-control-lg bg-light"
                          value={user?.email}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-4">
                      <button type="submit" className="btn btn-primary">
                        <i className="fa-solid fa-check me-2"></i>
                        Save Changes
                      </button>
                      <button type="button" onClick={() => setEditing(false)} className="btn btn-outline-secondary">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="text-muted d-block mb-1">Full Name</small>
                        <span className="fw-semibold">{user?.name || "Not provided"}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="text-muted d-block mb-1">Email Address</small>
                        <span className="fw-semibold">{user?.email}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="text-muted d-block mb-1">Phone Number</small>
                        <span className="fw-semibold">{user?.phone || "Not provided"}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="text-muted d-block mb-1">Member Since</small>
                        <span className="fw-semibold">
                          {new Date(user?.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fa-solid fa-box me-2 text-primary"></i>
                  Order History
                </h5>
              </div>
              <div className="card-body p-4">
                {orders.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fa-solid fa-shopping-bag fs-1 text-muted mb-3 d-block"></i>
                    <h5>No orders yet</h5>
                    <p className="text-muted">Start shopping to see your orders here!</p>
                    <Link to="/product" className="btn btn-primary">
                      <i className="fa-solid fa-shopping-cart me-2"></i>
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td>
                              <code className="text-primary">#{order._id.slice(-8)}</code>
                            </td>
                            <td>
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td>{order.items?.length} items</td>
                            <td className="fw-bold">₹{order.totalAmount?.toLocaleString()}</td>
                            <td>
                              <span className={`badge bg-${getStatusColor(order.status)}`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                              </span>
                            </td>
                            <td>
                              <Link to="/orders" className="btn btn-sm btn-outline-primary">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === "address" && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fa-solid fa-location-dot me-2 text-primary"></i>
                  Saved Address
                </h5>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Street Address</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={formData.address.street}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, street: e.target.value },
                          })
                        }
                        placeholder="House no., Street name, Area"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">City</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={formData.address.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value },
                          })
                        }
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">State</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={formData.address.state}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, state: e.target.value },
                          })
                        }
                        placeholder="Enter state"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">PIN Code</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={formData.address.pincode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, pincode: e.target.value },
                          })
                        }
                        placeholder="Enter PIN code"
                        maxLength={6}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary mt-4">
                    <i className="fa-solid fa-check me-2"></i>
                    Save Address
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === "messages" && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fa-solid fa-envelope me-2 text-primary"></i>
                  My Messages
                </h5>
              </div>
              <div className="card-body p-4">
                {messages.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fa-solid fa-envelope-open fs-1 text-muted mb-3 d-block"></i>
                    <h5>No messages yet</h5>
                    <p className="text-muted">You haven't sent any messages to us.</p>
                    <Link to="/contact" className="btn btn-primary">
                      <i className="fa-solid fa-paper-plane me-2"></i>
                      Contact Us
                    </Link>
                  </div>
                ) : (
                  <div className="row g-4">
                    <div className={selectedMessage ? "col-md-5" : "col-12"}>
                      <div className="list-group">
                        {messages.map((msg) => (
                          <button
                            key={msg._id}
                            className={`list-group-item list-group-item-action ${selectedMessage?._id === msg._id ? 'active' : ''}`}
                            onClick={() => setSelectedMessage(msg)}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0 fw-semibold" style={{ fontSize: "0.9rem" }}>
                                {msg.subject.length > 30 ? msg.subject.slice(0, 30) + '...' : msg.subject}
                              </h6>
                              <span className={`badge bg-${msg.status === 'replied' ? 'success' : msg.status === 'read' ? 'warning' : 'secondary'}`}>
                                {msg.status}
                              </span>
                            </div>
                            <small className={selectedMessage?._id === msg._id ? 'text-white-50' : 'text-muted'}>
                              {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </small>
                          </button>
                        ))}
                      </div>
                    </div>
                    {selectedMessage && (
                      <div className="col-md-7">
                        <div className="card h-100">
                          <div className="card-header bg-light">
                            <h6 className="mb-0 fw-bold">{selectedMessage.subject}</h6>
                            <small className="text-muted">
                              Sent on {new Date(selectedMessage.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </small>
                          </div>
                          <div className="card-body">
                            <div className="mb-4">
                              <label className="form-label text-muted small mb-1">Your Message</label>
                              <div className="p-3 bg-primary bg-opacity-10 rounded-3" style={{ whiteSpace: 'pre-wrap' }}>
                                {selectedMessage.message}
                              </div>
                            </div>
                            {selectedMessage.status === 'replied' && selectedMessage.adminReply ? (
                              <div>
                                <label className="form-label text-muted small mb-1">
                                  <i className="fa-solid fa-reply text-success me-1"></i>
                                  Admin's Reply
                                </label>
                                <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25" style={{ whiteSpace: 'pre-wrap' }}>
                                  {selectedMessage.adminReply}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-3">
                                <i className="fa-solid fa-clock text-warning fs-3 mb-2 d-block"></i>
                                <p className="text-muted mb-0">Waiting for admin's reply...</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
