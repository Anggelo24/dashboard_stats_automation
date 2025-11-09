import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebarComponent";
import SoporteDashboard from "./pages/soporteDashboard";
import HomeDashboard from "./pages/homeDashboard";
import MisAutomatizaciones from "./pages/misAutomatizaciones";
import MiNegocioDashboard from "./pages/miNegocio";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/soporte" element={<SoporteDashboard />} />
            <Route path="/mis-automatizaciones" element={<MisAutomatizaciones />} />
            <Route path="/mi-negocio" element={<MiNegocioDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;