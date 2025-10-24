import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebarComponent";
import SoporteDashboard from "./pages/soporteDashboard";
import HomeDashboard from "./pages/homeDashboard";
import MisAutomatizaciones from "./pages/misAutomatizaciones";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "20px" }}>
          <Routes>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/soporte" element={<SoporteDashboard />} />
            <Route path="/mis-automatizaciones" element={<MisAutomatizaciones />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
