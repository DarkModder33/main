import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NeuralHub from "../NeuralHub.jsx";
import IntelligencePage from "../features/intelligence/IntelligencePage.jsx";

export default function AppShell() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NeuralHub />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/neural-hub" element={<NeuralHub />} />
      </Routes>
    </BrowserRouter>
  );
}
