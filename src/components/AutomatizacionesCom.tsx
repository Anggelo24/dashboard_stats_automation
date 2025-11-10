import React, { useState, useEffect, useCallback } from "react";
import "../style/automatizaciones.css";
import {
  RefreshCcw,
  Settings,
  CheckCircle,
  PauseCircle,
  AlertCircle,
  Zap,
  ShoppingCart,
  Package,
  HardDrive,
  DollarSign,
  FileText,
  Mail,
  X,
  CheckSquare,
  XCircle,
  Clock,
  Loader,
} from "lucide-react";
import { n8nService } from "../services/n8nservices";
import type { WorkflowSummary } from "../services/n8nservices";

interface WorkflowWithMetrics extends WorkflowSummary {
  nombre: string;
  descripcion: string;
  estado: "activo" | "pausado" | "error";
  ultimaEjecucion: string;
  ejecucionesHoy: number;
  tasaExito: number;
  categoria: string;
  prioridad: "alta" | "media" | "baja";
  ejecutando: boolean;
  logs: Array<{
    hora: string;
    estado: string;
    mensaje: string;
  }>;
}

function AutomatizacionesCom() {
  const [activeFilter, setActiveFilter] = useState("todos");
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowWithMetrics | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Función para categorizar workflows basado en nombre/tags
  const categorizeWorkflow = (workflow: WorkflowSummary): string => {
    const name = workflow.name.toLowerCase();
    const tags = workflow.tags?.map(t => t.name.toLowerCase()).join(' ') || '';
    const searchText = `${name} ${tags}`;

    if (searchText.includes('whatsapp') || searchText.includes('shopify') || searchText.includes('venta')) {
      return 'ventas';
    }
    if (searchText.includes('stock') || searchText.includes('inventario') || searchText.includes('inventory')) {
      return 'inventario';
    }
    if (searchText.includes('backup') || searchText.includes('respaldo') || searchText.includes('drive')) {
      return 'backup';
    }
    if (searchText.includes('factura') || searchText.includes('invoice') || searchText.includes('contab')) {
      return 'finanzas';
    }
    if (searchText.includes('reporte') || searchText.includes('report') || searchText.includes('metrics')) {
      return 'reportes';
    }
    if (searchText.includes('crm') || searchText.includes('marketing') || searchText.includes('email')) {
      return 'marketing';
    }
    return 'general';
  };

  // Función para determinar prioridad basado en tasa de ejecución
  const determinePriority = (executionsCount: number): "alta" | "media" | "baja" => {
    if (executionsCount > 20) return 'alta';
    if (executionsCount > 5) return 'media';
    return 'baja';
  };

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener todos los workflows
      const workflowsResponse = await n8nService.getWorkflowsSummary({ limit: 100 });

      if (!workflowsResponse.success || !workflowsResponse.data) {
        throw new Error(workflowsResponse.error || 'Error al cargar workflows');
      }

      // Filtrar solo workflows que contengan "Fluffy" en el nombre o tags
      const fluffyWorkflows = workflowsResponse.data.filter(wf => {
        const nameHasFluffy = wf.name.toLowerCase().includes('fluffy');
        const tagsHaveFluffy = wf.tags?.some(tag =>
          tag.name.toLowerCase().includes('fluffy')
        ) || false;

        return nameHasFluffy || tagsHaveFluffy;
      });

      // Obtener métricas para cada workflow de Fluffy
      const workflowsWithMetrics = await Promise.all(
        fluffyWorkflows.map(async (wf) => {
          try {
            const metricsResponse = await n8nService.getWorkflowMetrics(wf.id, 1); // Last day
            const metrics = metricsResponse.data?.metrics;

            return {
              ...wf,
              id: wf.id,
              nombre: wf.name,
              descripcion: `Workflow ${wf.active ? 'activo' : 'inactivo'}`,
              estado: wf.active ? 'activo' : 'pausado',
              ultimaEjecucion: metrics?.lastExecution || wf.updatedAt,
              ejecucionesHoy: metrics?.totalExecutions || 0,
              tasaExito: metrics?.successRate || 100,
              categoria: categorizeWorkflow(wf),
              prioridad: determinePriority(metrics?.totalExecutions || 0),
              ejecutando: metrics?.lastStatus === 'running',
              logs: metricsResponse.data?.recentExecutions?.slice(0, 10).map(exec => ({
                hora: new Date(exec.startedAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                estado: exec.status === 'success' ? 'exitoso' :
                        exec.status === 'error' ? 'error' : 'ejecutando',
                mensaje: `Ejecución ${exec.status === 'success' ? 'exitosa' :
                         exec.status === 'error' ? 'con error' : 'en progreso'}`
              })) || []
            } as WorkflowWithMetrics;
          } catch (err) {
            console.error(`Error fetching metrics for workflow ${wf.id}:`, err);
            return {
              ...wf,
              id: wf.id,
              nombre: wf.name,
              descripcion: `Workflow ${wf.active ? 'activo' : 'inactivo'}`,
              estado: wf.active ? 'activo' : 'pausado',
              ultimaEjecucion: wf.updatedAt,
              ejecucionesHoy: 0,
              tasaExito: 100,
              categoria: categorizeWorkflow(wf),
              prioridad: 'baja',
              ejecutando: false,
              logs: []
            } as WorkflowWithMetrics;
          }
        })
      );

      setWorkflows(workflowsWithMetrics);
    } catch (err) {
      console.error('Error fetching workflows:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWorkflows();
  };

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

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { icon: string; label: string; class: string }> = {
      activo: { icon: "", label: "Activo", class: "badge-active" },
      pausado: { icon: "", label: "Pausado", class: "badge-paused" },
      error: { icon: "", label: "Error", class: "badge-error" },
    };
    return badges[estado] || badges.activo;
  };

  const getPrioridadBadge = (prioridad: string) => {
    const badges: Record<string, { icon: string; label: string; class: string }> = {
      alta: { icon: "", label: "Alta", class: "priority-high" },
      media: { icon: "", label: "Media", class: "priority-medium" },
      baja: { icon: "", label: "Baja", class: "priority-low" },
    };
    return badges[prioridad] || badges.baja;
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, React.ReactElement> = {
      ventas: <ShoppingCart size={18} />,
      inventario: <Package size={18} />,
      backup: <HardDrive size={18} />,
      finanzas: <DollarSign size={18} />,
      reportes: <FileText size={18} />,
      marketing: <Mail size={18} />,
      general: <Settings size={18} />,
    };
    return icons[categoria] || <Settings size={18} />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

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

 {/*const handleToggleWorkflow = async (workflowId: string, currentState: string) => {
    try {
      if (currentState === "activo") {
        await n8nService.deactivateWorkflow(workflowId);
      } else {
        await n8nService.activateWorkflow(workflowId);
      }
      // Refresh workflows after toggle
      await fetchWorkflows();
    } catch (err) {
      console.error('Error toggling workflow:', err);
      alert('Error al cambiar el estado del workflow');
    }
  };*/}

  const handleViewLogs = (workflow: WorkflowWithMetrics) => {
    setSelectedWorkflow(workflow);
  };

  const handleCloseModal = () => {
    setSelectedWorkflow(null);
  };

  if (loading) {
    return (
      <div className="automatizaciones-container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '1rem'
        }}>
          <Loader size={48} className="spinner" />
          <p style={{ color: 'var(--color-text-dark-muted)' }}>
            Cargando workflows...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="automatizaciones-container">
        <div className="metrics-error">
          <AlertCircle size={48} />
          <h3>Error al cargar workflows</h3>
          <p>{error}</p>
          <button onClick={handleRefresh}>
            <RefreshCcw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="automatizaciones-container">
      <div className="workflows-header">
        <div>
          <h1>Mis Automatizaciones</h1>
          <p>Gestiona y monitorea todos tus workflows de N8N en tiempo real</p>
        </div>
        <button
          className="refresh-metrics-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCcw size={16} className={refreshing ? 'spinning' : ''} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="workflows-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <Settings size={20} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Automatizaciones</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={20} />
          </div>
          <div className="stat-info">
            <h3>{stats.activos}</h3>
            <p>Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon paused">
            <PauseCircle size={20} />
          </div>
          <div className="stat-info">
            <h3>{stats.pausados}</h3>
            <p>Pausados</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon errors">
            <AlertCircle size={20} />
          </div>
          <div className="stat-info">
            <h3>{stats.conError}</h3>
            <p>Con Errores</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">
            <Zap size={20} />
          </div>
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
                  <span className="workflow-id">ID: {workflow.id}</span>
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
            </div>

            <div className="workflow-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${workflow.tasaExito}%` }}
                ></div>
              </div>
            </div>

            <div className="workflow-actions">
              <button
                className="btn-modal secondary"
                onClick={() => handleViewLogs(workflow)}
              >
                Ver Informe
              </button>
              {/*<button
                className="btn-modal primary"
                onClick={() => handleToggleWorkflow(workflow.id, workflow.estado)}
              >
                {workflow.estado === 'activo' ? 'Pausar' : 'Activar'}
              </button>*/}
            </div>
          </div>
        ))}
      </div>

      {filteredWorkflows.length === 0 && (
        <div className="no-data">
          <p>No hay automatizaciones {activeFilter !== 'todos' ? activeFilter + 's' : ''}</p>
        </div>
      )}

      {/* Modal de Logs */}
      {selectedWorkflow && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Informe: {selectedWorkflow.nombre}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="logs-info">
                <span>Workflow ID: {selectedWorkflow.id}</span>
                <span>Estado: {getEstadoBadge(selectedWorkflow.estado).label}</span>
                <span>Última ejecución: {formatDate(selectedWorkflow.ultimaEjecucion)}</span>
              </div>
              <div className="logs-list">
                {selectedWorkflow.logs.length > 0 ? (
                  selectedWorkflow.logs.map((log, index) => (
                    <div key={index} className={`log-entry ${log.estado}`}>
                      <span className="log-time">{log.hora}</span>
                      <span className={`log-level ${log.estado}`}>
                        {log.estado === "exitoso" && <CheckSquare size={14} />}
                        {log.estado === "error" && <XCircle size={14} />}
                        {log.estado === "ejecutando" && <Clock size={14} />}
                      </span>
                      <span className="log-message">{log.mensaje}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <p>No hay logs disponibles para este workflow</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal secondary" onClick={handleCloseModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutomatizacionesCom;