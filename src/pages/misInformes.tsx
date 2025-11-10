// src/pages/misInformes.tsx
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  MessageCircle,
  Headset
} from 'lucide-react';
import '../style/mis-informes.css';

function MisInformes() {
  const navigate = useNavigate();

  return (
    <div className="mis-informes-container" style={{paddingTop: '60px'}}>
      {/* Header */}
      <div className="informes-header">
        <div>
          <h1>Reportes Ejecutivos Mensuales</h1>
          <p>Olvídate de recopilar datos manualmente. Recibe análisis completos sin mover un dedo.</p>
        </div>
      </div>

      {/* Information Grid */}
      <div className="informes-grid">
        {/* What You Receive */}
        <div className="info-card">
          <div className="info-card-header">
            <div className="info-icon-wrapper">
              <FileText size={20} />
            </div>
            <h3>Todo Organizado Sin Esfuerzo</h3>
          </div>
          <ul className="info-list">
            <li>
              <div>
                <strong>Ahorra Horas de Análisis Manual</strong>
                <span>Tus números más importantes ya calculados, organizados y listos para decisiones rápidas.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Identifica Oportunidades al Instante</strong>
                <span>Ve de inmediato qué canales funcionan mejor sin revisar cada plataforma por separado.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Menos Tiempo en Reportes</strong>
                <span>Lo que te tomaría horas recopilar, ahora llega listo en tu correo cada mes.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Datos Que Trabajaban en Silencio</strong>
                <span>Descubre patrones y tendencias que antes pasaban desapercibidos por falta de tiempo.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Important Info */}
        <div className="info-card">
          <div className="info-card-header">
            <div className="info-icon-wrapper">
              <Clock size={20} />
            </div>
            <h3>Cero Trabajo Manual</h3>
          </div>
          <ul className="info-list">
            <li>
              <div>
                <strong>Llega Solo, Siempre a Tiempo</strong>
                <span>Cada día 1 del mes en tu correo. Sin recordatorios, sin configuración, sin olvidarlo.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Léelo Donde Estés</strong>
                <span>En tu celular camino al trabajo, en la tablet o computadora. Siempre accesible.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Nada Se Pierde</strong>
                <span>Capturamos cada evento del mes completo. No más pérdida de información valiosa.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Sin Complicaciones Técnicas</strong>
                <span>Llega directo a tu bandeja principal. Si algo falla, lo reenviamos de inmediato.</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <div className="contact-card">
          <div className="contact-content">
            <h3>Soporte Personalizado</h3>
            <p>¿Necesitas ayuda? Contacta con nuestro equipo.</p>
          </div>
          <button
            onClick={() => navigate('/soporte')}
            className="contact-button"
          >
            <Headset size={18} className="button-icon" />
            Soporte
          </button>
        </div>
      </div>
    </div>
  );
}

export default MisInformes;
