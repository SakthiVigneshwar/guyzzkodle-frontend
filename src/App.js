import React from "react";
import { Routes, Route } from "react-router-dom";
import ClueGame from "./components/ClueGame";
import AdminPage from "./components/AdminPage";
import "./App.css";

import LeaderboardPage from "./components/LeaderboradPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClueGame />} />
      <Route path="/mc" element={<AdminPage />} />

      <Route path="/lists" element={<LeaderboardPage />} />
    </Routes>
  );
}

export default App;
