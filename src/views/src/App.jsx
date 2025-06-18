import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import GenerateReadme from "./pages/GenerateReadme.jsx";
import SuggestApi from "./pages/SuggestApi.jsx";
import ExplainCode from "./pages/ExplainCode.jsx";
import FixCode from "./pages/FixCode.jsx";
import CompareCode from "./pages/CompareCode.jsx";
import History from "./pages/History.jsx";

const App = () => {
  return (
    <Router>
      <NavBar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/generate-readme" />} />
          <Route path="/generate-readme" element={<GenerateReadme />} />
          <Route path="/suggest-api" element={<SuggestApi />} />
          <Route path="/explain-code" element={<ExplainCode />} />
          <Route path="/fix-code" element={<FixCode />} />
          <Route path="/compare-code" element={<CompareCode />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 