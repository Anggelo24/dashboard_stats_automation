import React, { useState } from "react";
import "../style/soporte.css";
import { Mail, Phone, Clock, Zap } from "lucide-react";

function SoporteCom() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    prioridad: "media",
    categoria: "tecnico",
    mensaje: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      asunto: formData.asunto,
      estado: "abierto",
      prioridad: formData.prioridad,
      fecha: new Date().toISOString(),
      respuesta: null,
    };

    setTickets([newTicket, ...tickets]);

    setFormData({
      nombre: "",
      email: "",
      asunto: "",
      prioridad: "media",
      categoria: "tecnico",
      mensaje: "",
    });

    alert("✅ Ticket creado exitosamente!");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="soporte-container">
      <div className="support-header">
        <h1>Soporte IT - Tuinity</h1>
        <p>
          Estamos aquí para ayudarte. Crea un ticket o consulta y te responderemos lo antes posible.
        </p>
      </div>

      <div className="support-grid">
        {/* Contact Form */}
        <div className="support-card form-card">
          <h2>Crear Nuevo Ticket</h2>
          <form onSubmit={handleSubmit} className="support-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="categoria">Categoría</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                >
                  <option value="tecnico">Problema Técnico</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="red">Conectividad/Red</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prioridad">Prioridad</label>
                <select
                  id="prioridad"
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="asunto">Asunto</label>
              <input
                type="text"
                id="asunto"
                name="asunto"
                value={formData.asunto}
                onChange={handleChange}
                required
                placeholder="Describe brevemente el problema"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mensaje">Descripción Detallada</label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Proporciona todos los detalles posibles sobre tu problema..."
              ></textarea>
            </div>

            <button type="submit" className="btn-submit">
              Enviar Ticket
            </button>
          </form>
        </div>
        <div className="contact-info-card">
        <h2>Información de Contacto</h2>
        <div className="contact-grid">
          <div className="contact-item">
            <div className="contact-icon">
              <Mail size={20} />
            </div>
            <div>
              <strong>Email</strong>
              <p>soporteIT@tuinity.com</p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <Phone size={20} />
            </div>
            <div>
              <strong>Teléfono</strong>
              <p>+507 6000-0000</p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <Clock size={20} />
            </div>
            <div>
              <strong>Horario</strong>
              <p>Lun - Vie: 8:00 AM - 6:00 PM</p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">
              <Zap size={20} />
            </div>
            <div>
              <strong>Tiempo de Respuesta</strong>
              <p>&lt; 24 horas</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default SoporteCom;