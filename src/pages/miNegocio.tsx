// src/pages/miNegocioDashboard.tsx

import { useState, useEffect } from "react";
import MiNegocioComponent from "../components/miNegocioComponent";
import { CLIENTE_CONFIG } from "../config/clienteConfig";
import ConfirmationModal from "../components/confirmationModal";
import "../style/mi-negocio.css";
import { FaCheck } from "react-icons/fa";

const MiNegocioDashboard = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [nombreContacto, setNombreContacto] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(`mi_negocio_completed_${CLIENTE_CONFIG.clienteId}`);
    if (completed === "true") {
      setIsCompleted(true);

      // Cargar el nombre del contacto guardado
      const savedData = localStorage.getItem(`mi_negocio_data_${CLIENTE_CONFIG.clienteId}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setNombreContacto(data.contactoNombre || "Cliente");
      }
    }
  }, []);

  const handleComplete = (nombre: string) => {
    setNombreContacto(nombre);
    localStorage.setItem(`mi_negocio_completed_${CLIENTE_CONFIG.clienteId}`, "true");
    setIsCompleted(true);
  };

  const handleRestart = () => {
    setShowConfirmModal(true);
  };

  const confirmRestart = () => {
    localStorage.removeItem(`mi_negocio_completed_${CLIENTE_CONFIG.clienteId}`);
    localStorage.removeItem(`mi_negocio_data_${CLIENTE_CONFIG.clienteId}`);
    setIsCompleted(false);
    setNombreContacto("");
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="mi-negocio-dashboard" style={{paddingTop:'60px'}}>
        <div className="mi-negocio-header">
          <div className="header-content">
            <h1>Mi Negocio</h1>
            <p className="subtitle">
              {isCompleted
                ? "Tu información está completa y guardada."
                : "Completa tu información para que podamos desarrollar la mejor solución para ti."}
            </p>
          </div>
        </div>

        {isCompleted ? (
          <div className="mi-negocio-completed">
            <div className="completed-card">
              <div className="completed-icon"><FaCheck /></div>
              <h2>¡Información Completada!</h2>
              <p>
                Hemos recibido toda tu información correctamente. Nuestro equipo la
                está revisando y pronto comenzaremos a configurar tus automatizaciones.
              </p>
              <div className="completed-info">
                <div className="info-item">
                  <span className="info-label">Nombre:</span>
                  <span className="info-value">{nombreContacto}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">ID Cliente:</span>
                  <span className="info-value">{CLIENTE_CONFIG.clienteId}</span>
                </div>
              </div>
              <div className="completed-actions">
                <button onClick={handleRestart} className="actualizar-btn">
                  Actualizar Información
                </button>
              </div>
            </div>
          </div>
        ) : (
          <MiNegocioComponent onComplete={handleComplete} />
        )}
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        title="¿Actualizar Información?"
        message="Esto eliminará los datos guardados actualmente. Podrás ingresar nueva información después de confirmar."
        confirmText="Sí, Actualizar"
        cancelText="Cancelar"
        type="warning"
        onConfirm={confirmRestart}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
};

export default MiNegocioDashboard;