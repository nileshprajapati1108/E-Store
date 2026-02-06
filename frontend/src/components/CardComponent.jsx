import React from "react";

const CardComponent = ({ title, description, buttonText, image }) => {
  return (
    <div className="card" style={{ width: "18rem"}}>
      <img src={image} className="card-img-top" alt="card" />

      <div className="card-body">
        <h5 className="card-title">{title}</h5>

        <p className="card-text">
          {description}
        </p>

        <button className="btn btn-primary">
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default CardComponent;
