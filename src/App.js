import React from "react";
import { Routes, Route } from "react-router-dom";
import ClueGame from "./components/ClueGame";
import AdminPage from "./components/AdminPage";
import "./App.css";
import GuesserListPage from "./components/GuesserListPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ClueGame />} />
      <Route path="/host" element={<AdminPage />} />
      <Route path="/guesses" element={<GuesserListPage />} />
    </Routes>
  );
}

export default App;
