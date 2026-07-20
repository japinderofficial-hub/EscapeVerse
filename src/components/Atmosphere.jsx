import React from "react";

const Atmosphere = () => {
  return (
    <div className="atmosphere-wrapper" aria-hidden="true">
      {/* Soft Vignette radial overlay */}
      <div className="vignette-overlay" />

      {/* Layered moving fog elements */}
      <div className="fog-layer fog-layer-1" />
      <div className="fog-layer fog-layer-2" />

      {/* Floating dust motes */}
      <div className="dust-container">
        <div className="dust-particle dust-1" />
        <div className="dust-particle dust-2" />
        <div className="dust-particle dust-3" />
        <div className="dust-particle dust-4" />
        <div className="dust-particle dust-5" />
      </div>
    </div>
  );
};

export default Atmosphere;
