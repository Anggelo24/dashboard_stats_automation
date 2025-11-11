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
          <img
            style={{width: '140px'}}
            src="https://res.cloudinary.com/db3espoei/image/upload/v1762833053/Mesa_de_trabajo_24x_sdsqs2.png"
            alt="Fluffy Logo"
          />
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
            <span
              className="quimera-logo"
              style={{
                display: 'inline-block',
                height: '32px',
                aspectRatio: '3333/1117',
                WebkitMaskImage: 'url(https://res.cloudinary.com/db3espoei/image/upload/v1762875563/Mesa_de_trabajo_24x_1_dp5flc.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(https://res.cloudinary.com/db3espoei/image/upload/v1762875563/Mesa_de_trabajo_24x_1_dp5flc.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                backgroundColor: 'currentColor',
                verticalAlign: 'middle'
              }}
              aria-label="Quimera Tuinity"
            />
            {/* <span className="tuinity-brand">Tuinity</span> */}
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;