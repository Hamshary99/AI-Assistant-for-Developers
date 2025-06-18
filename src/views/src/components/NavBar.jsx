import React from "react";
import { NavLink } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <span className="navbar-brand">AI Dev Assistant</span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" to="/generate-readme">
                Generate README
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/suggest-api">
                Suggest API
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/explain-code">
                Explain Code
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/fix-code">
                Fix Code
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/compare-code">
                Compare Code
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/history">
                History
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 