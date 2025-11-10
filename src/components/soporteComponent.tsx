import React, { useState } from "react";
import "../style/soporte.css";

interface FormData {
  nombre: string;
  email: string;
  asunto: string;
  prioridad: string;
  categoria: string;
  mensaje: string;
}

interface Ticket {
  id: string;
  asunto: string;
  estado: string;
  prioridad: string;
  fecha: string;
  respuesta: null | string;
}

function SoporteCom() {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    asunto: "",
    prioridad: "media",
    categoria: "tecnico",
    mensaje: "",
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Create local ticket for tracking
        const newTicket = {
          id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
          asunto: formData.asunto,
          estado: "abierto",
          prioridad: formData.prioridad,
          fecha: new Date().toISOString(),
          respuesta: null,
        };

        setTickets([newTicket, ...tickets]);

        // Reset form
        setFormData({
          nombre: "",
          email: "",
          asunto: "",
          prioridad: "media",
          categoria: "tecnico",
          mensaje: "",
        });

        alert("Ticket enviado exitosamente! Recibirás una respuesta en Soporte@tuinity.lat");
      } else {
        alert(data.error || "Error al enviar el ticket. Por favor intente nuevamente.");
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert("Error al enviar el ticket. Por favor verifique su conexión e intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="soporte-container">
      <div className="support-header">
        <div>
          <h1>Soporte IT - Tuinity</h1>
          <p>Estamos aquí para ayudarte. Crea un ticket o consulta y te responderemos lo antes posible.</p>
        </div>
      </div>

      <div className="support-content-grid">
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
                rows={6}
                placeholder="Proporciona todos los detalles posibles sobre tu problema..."
              ></textarea>
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>

        <div className="support-divider-vertical"></div>

        <div className="contact-info-section">
          <h2>Información de Contacto</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <div>
                <strong>Email</strong>
                <p>Soporte@tuinity.lat</p>
              </div>
            </div>
            <div className="contact-item">
              <div>
                <strong>Teléfono</strong>
                <p>+507 6812-3708</p>
                <p>+57 310 454425</p>
              </div>
            </div>
            <div className="contact-item">
              <div>
                <strong>Horario</strong>
                <p>Lun - Vie: 8:00 AM - 6:00 PM</p>
              </div>
            </div>
            <div className="contact-item">
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