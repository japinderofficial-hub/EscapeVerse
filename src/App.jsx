import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import DetectiveGame from "./pages/DetectiveGame";
import Leaderboard from "./pages/Leaderboard";
import AdminPortal from "./pages/AdminPortal";
import "./styles/game.css";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Escape Room Game */}
        <Route path="/game" element={<Game />} />

        {/* Detective Interrogation Game */}
        <Route path="/detective" element={<DetectiveGame />} />

        {/* Public Leaderboard */}
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Admin Portal (password-protected) */}
        <Route path="/admin" element={<AdminPortal />} />
      </Routes>
    </Router>
  );
};

export default App;
