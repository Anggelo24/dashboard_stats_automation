import React, { useState } from "react";
import "../style/AutoStyle.css";
import { HiOutlineRefresh } from "react-icons/hi";

function AutomatizacionesCom() {
  const [activeFilter, setActiveFilter] = useState("todos");
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Datos de ejemplo de workflows del cliente
  const workflows = [
    {
      id: "WF-001",
      nombre: "Sincronización WhatsApp → Shopify",
      descripcion: "Sincroniza pedidos de WhatsApp Business con inventario de Shopify",
      estado: "activo",
      ultimaEjecucion: "2025-10-23T14:30:00",
      ejecucionesHoy: 47,
      tasaExito: 98.5,
      tiempoPromedio: "2.3s",
      categoria: "ventas",
      prioridad: "alta",
      ejecutando: false,
      logs: [
        { hora: "14:30", estado: "exitoso", mensaje: "Pedido #1234 sincronizado correctamente" },
        { hora: "14:25", estado: "exitoso", mensaje: "Pedido #1233 sincronizado correctamente" },
        { hora: "14:20", estado: "exitoso", mensaje: "Pedido #1232 sincronizado correctamente" },
      ],
    },
    {
      id: "WF-002",
      nombre: "Notificaciones de Stock Bajo",
      descripcion: "Envía alertas automáticas cuando el inventario está por debajo del mínimo",
      estado: "activo",
      ultimaEjecucion: "2025-10-23T13:00:00",
      ejecucionesHoy: 12,
      tasaExito: 100,
      tiempoPromedio: "1.8s",
      categoria: "inventario",
      prioridad: "media",
      ejecutando: false,
      logs: [
        { hora: "13:00", estado: "exitoso", mensaje: "Alerta enviada: Producto XYZ - 5 unidades restantes" },
        { hora: "11:30", estado: "exitoso", mensaje: "Alerta enviada: Producto ABC - 3 unidades restantes" },
      ],
    },
    {
      id: "WF-003",
      nombre: "Respaldo Automático de Base de Datos",
      descripcion: "Crea respaldos diarios de la base de datos y los envía a Google Drive",
      estado: "activo",
      ultimaEjecucion: "2025-10-23T02:00:00",
      ejecucionesHoy: 1,
      tasaExito: 100,
      tiempoPromedio: "45s",
      categoria: "backup",
      prioridad: "alta",
      ejecutando: false,
      logs: [
        { hora: "02:00", estado: "exitoso", mensaje: "Respaldo creado: DB_backup_2025-10-23.sql (245 MB)" },
        { hora: "02:00", estado: "exitoso", mensaje: "Archivo subido a Google Drive exitosamente" },
      ],
    },
    {
      id: "WF-004",
      nombre: "Procesamiento de Facturas",
      descripcion: "Extrae datos de facturas PDF y los ingresa al sistema contable",
      estado: "error",
      ultimaEjecucion: "2025-10-23T10:15:00",
      ejecucionesHoy: 8,
      tasaExito: 75,
      tiempoPromedio: "5.2s",
      categoria: "finanzas",
      prioridad: "alta",
      ejecutando: false,
      logs: [
        { hora: "10:15", estado: "error", mensaje: "Error: No se pudo leer el PDF - formato no válido" },
        { hora: "10:10", estado: "exitoso", mensaje: "Factura #5678 procesada correctamente" },
        { hora: "10:05", estado: "exitoso", mensaje: "Factura #5677 procesada correctamente" },
      ],
    },
    {
      id: "WF-005",
      nombre: "Generación de Reportes Semanales",
      descripcion: "Compila métricas semanales y envía reporte por email",
      estado: "pausado",
      ultimaEjecucion: "2025-10-16T09:00:00",
      ejecucionesHoy: 0,
      tasaExito: 100,
      tiempoPromedio: "12s",
      categoria: "reportes",
      prioridad: "baja",
      ejecutando: false,
      logs: [
        { hora: "09:00", estado: "exitoso", mensaje: "Reporte semanal generado y enviado" },
      ],
    },
    {
      id: "WF-006",
      nombre: "Integración CRM → Marketing",
      descripcion: "Sincroniza contactos nuevos del CRM con plataforma de email marketing",
      estado: "activo",
      ultimaEjecucion: "2025-10-23T15:00:00",
      ejecucionesHoy: 23,
      tasaExito: 95.6,
      tiempoPromedio: "3.1s",
      categoria: "marketing",
      prioridad: "media",
      ejecutando: true,
      logs: [
        { hora: "15:00", estado: "ejecutando", mensaje: "Sincronizando 15 contactos nuevos..." },
        { hora: "14:45", estado: "exitoso", mensaje: "8 contactos sincronizados correctamente" },
      ],
    },
  ];

  const stats = {
    total: workflows.length,
    activos: workflows.filter((w) => w.estado === "activo").length,
    pausados: workflows.filter((w) => w.estado === "pausado").length,
    conError: workflows.filter((w) => w.estado === "error").length,
    ejecucionesHoy: workflows.reduce((acc, w) => acc + w.ejecucionesHoy, 0),
  };

  const filteredWorkflows = workflows.filter((w) => {
    if (activeFilter === "todos") return true;
    return w.estado === activeFilter;
  });

  const getEstadoBadge = (estado) => {
    const badges = {
      activo: { icon: "", label: "Activo", class: "badge-active" },
      pausado: { icon: "", label: "Pausado", class: "badge-paused" },
      error: { icon: "", label: "Error", class: "badge-error" },
    };
    return badges[estado];
  };

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      alta: { icon: "", label: "Alta", class: "priority-high" },
      media: { icon: "", label: "Media", class: "priority-medium" },
      baja: { icon: "", label: "Baja", class: "priority-low" },
    };
    return badges[prioridad];
  };

  const getCategoriaIcon = (categoria) => {
    const icons = {
      ventas: "",
      inventario: "",
      backup: "",
      finanzas: "",
      reportes: "",
      marketing: "",
    };
    return icons[categoria] || "";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 1) return "Hace un momento";
    if (diffMinutes < 60) return `Hace ${diffMinutes} minutos`;
    if (diffMinutes < 1440) return `Hace ${Math.floor(diffMinutes / 60)} horas`;
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleToggleWorkflow = (workflowId, currentState) => {
    alert(
      `Workflow ${workflowId}: ${
        currentState === "activo" ? "Pausando" : "Activando"
      }...`
    );
    // Aquí iría la llamada a tu API para pausar/activar el workflow
  };

  const handleViewLogs = (workflow) => {
    setSelectedWorkflow(workflow);
  };

  const handleCloseModal = () => {
    setSelectedWorkflow(null);
  };

  return (
    <div className="soporte-container">
      <div className="workflows-header">
        <div>
          <h1>Mis Automatizaciones</h1>
          <p>
            Gestiona y monitorea todos tus workflows de N8N en tiempo real
          </p>
        </div>
        <button className="refresh-metrics-btn">
          <HiOutlineRefresh />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="workflows-stats">
        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Workflows</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <h3>{stats.activos}</h3>
            <p>Activos</p>
          </div>
        </div>
        <div className="stat-card paused">
          <div className="stat-icon">🟡</div>
          <div className="stat-info">
            <h3>{stats.pausados}</h3>
            <p>Pausados</p>
          </div>
        </div>
        <div className="stat-card error">
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <h3>{stats.conError}</h3>
            <p>Con Errores</p>
          </div>
        </div>
        <div className="stat-card executions">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h3>{stats.ejecucionesHoy}</h3>
            <p>Ejecuciones Hoy</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="workflows-filters">
        <button
          className={`filter-btn ${activeFilter === "todos" ? "active" : ""}`}
          onClick={() => setActiveFilter("todos")}
        >
          Todos ({workflows.length})
        </button>
        <button
          className={`filter-btn ${activeFilter === "activo" ? "active" : ""}`}
          onClick={() => setActiveFilter("activo")}
        >
          Activos ({stats.activos})
        </button>
        <button
          className={`filter-btn ${activeFilter === "pausado" ? "active" : ""}`}
          onClick={() => setActiveFilter("pausado")}
        >
          Pausados ({stats.pausados})
        </button>
        <button
          className={`filter-btn ${activeFilter === "error" ? "active" : ""}`}
          onClick={() => setActiveFilter("error")}
        >
          Con Errores ({stats.conError})
        </button>
      </div>

      {/* Workflows List */}
      <div className="workflows-grid">
        {filteredWorkflows.map((workflow) => (
          <div key={workflow.id} className={`workflow-card ${workflow.estado}`}>
            <div className="workflow-header">
              <div className="workflow-title-group">
                <span className="workflow-category-icon">
                  {getCategoriaIcon(workflow.categoria)}
                </span>
                <div>
                  <h3>{workflow.nombre}</h3>
                  <span className="workflow-id">{workflow.id}</span>
                </div>
              </div>
              <div className="workflow-badges">
                <span
                  className={`badge ${getEstadoBadge(workflow.estado).class}`}
                >
                  {getEstadoBadge(workflow.estado).icon}{" "}
                  {getEstadoBadge(workflow.estado).label}
                </span>
                <span
                  className={`badge ${
                    getPrioridadBadge(workflow.prioridad).class
                  }`}
                >
                  {getPrioridadBadge(workflow.prioridad).icon}{" "}
                  {getPrioridadBadge(workflow.prioridad).label}
                </span>
              </div>
            </div>

            <p className="workflow-description">{workflow.descripcion}</p>

            {workflow.ejecutando && (
              <div className="workflow-executing">
                <div className="executing-spinner"></div>
                <span>Ejecutando ahora...</span>
              </div>
            )}

            <div className="workflow-metrics">
              <div className="metric-item">
                <span className="metric-label">Última Ejecución</span>
                <span className="metric-value">
                  {formatDate(workflow.ultimaEjecucion)}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Ejecuciones Hoy</span>
                <span className="metric-value">{workflow.ejecucionesHoy}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Tasa de Éxito</span>
                <span className="metric-value success">
                  {workflow.tasaExito}%
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Tiempo Promedio</span>
                <span className="metric-value">{workflow.tiempoPromedio}</span>
              </div>
            </div>

            <div className="workflow-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${workflow.tasaExito}%` }}
                ></div>
              </div>
            </div>         
          </div>
        ))}
      </div>

      {/* Modal de Logs */}
      {selectedWorkflow && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Logs: {selectedWorkflow.nombre}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="logs-info">
                <span>Workflow ID: {selectedWorkflow.id}</span>
                <span>Estado: {getEstadoBadge(selectedWorkflow.estado).label}</span>
                <span>Última ejecución: {formatDate(selectedWorkflow.ultimaEjecucion)}</span>
              </div>
              <div className="logs-list">
                {selectedWorkflow.logs.map((log, index) => (
                  <div key={index} className={`log-entry ${log.estado}`}>
                    <span className="log-time">{log.hora}</span>
                    <span className={`log-status ${log.estado}`}>
                      {log.estado === "exitoso" && "✅"}
                      {log.estado === "error" && "❌"}
                      {log.estado === "ejecutando" && "⏳"}
                    </span>
                    <span className="log-message">{log.mensaje}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal secondary" onClick={handleCloseModal}>
                Cerrar
              </button>
              <button className="btn-modal primary">
                📥 Descargar Logs Completos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutomatizacionesCom;
