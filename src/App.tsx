import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/sidebarComponent";
import SoporteDashboard from "./pages/soporteDashboard";
import HomeDashboard from "./pages/homeDashboard";
import MisAutomatizaciones from "./pages/misAutomatizaciones";
import MiNegocioDashboard from "./pages/miNegocio";
import MisInformes from "./pages/misInformes";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomeDashboard />} />
              <Route path="/soporte" element={<SoporteDashboard />} />
              <Route path="/mis-automatizaciones" element={<MisAutomatizaciones />} />
              <Route path="/mi-negocio" element={<MiNegocioDashboard />} />
              <Route path="/mis-informes" element={<MisInformes />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;