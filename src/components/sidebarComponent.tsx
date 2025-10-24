import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import {
  MdDashboard,
  MdSupportAgent,
} from "react-icons/md";
import { 
  FaRobot
} from "react-icons/fa";
import "../style/sidebarStyle.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="hamburger-btn" onClick={toggleSidebar}>
        <TbLayoutSidebarLeftCollapse />
      </button>

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <div className="sidebar-logo-container">
              <img
                style={{
                  width: "95px",
                  height: "95px",
                  display: "block",
                  margin: "0 auto 20px",
                }}
                src="https://res.cloudinary.com/db3espoei/image/upload/v1761193211/imagen_2025-10-22_230620072-removebg-preview_mo1hss.png"
                alt="Logo"
                className="sidebar-logo"
              />
            </div>

            <li className="sidebar-item">
              <Link to="/" className="sidebar-link" onClick={toggleSidebar}>
                <MdDashboard className="sidebar-icon" />
                <span className="sidebar-text">Dashboard</span>
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/mis-automatizaciones" className="sidebar-link" onClick={toggleSidebar}>
                <FaRobot className="sidebar-icon" />
                <span className="sidebar-text">Mis Automatizaciones</span>
              </Link>
            </li>

            <li className="sidebar-item">
              <Link to="/soporte" className="sidebar-link" onClick={toggleSidebar}>
                <MdSupportAgent className="sidebar-icon" />
                <span className="sidebar-text">Soporte</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;