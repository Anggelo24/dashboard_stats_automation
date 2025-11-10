// src/components/sidebarComponent.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdOutlineBusinessCenter, MdOutlineSupportAgent } from "react-icons/md";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaRegFileLines } from "react-icons/fa6";
import { RiRobot2Line } from "react-icons/ri";
import { PanelRightOpen, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import "../style/sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: "/", icon: <AiOutlineDashboard />, label: "Dashboard" },
    { path: "/mis-automatizaciones", icon: <RiRobot2Line />, label: "Mis Automatizaciones" },
    { path: "/mi-negocio", icon: <MdOutlineBusinessCenter />, label: "Mi Negocio" },
    { path: "/mis-informes", icon: <FaRegFileLines />, label: "Mis informes" },
    { path: "/soporte", icon: <MdOutlineSupportAgent />, label: "Soporte" },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isOpen ? <X /> : <PanelRightOpen />}
      </button>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo-container">
          <img style={{width: '100px', marginTop: '50px', marginBottom: '20px'}} src="https://res.cloudinary.com/db3espoei/image/upload/v1761193211/imagen_2025-10-22_230620072-removebg-preview_mo1hss.png" alt="Logo" />
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item sidebar-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.label}</span>
            </Link>
          ))}
        </nav>

        <ThemeToggle />

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">
            <span className="tuinity-brand">Tuinity</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;