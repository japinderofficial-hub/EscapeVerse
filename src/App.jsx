import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import "./styles/game.css"; // Clean application styles

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for the Home/Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Route for the Core Escape Room Game Screen */}
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
};

export default App;
