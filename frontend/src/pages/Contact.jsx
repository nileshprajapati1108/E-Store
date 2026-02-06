import React, { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:3000/api/contact", formData);
      if (response.data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 fade-in">
      {/* Page Header */}
      <div className="text-center mb-5">
        <span className="badge bg-primary px-3 py-2 mb-3">Get in Touch</span>
        <h2 className="fw-bold">Contact Us</h2>
        <p className="text-muted">We'd love to hear from you. Send us a message!</p>
      </div>

      <div className="row g-5">
        {/* Contact Info */}
        <div className="col-lg-5">
          <div className="contact-card h-100">
            <h4 className="fw-bold mb-4">Contact Information</h4>
            <p className="text-muted mb-4">
              Fill up the form and our team will get back to you within 24 hours.
            </p>

            <div className="d-flex align-items-start mb-4">
              <div className="contact-icon me-3">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div>
                <h6 className="fw-semibold mb-1">Our Location</h6>
                <p className="text-muted mb-0">Mumbai, Maharashtra, India</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <div className="contact-icon me-3">
                <i className="fa-solid fa-phone"></i>
              </div>
              <div>
                <h6 className="fw-semibold mb-1">Phone Number</h6>
                <p className="text-muted mb-0">+91 98765 43210</p>
              </div>
            </div>

            <div className="d-flex align-items-start mb-4">
              <div className="contact-icon me-3">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div>
                <h6 className="fw-semibold mb-1">Email Address</h6>
                <p className="text-muted mb-0">support@estore.com</p>
              </div>
            </div>

            <div className="d-flex align-items-start">
              <div className="contact-icon me-3">
                <i className="fa-solid fa-clock"></i>
              </div>
              <div>
                <h6 className="fw-semibold mb-1">Working Hours</h6>
                <p className="text-muted mb-0">Mon - Sat: 9:00 AM - 8:00 PM</p>
              </div>
            </div>

            {/* Social Links */}
            <hr className="my-4" />
            <h6 className="fw-semibold mb-3">Follow Us</h6>
            <div className="d-flex gap-3">
              <a href="#" className="social-icon-btn facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="social-icon-btn twitter">
                <i className="fa-brands fa-twitter"></i>
              </a>
              <a href="#" className="social-icon-btn instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="social-icon-btn linkedin">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="col-lg-7">
          <div className="contact-card">
            <h4 className="fw-bold mb-4">Send us a Message</h4>
            
            {submitted && (
              <div className="alert alert-success d-flex align-items-center mb-4">
                <i className="fa-solid fa-check-circle me-2"></i>
                Thank you for your message! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center mb-4">
                <i className="fa-solid fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-lg"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-lg"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="form-control form-control-lg"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Message</label>
                  <textarea
                    name="message"
                    className="form-control"
                    rows="5"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary btn-lg px-5" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane me-2"></i>
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-5">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1635000000000!5m2!1sen!2sin"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Location Map"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
