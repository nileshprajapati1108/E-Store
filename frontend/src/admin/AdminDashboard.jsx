import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageReply, setMessageReply] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/home");
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes, salesRes, categoryRes, statusRes, allOrdersRes, usersRes, messagesRes, unreadRes] = await Promise.all([
        axios.get("http://localhost:3000/api/admin/dashboard/stats"),
        axios.get("http://localhost:3000/api/admin/dashboard/recent-orders"),
        axios.get("http://localhost:3000/api/admin/dashboard/top-products"),
        axios.get("http://localhost:3000/api/admin/dashboard/sales-chart"),
        axios.get("http://localhost:3000/api/admin/dashboard/category-sales"),
        axios.get("http://localhost:3000/api/admin/dashboard/order-status"),
        axios.get("http://localhost:3000/api/admin/orders"),
        axios.get("http://localhost:3000/api/admin/users"),
        axios.get("http://localhost:3000/api/contact"),
        axios.get("http://localhost:3000/api/contact/unread-count"),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (ordersRes.data.success) setRecentOrders(ordersRes.data.orders);
      if (productsRes.data.success) setTopProducts(productsRes.data.products);
      if (salesRes.data.success) setSalesData(salesRes.data.salesData);
      if (categoryRes.data.success) setCategorySales(categoryRes.data.categorySales);
      if (statusRes.data.success) setOrderStatus(statusRes.data.statusData);
      if (allOrdersRes.data.success) setAllOrders(allOrdersRes.data.orders);
      if (usersRes.data.success) setAllUsers(usersRes.data.users);
      if (messagesRes.data.success) setMessages(messagesRes.data.messages);
      if (unreadRes.data.success) setUnreadCount(unreadRes.data.count);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/admin/orders/${orderId}/status`, { status: newStatus });
      setAllOrders(allOrders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      showToast("Order status updated!", "success");
    } catch (error) {
      console.error("Error updating order:", error);
      showToast("Failed to update order", "danger");
    }
  };

  const showToast = (message, type) => {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `<i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-2"></i>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      confirmed: "info",
      processing: "primary",
      shipped: "secondary",
      delivered: "success",
      cancelled: "danger",
    };
    return colors[status] || "secondary";
  };

  const getImageUrl = (img) => {
    if (!img) return "";
    return img.startsWith("http") ? img : `http://localhost:3000${img}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Message handling functions
  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setMessageReply(message.adminReply || "");
    if (message.status === "unread") {
      try {
        await axios.put(`http://localhost:3000/api/contact/${message._id}/status`, { status: "read" });
        setMessages(messages.map(m => m._id === message._id ? { ...m, status: "read" } : m));
        setUnreadCount(prev => prev - 1);
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const handleReplyMessage = async () => {
    if (!selectedMessage || !messageReply.trim()) return;
    try {
      await axios.put(`http://localhost:3000/api/contact/${selectedMessage._id}/reply`, { reply: messageReply });
      setMessages(messages.map(m => m._id === selectedMessage._id ? { ...m, status: "replied", adminReply: messageReply } : m));
      setSelectedMessage({ ...selectedMessage, status: "replied", adminReply: messageReply });
      showToast("Reply sent successfully!", "success");
    } catch (error) {
      console.error("Error replying to message:", error);
      showToast("Failed to send reply", "danger");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/contact/${messageId}`);
      setMessages(messages.filter(m => m._id !== messageId));
      if (selectedMessage?._id === messageId) setSelectedMessage(null);
      showToast("Message deleted!", "success");
    } catch (error) {
      console.error("Error deleting message:", error);
      showToast("Failed to delete message", "danger");
    }
  };

  const getMessageStatusColor = (status) => {
    const colors = { unread: "danger", read: "warning", replied: "success" };
    return colors[status] || "secondary";
  };

  const maxSalesValue = Math.max(...salesData.map(d => d.revenue), 1);

  // Filter orders
  const filteredOrders = allOrders.filter(order => {
    const matchesFilter = orderFilter === "all" || order.status === orderFilter;
    const matchesSearch = orderSearch === "" || 
      order.userId?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.userId?.email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order._id.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Dashboard...</p>
      </div>
    );
  }

  // Render Orders Tab Content
  const renderOrdersTab = () => (
    <>
      {/* Orders Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1><i className="bi bi-cart-check me-2"></i>Order Management</h1>
          <p className="text-muted mb-0">View and manage all customer orders</p>
        </div>
        <div className="header-right">
          <span className="badge bg-primary fs-6 me-3">{allOrders.length} Total Orders</span>
          <button className="btn btn-light btn-icon" onClick={fetchDashboardData}>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="dashboard-card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by customer name, email or order ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-8">
              <div className="d-flex gap-2 flex-wrap">
                {["all", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                  <button
                    key={status}
                    className={`btn btn-sm ${orderFilter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setOrderFilter(status)}
                  >
                    {status === "all" ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}
                    {status !== "all" && (
                      <span className="badge bg-white text-dark ms-1">
                        {allOrders.filter(o => o.status === status).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="row">
        <div className={selectedOrder ? "col-lg-7" : "col-12"}>
          <div className="dashboard-card">
            <div className="card-header">
              <h5><i className="bi bi-list-ul me-2"></i>Orders ({filteredOrders.length})</h5>
            </div>
            <div className="card-body p-0">
              <div className="orders-list">
                {filteredOrders.map((order) => (
                  <div 
                    key={order._id} 
                    className={`order-card ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-card-header">
                      <div className="d-flex align-items-center gap-3">
                        <div className="customer-avatar-lg">
                          {order.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <h6 className="mb-0">{order.userId?.name || "Unknown User"}</h6>
                          <small className="text-muted">{order.userId?.email}</small>
                        </div>
                      </div>
                      <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    </div>
                    <div className="order-card-body">
                      <div className="order-products-preview">
                        {order.items.slice(0, 4).map((item, i) => (
                          <div key={i} className="order-product-mini">
                            <img src={getImageUrl(item.productId?.img)} alt="" />
                            <span className="qty-badge">{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="order-product-more">+{order.items.length - 4}</div>
                        )}
                      </div>
                      <div className="order-card-footer">
                        <div>
                          <span className="text-muted">Order ID: </span>
                          <span className="order-id-small">#{order._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="text-end">
                          <div className="order-total">{formatCurrency(order.totalAmount)}</div>
                          <small className="text-muted">{formatDate(order.createdAt)}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                    No orders found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Panel */}
        {selectedOrder && (
          <div className="col-lg-5">
            <div className="dashboard-card order-details-panel sticky-top" style={{ top: "24px" }}>
              <div className="card-header">
                <h5><i className="bi bi-receipt me-2"></i>Order Details</h5>
                <button className="btn btn-sm btn-light" onClick={() => setSelectedOrder(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="card-body">
                {/* Customer Info */}
                <div className="detail-section">
                  <h6 className="section-title"><i className="bi bi-person me-2"></i>Customer</h6>
                  <div className="customer-detail-card">
                    <div className="customer-avatar-xl">
                      {selectedOrder.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h5 className="mb-1">{selectedOrder.userId?.name || "Unknown"}</h5>
                      <p className="mb-0 text-muted">{selectedOrder.userId?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="detail-section">
                  <h6 className="section-title"><i className="bi bi-info-circle me-2"></i>Order Info</h6>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Order ID</span>
                      <span className="value">#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Date</span>
                      <span className="value">{formatDateTime(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Payment ID</span>
                      <span className="value text-truncate">{selectedOrder.paymentId?.slice(0, 20)}...</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Payment Status</span>
                      <span className="badge bg-success">{selectedOrder.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="detail-section">
                  <h6 className="section-title"><i className="bi bi-bag me-2"></i>Products ({selectedOrder.items.length})</h6>
                  <div className="ordered-products-list">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="ordered-product-item">
                        <img src={getImageUrl(item.productId?.img)} alt="" className="ordered-product-img" />
                        <div className="ordered-product-info">
                          <h6>{item.productId?.name || "Product Unavailable"}</h6>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Qty: {item.quantity}</span>
                            <span className="fw-bold">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="order-total-section">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.totalAmount * 0.9)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (10%)</span>
                    <span>{formatCurrency(selectedOrder.totalAmount * 0.1)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold fs-5">Total</span>
                    <span className="fw-bold fs-5 text-primary">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Update Status */}
                <div className="detail-section">
                  <h6 className="section-title"><i className="bi bi-arrow-repeat me-2"></i>Update Status</h6>
                  <div className="status-buttons">
                    {["confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                      <button
                        key={status}
                        className={`btn btn-sm ${selectedOrder.status === status ? `btn-${getStatusColor(status)}` : `btn-outline-${getStatusColor(status)}`}`}
                        onClick={() => updateOrderStatus(selectedOrder._id, status)}
                        disabled={selectedOrder.status === status}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Render Analytics Tab Content
  const renderAnalyticsTab = () => {
    const totalItemsSold = categorySales.reduce((sum, cat) => sum + cat.totalSold, 0);
    const avgOrderValue = stats?.totalOrders ? stats.totalRevenue / stats.totalOrders : 0;
    const conversionRate = allUsers.length ? ((stats?.totalOrders / allUsers.length) * 100).toFixed(1) : 0;

    return (
      <>
        {/* Analytics Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1><i className="bi bi-graph-up-arrow me-2"></i>Analytics & Insights</h1>
            <p className="text-muted mb-0">Deep dive into your store performance</p>
          </div>
          <div className="header-right">
            <button className="btn btn-light btn-icon" onClick={fetchDashboardData}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="stats-grid mb-4">
          <div className="stat-card gradient-primary">
            <div className="stat-icon"><i className="bi bi-cash-stack"></i></div>
            <div className="stat-content">
              <h3>{formatCurrency(avgOrderValue)}</h3>
              <p>Avg. Order Value</p>
            </div>
          </div>
          <div className="stat-card gradient-success">
            <div className="stat-icon"><i className="bi bi-percent"></i></div>
            <div className="stat-content">
              <h3>{conversionRate}%</h3>
              <p>Conversion Rate</p>
            </div>
          </div>
          <div className="stat-card gradient-info">
            <div className="stat-icon"><i className="bi bi-bag-check"></i></div>
            <div className="stat-content">
              <h3>{totalItemsSold}</h3>
              <p>Total Items Sold</p>
            </div>
          </div>
          <div className="stat-card gradient-warning">
            <div className="stat-icon"><i className="bi bi-star"></i></div>
            <div className="stat-content">
              <h3>{topProducts.length > 0 ? topProducts[0]?.product?.name?.slice(0, 12) + "..." : "N/A"}</h3>
              <p>Best Seller</p>
            </div>
          </div>
        </div>

        {/* Revenue Chart Section */}
        <div className="dashboard-card mb-4">
          <div className="card-header">
            <h5><i className="bi bi-graph-up me-2"></i>Revenue Trend (Last 7 Days)</h5>
            <div className="d-flex gap-3">
              <div className="d-flex align-items-center gap-2">
                <span className="analytics-dot bg-primary"></span>
                <small>Revenue</small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="analytics-dot bg-success"></span>
                <small>Orders</small>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="analytics-chart">
              {salesData.map((day, index) => (
                <div key={index} className="analytics-bar-group">
                  <div className="analytics-bars">
                    <div 
                      className="analytics-bar revenue" 
                      style={{ height: `${(day.revenue / maxSalesValue) * 150}px` }}
                      title={formatCurrency(day.revenue)}
                    ></div>
                    <div 
                      className="analytics-bar orders" 
                      style={{ height: `${(day.orders / Math.max(...salesData.map(d => d.orders), 1)) * 150}px` }}
                      title={`${day.orders} orders`}
                    ></div>
                  </div>
                  <div className="analytics-label">
                    <span className="day">{day.day}</span>
                    <span className="value">{formatCurrency(day.revenue)}</span>
                    <span className="orders">{day.orders} orders</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-row">
          {/* Category Performance */}
          <div className="dashboard-card">
            <div className="card-header">
              <h5><i className="bi bi-pie-chart-fill me-2"></i>Category Distribution</h5>
            </div>
            <div className="card-body">
              <div className="category-analytics">
                {categorySales.map((cat, index) => {
                  const percentage = ((cat.totalRevenue / (stats?.totalRevenue || 1)) * 100).toFixed(1);
                  const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];
                  return (
                    <div key={index} className="category-analytics-item">
                      <div className="category-color" style={{ background: colors[index % colors.length] }}></div>
                      <div className="category-details">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-semibold">{cat._id || "Other"}</span>
                          <span className="text-muted">{percentage}%</span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div 
                            className="progress-bar" 
                            style={{ width: `${percentage}%`, background: colors[index % colors.length] }}
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <small className="text-muted">{cat.totalSold} items</small>
                          <small className="fw-semibold">{formatCurrency(cat.totalRevenue)}</small>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {categorySales.length === 0 && (
                  <p className="text-muted text-center">No category data yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Products Performance */}
          <div className="dashboard-card">
            <div className="card-header">
              <h5><i className="bi bi-trophy-fill me-2"></i>Top Performing Products</h5>
            </div>
            <div className="card-body p-0">
              <div className="top-performers-list">
                {topProducts.map((item, index) => {
                  const percentage = ((item.totalRevenue / (stats?.totalRevenue || 1)) * 100).toFixed(1);
                  return (
                    <div key={index} className="top-performer-item">
                      <div className="rank-badge">{index + 1}</div>
                      <img src={getImageUrl(item.product?.img)} alt="" className="performer-img" />
                      <div className="performer-info">
                        <h6>{item.product?.name}</h6>
                        <div className="performer-stats">
                          <span><i className="bi bi-box"></i> {item.totalSold} sold</span>
                          <span><i className="bi bi-currency-rupee"></i> {formatCurrency(item.totalRevenue)}</span>
                          <span><i className="bi bi-pie-chart"></i> {percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {topProducts.length === 0 && (
                  <p className="text-muted text-center py-4">No sales data yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Order Insights */}
        <div className="dashboard-row mt-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h5><i className="bi bi-people-fill me-2"></i>Customer Insights</h5>
            </div>
            <div className="card-body">
              <div className="insights-grid">
                <div className="insight-box">
                  <i className="bi bi-person-check text-success"></i>
                  <div>
                    <h4>{stats?.totalUsers || 0}</h4>
                    <span>Registered Users</span>
                  </div>
                </div>
                <div className="insight-box">
                  <i className="bi bi-person-plus text-info"></i>
                  <div>
                    <h4>{stats?.newUsersThisMonth || 0}</h4>
                    <span>New This Month</span>
                  </div>
                </div>
                <div className="insight-box">
                  <i className="bi bi-cart-check text-primary"></i>
                  <div>
                    <h4>{stats?.totalOrders || 0}</h4>
                    <span>Total Orders</span>
                  </div>
                </div>
                <div className="insight-box">
                  <i className="bi bi-graph-up text-warning"></i>
                  <div>
                    <h4>{((stats?.totalOrders / (stats?.totalUsers || 1))).toFixed(1)}</h4>
                    <span>Orders per User</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h5><i className="bi bi-clipboard-data me-2"></i>Order Status Breakdown</h5>
            </div>
            <div className="card-body">
              <div className="status-breakdown">
                {orderStatus.map((status, index) => (
                  <div key={index} className="status-breakdown-item">
                    <div className={`status-icon-circle bg-${getStatusColor(status._id)}`}>
                      <i className={`bi ${
                        status._id === 'confirmed' ? 'bi-check' :
                        status._id === 'processing' ? 'bi-gear' :
                        status._id === 'shipped' ? 'bi-truck' :
                        status._id === 'delivered' ? 'bi-check-all' :
                        status._id === 'cancelled' ? 'bi-x' : 'bi-clock'
                      }`}></i>
                    </div>
                    <div className="status-breakdown-info">
                      <span className="status-name text-capitalize">{status._id}</span>
                      <span className="status-count">{status.count} orders</span>
                    </div>
                    <div className="status-percentage">
                      {((status.count / (stats?.totalOrders || 1)) * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Render Messages Tab Content
  const renderMessagesTab = () => (
    <>
      {/* Messages Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1><i className="bi bi-envelope me-2"></i>Customer Messages</h1>
          <p className="text-muted mb-0">View and respond to customer inquiries</p>
        </div>
        <div className="header-right">
          <span className="badge bg-danger fs-6 me-3">{unreadCount} Unread</span>
          <span className="badge bg-primary fs-6 me-3">{messages.length} Total</span>
          <button className="btn btn-light btn-icon" onClick={fetchDashboardData}>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </header>

      {/* Messages Content */}
      <div className="row g-4">
        {/* Messages List */}
        <div className={selectedMessage ? "col-lg-5" : "col-12"}>
          <div className="dashboard-card h-100">
            <div className="card-header">
              <h5><i className="bi bi-inbox me-2"></i>Inbox</h5>
            </div>
            <div className="card-body p-0">
              <div className="messages-list" style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
                {messages.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>
                    <p>No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message-item p-3 border-bottom ${selectedMessage?._id === msg._id ? 'bg-light' : ''} ${msg.status === 'unread' ? 'border-start border-danger border-3' : ''}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleViewMessage(msg)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div className="customer-avatar" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#667eea", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                            {msg.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <h6 className="mb-0 fw-semibold" style={{ fontSize: "0.95rem" }}>
                              {msg.name}
                              {msg.status === "unread" && <span className="badge bg-danger ms-2" style={{ fontSize: "0.65rem" }}>New</span>}
                            </h6>
                            <small className="text-muted">{msg.email}</small>
                          </div>
                        </div>
                        <span className={`badge bg-${getMessageStatusColor(msg.status)}`}>{msg.status}</span>
                      </div>
                      <p className="mb-1 fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>{msg.subject}</p>
                      <p className="mb-1 text-muted small" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {msg.message}
                      </p>
                      <small className="text-muted">{formatDateTime(msg.createdAt)}</small>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message Detail */}
        {selectedMessage && (
          <div className="col-lg-7">
            <div className="dashboard-card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5><i className="bi bi-envelope-open me-2"></i>Message Details</h5>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteMessage(selectedMessage._id)}>
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
              </div>
              <div className="card-body">
                <div className="message-detail">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="customer-avatar-lg" style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.5rem" }}>
                        {selectedMessage.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">{selectedMessage.name}</h5>
                        <p className="text-muted mb-0">{selectedMessage.email}</p>
                      </div>
                    </div>
                    <span className={`badge bg-${getMessageStatusColor(selectedMessage.status)} px-3 py-2`}>{selectedMessage.status}</span>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted small mb-1">Subject</label>
                    <h4 className="fw-bold mb-0">{selectedMessage.subject}</h4>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted small mb-1">Message</label>
                    <div className="p-3 bg-light rounded-3" style={{ whiteSpace: "pre-wrap" }}>
                      {selectedMessage.message}
                    </div>
                  </div>

                  <div className="mb-4">
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      Received: {formatDateTime(selectedMessage.createdAt)}
                    </small>
                  </div>

                  <hr />

                  <div className="reply-section">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-reply me-2"></i>
                      {selectedMessage.status === "replied" ? "Your Reply" : "Reply to this message"}
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Type your reply here..."
                      value={messageReply}
                      onChange={(e) => setMessageReply(e.target.value)}
                    ></textarea>
                    <button 
                      className="btn btn-primary mt-3"
                      onClick={handleReplyMessage}
                      disabled={!messageReply.trim()}
                    >
                      <i className="bi bi-send me-2"></i>
                      {selectedMessage.status === "replied" ? "Update Reply" : "Send Reply"}
                    </button>
                    {selectedMessage.status === "replied" && (
                      <span className="text-success ms-3">
                        <i className="bi bi-check-circle me-1"></i>Reply sent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <i className="bi bi-shop"></i>
          <span>E-Store Admin</span>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#overview" className={`nav-item ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            <i className="bi bi-grid-1x2-fill"></i>
            <span>Dashboard</span>
          </a>
          <Link to="/admin/products" className="nav-item">
            <i className="bi bi-box-seam-fill"></i>
            <span>Products</span>
          </Link>
          <a href="#orders" className={`nav-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            <i className="bi bi-cart-check-fill"></i>
            <span>Orders</span>
          </a>
          <a href="#messages" className={`nav-item ${activeTab === "messages" ? "active" : ""}`} onClick={() => setActiveTab("messages")}>
            <i className="bi bi-envelope-fill"></i>
            <span>Messages</span>
            {unreadCount > 0 && <span className="badge bg-danger ms-auto">{unreadCount}</span>}
          </a>
          <a href="#analytics" className={`nav-item ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
            <i className="bi bi-graph-up-arrow"></i>
            <span>Analytics</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <Link to="/home" className="nav-item">
            <i className="bi bi-house-door"></i>
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Render content based on active tab */}
        {activeTab === "orders" && renderOrdersTab()}
        {activeTab === "messages" && renderMessagesTab()}
        {activeTab === "analytics" && renderAnalyticsTab()}
        {activeTab === "overview" && (
          <>
            {/* Header */}
            <header className="admin-header">
              <div className="header-left">
                <h1>Dashboard Overview</h1>
                <p className="text-muted mb-0">Welcome back, Admin! Here's what's happening today.</p>
              </div>
              <div className="header-right">
                <button className="btn btn-light btn-icon me-2" onClick={fetchDashboardData}>
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
                <div className="admin-profile">
                  <div className="avatar">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <span>Admin</span>
                </div>
              </div>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card gradient-primary">
                <div className="stat-icon">
                  <i className="bi bi-currency-rupee"></i>
                </div>
                <div className="stat-content">
                  <h3>{formatCurrency(stats?.totalRevenue || 0)}</h3>
                  <p>Total Revenue</p>
                  <div className="stat-badge">
                    <i className="bi bi-graph-up-arrow"></i>
                    {formatCurrency(stats?.monthlyRevenue || 0)} this month
                  </div>
                </div>
              </div>

              <div className="stat-card gradient-success">
                <div className="stat-icon">
                  <i className="bi bi-cart-check"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats?.totalOrders || 0}</h3>
                  <p>Total Orders</p>
                  <div className="stat-badge">
                    <i className="bi bi-calendar-check"></i>
                    {stats?.todayOrders || 0} today
                  </div>
                </div>
              </div>

              <div className="stat-card gradient-info">
                <div className="stat-icon">
                  <i className="bi bi-people"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats?.totalUsers || 0}</h3>
                  <p>Total Customers</p>
                  <div className="stat-badge">
                    <i className="bi bi-person-plus"></i>
                    +{stats?.newUsersThisMonth || 0} this month
                  </div>
                </div>
              </div>

              <div className="stat-card gradient-warning">
                <div className="stat-icon">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats?.totalProducts || 0}</h3>
                  <p>Products</p>
                  <div className="stat-badge text-danger">
                    <i className="bi bi-exclamation-triangle"></i>
                    {stats?.lowStockProducts || 0} low stock
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="dashboard-row">
              {/* Sales Chart */}
              <div className="dashboard-card chart-card">
                <div className="card-header">
                  <h5><i className="bi bi-bar-chart-line me-2"></i>Sales Overview (Last 7 Days)</h5>
                  <span className="badge bg-primary-subtle text-primary">
                    {formatCurrency(salesData.reduce((sum, d) => sum + d.revenue, 0))} total
                  </span>
                </div>
                <div className="card-body">
                  <div className="chart-container">
                    {salesData.map((day, index) => (
                      <div key={index} className="chart-bar-wrapper">
                        <div className="chart-bar-container">
                          <div 
                            className="chart-bar" 
                            style={{ height: `${(day.revenue / maxSalesValue) * 100}%` }}
                            title={`${formatCurrency(day.revenue)}`}
                          >
                            <span className="bar-value">{formatCurrency(day.revenue)}</span>
                          </div>
                        </div>
                        <span className="bar-label">{day.day}</span>
                        <span className="bar-orders">{day.orders} orders</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h5><i className="bi bi-pie-chart me-2"></i>Order Status</h5>
                </div>
                <div className="card-body">
                  <div className="status-list">
                    {orderStatus.map((status, index) => (
                      <div key={index} className="status-item">
                        <div className="status-info">
                          <span className={`status-dot bg-${getStatusColor(status._id)}`}></span>
                          <span className="status-name text-capitalize">{status._id}</span>
                        </div>
                        <div className="status-count">
                          <span className={`badge bg-${getStatusColor(status._id)}-subtle text-${getStatusColor(status._id)}`}>
                            {status.count}
                          </span>
                        </div>
                      </div>
                    ))}
                    {orderStatus.length === 0 && (
                      <p className="text-muted text-center">No orders yet</p>
                    )}
                  </div>

                  <hr />

                  {/* Quick Stats */}
                  <div className="quick-stats">
                    <div className="quick-stat">
                      <i className="bi bi-clock text-warning"></i>
                      <div>
                        <span className="value">{stats?.pendingOrders || 0}</span>
                        <span className="label">Pending</span>
                      </div>
                    </div>
                    <div className="quick-stat">
                      <i className="bi bi-calendar-event text-info"></i>
                      <div>
                        <span className="value">{stats?.monthlyOrders || 0}</span>
                        <span className="label">This Month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="dashboard-row">
              {/* Top Products */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h5><i className="bi bi-trophy me-2"></i>Top Selling Products</h5>
                  <Link to="/admin/products" className="btn btn-sm btn-outline-primary">View All</Link>
                </div>
                <div className="card-body p-0">
                  <div className="top-products-list">
                    {topProducts.map((item, index) => (
                      <div key={index} className="product-item">
                        <div className="rank">#{index + 1}</div>
                        <img 
                          src={getImageUrl(item.product?.img)}
                          alt={item.product?.name}
                          className="product-thumb"
                        />
                        <div className="product-info">
                          <h6>{item.product?.name}</h6>
                          <span className="text-muted">{item.totalSold} sold</span>
                        </div>
                        <div className="product-revenue">
                          {formatCurrency(item.totalRevenue)}
                        </div>
                      </div>
                    ))}
                    {topProducts.length === 0 && (
                      <p className="text-muted text-center py-4">No sales data yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Sales */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h5><i className="bi bi-tags me-2"></i>Category Performance</h5>
                </div>
                <div className="card-body">
                  <div className="category-list">
                    {categorySales.map((cat, index) => {
                      const maxRevenue = Math.max(...categorySales.map(c => c.totalRevenue), 1);
                      const percentage = (cat.totalRevenue / maxRevenue) * 100;
                      return (
                        <div key={index} className="category-item">
                          <div className="category-header">
                            <span className="category-name">{cat._id || "Uncategorized"}</span>
                            <span className="category-revenue">{formatCurrency(cat.totalRevenue)}</span>
                          </div>
                          <div className="progress">
                            <div 
                              className="progress-bar" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <small className="text-muted">{cat.totalSold} items sold</small>
                        </div>
                      );
                    })}
                    {categorySales.length === 0 && (
                      <p className="text-muted text-center">No sales data yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="dashboard-card">
              <div className="card-header">
                <h5><i className="bi bi-receipt me-2"></i>Recent Orders</h5>
                <div className="d-flex gap-2">
                  <span className="badge bg-success-subtle text-success">
                    {formatCurrency(stats?.todayRevenue || 0)} today
                  </span>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Products</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                          </td>
                          <td>
                            <div className="customer-info">
                              <div className="customer-avatar">
                                {order.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <span className="customer-name">{order.userId?.name || "Unknown"}</span>
                                <span className="customer-email">{order.userId?.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="products-preview">
                              {order.items.slice(0, 3).map((item, i) => (
                                <img 
                                  key={i}
                                  src={getImageUrl(item.productId?.img)}
                                  alt=""
                                  className="product-mini"
                                  title={item.productId?.name}
                                />
                              ))}
                              {order.items.length > 3 && (
                                <span className="more-products">+{order.items.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="order-amount">{formatCurrency(order.totalAmount)}</span>
                          </td>
                          <td>
                            <span className={`status-badge status-${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <span className="order-date">{formatDate(order.createdAt)}</span>
                          </td>
                        </tr>
                      ))}
                      {recentOrders.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            No orders yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
