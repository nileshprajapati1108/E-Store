import React, { useState } from "react";

const Card = ({ image, title, description, price, onAddToCart }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await onAddToCart();
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div 
      className="card card-product h-100 border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
        transition: "all 0.3s ease"
      }}
    >
      {/* Image Section */}
      <div className="position-relative overflow-hidden" style={{ background: "#f8fafc" }}>
        <img
          src={image}
          alt={title}
          className="card-img-top"
          style={{
            height: "220px",
            objectFit: "contain",
            padding: "1.5rem",
            transition: "transform 0.3s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)"
          }}
        />
        {/* Quick Actions */}
        {token && role === "user" && (
          <div 
            className="position-absolute w-100 d-flex justify-content-center gap-2"
            style={{ 
              bottom: isHovered ? "1rem" : "-50px", 
              transition: "all 0.3s ease",
              opacity: isHovered ? 1 : 0
            }}
          >
            <button 
              className="btn btn-primary btn-sm rounded-pill px-4 shadow"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <i className="fa-solid fa-check me-1"></i> Added!
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cart-plus me-1"></i> Add to Cart
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="card-title fw-bold mb-0 text-truncate" style={{ maxWidth: "70%" }}>
            {title}
          </h6>
          <div className="d-flex align-items-center">
            <i className="fa-solid fa-star text-warning me-1" style={{ fontSize: "0.75rem" }}></i>
            <small className="text-muted">4.5</small>
          </div>
        </div>

        <p className="card-text text-muted small mb-3" style={{ 
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden"
        }}>
          {description}
        </p>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div>
            <span className="price fw-bold text-primary fs-5">₹{price}</span>
          </div>
          
          {token && role === "user" && (
            <button 
              className="btn btn-outline-primary btn-sm rounded-pill d-md-none"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              <i className="fa-solid fa-cart-plus"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
