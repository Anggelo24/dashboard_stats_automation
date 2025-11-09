import React, { useState, useEffect } from "react";
import "../style/metricas.css";
import {
  RefreshCcw,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Activity,
  Loader,
  AlertCircle,
} from "lucide-react";
import { n8nService } from "../services/n8nservices";
import type { DashboardMetrics } from "../services/n8nservices";

function MetricasCom() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const response = await n8nService.getDashboardMetrics();

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al cargar métricas');
      }

      setMetrics(response.data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="metricas-container">
        <div className="metrics-loading">
          <Loader size={48} className="spinner" />
          <p>Cargando métricas del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="metricas-container">
        <div className="metrics-error">
          <AlertCircle size={48} />
          <h3>Error al cargar métricas</h3>
          <p>{error || 'No se pudieron cargar las métricas'}</p>
          <button onClick={handleRefresh}>
            <RefreshCcw size={16} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Preparar datos del timeline para los últimos 7 días
  const timelineData = Object.entries(metrics.timeline).map(([date, data]) => ({
    date,
    ...data,
  }));

  return (
    <div className="metricas-container-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Dashboard de Métricas</h1>
          <p className="last-update">
            Última actualización: {formatDate(metrics.lastUpdate)}
          </p>
        </div>
        <button
          className="refresh-metrics-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCcw className={refreshing ? 'spinning' : ''} />
        </button>
      </div>

      <div className="dashboard-sections">
        {/* Main Metrics Cards */}
        <div className="metricas-container">
          <div className="bloque-Metricas">
            <div className="metrica-icon" style={{ backgroundColor: '#3b82f6' }}>
              <Zap size={24} />
            </div>
            <div className="metrica-content">
              <h3 className="metrica-value">{metrics.workflows.total}</h3>
              <p className="metrica-label">Total Workflows</p>
              <span className="metrica-badge">
                {metrics.workflows.active} activos
              </span>
            </div>
          </div>

          <div className="bloque-Metricas">
            <div className="metrica-icon" style={{ backgroundColor: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div className="metrica-content">
              <h3 className="metrica-value">{metrics.executions.successful}</h3>
              <p className="metrica-label">Ejecuciones Exitosas</p>
              <span className="metrica-badge">Últimos 7 días</span>
            </div>
          </div>

          <div className="bloque-Metricas">
            <div className="metrica-icon" style={{ backgroundColor: '#ef4444' }}>
              <XCircle size={24} />
            </div>
            <div className="metrica-content">
              <h3 className="metrica-value">{metrics.executions.failed}</h3>
              <p className="metrica-label">Ejecuciones Fallidas</p>
              <span className="metrica-badge">Últimos 7 días</span>
            </div>
          </div>

          <div className="bloque-Metricas">
            <div className="metrica-icon" style={{ backgroundColor: '#8b5cf6' }}>
              <TrendingUp size={24} />
            </div>
            <div className="metrica-content">
              <h3 className="metrica-value">{metrics.executions.successRate}%</h3>
              <p className="metrica-label">Tasa de Éxito</p>
              <span className="metrica-badge">Promedio general</span>
            </div>
          </div>
        </div>

        {/* Execution Stats */}
        <div className="graficas-row">
          <div className="bloque-GraficaUno">
            <div className="grafica-header">
              <h3>📊 Estadísticas de Ejecución</h3>
              <span className="live-badge">Últimos 7 días</span>
            </div>
            <div className="execution-stats">
              <div className="stat-box">
                <div className="stat-number">{metrics.executions.total}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-box">
                <div className="stat-number" style={{ color: '#10b981' }}>
                  {metrics.executions.successful}
                </div>
                <div className="stat-label">Exitosas</div>
              </div>
              <div className="stat-box">
                <div className="stat-number" style={{ color: '#ef4444' }}>
                  {metrics.executions.failed}
                </div>
                <div className="stat-label">Fallidas</div>
              </div>
              <div className="stat-box">
                <div className="stat-number" style={{ color: '#f59e0b' }}>
                  {metrics.executions.running}
                </div>
                <div className="stat-label">Ejecutando</div>
              </div>
            </div>
          </div>

          <div className="bloque-GraficaDos">
            <div className="grafica-header">
              <h3>⚡ Rendimiento</h3>
            </div>
            <div className="performance-content">
              <div className="perf-metric">
                <div className="perf-label">Tasa de Éxito</div>
                <div className="perf-value">{metrics.executions.successRate}%</div>
                <div className="perf-bar">
                  <div
                    className="perf-fill success-fill"
                    style={{ width: `${metrics.executions.successRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="perf-metric">
                <div className="perf-label">Tiempo Promedio de Ejecución</div>
                <div className="perf-value">{metrics.executions.avgExecutionTime}s</div>
                <div className="perf-bar">
                  <div
                    className="perf-fill"
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>

              <div className="perf-metric">
                <div className="perf-label">Workflows Activos</div>
                <div className="perf-value">
                  {metrics.workflows.active}/{metrics.workflows.total}
                </div>
                <div className="perf-bar">
                  <div
                    className="perf-fill"
                    style={{
                      width: `${(metrics.workflows.active / metrics.workflows.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="graficas-row">
          <div className="bloque-GraficaTres">
            <div className="grafica-header">
              <h3>📈 Línea de Tiempo (7 días)</h3>
            </div>
            <div className="timeline-content">
              {timelineData.map((day) => {
                const successWidth = day.total > 0
                  ? (day.success / day.total) * 100
                  : 0;
                const failedWidth = day.total > 0
                  ? (day.failed / day.total) * 100
                  : 0;

                return (
                  <div key={day.date} className="timeline-day">
                    <div className="timeline-date">
                      {new Date(day.date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                    <div className="timeline-bar-container">
                      {day.success > 0 && (
                        <div
                          className="timeline-bar success"
                          style={{ width: `${successWidth}%` }}
                          title={`${day.success} exitosas`}
                        ></div>
                      )}
                      {day.failed > 0 && (
                        <div
                          className="timeline-bar failed"
                          style={{ width: `${failedWidth}%` }}
                          title={`${day.failed} fallidas`}
                        ></div>
                      )}
                    </div>
                    <div className="timeline-count">{day.total}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Workflows */}
          <div className="bloque-GraficaCuatro">
            <div className="grafica-header">
              <h3>🏆 Top Workflows</h3>
              <span className="count-badge">
                {metrics.topWorkflows.length} workflows
              </span>
            </div>
            <div className="workflow-list">
              {metrics.topWorkflows.length > 0 ? (
                metrics.topWorkflows.map((workflow, index) => (
                  <div key={workflow.id} className="workflow-item">
                    <div className="workflow-rank">#{index + 1}</div>
                    <div className="workflow-info">
                      <strong>{workflow.name}</strong>
                      <div className="workflow-stats">
                        {workflow.count} ejecuciones
                      </div>
                    </div>
                    <div className={`workflow-status ${workflow.active ? 'active' : 'inactive'}`}>
                      {workflow.active ? (
                        <CheckCircle size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                    </div>
                    <div className="workflow-count">{workflow.count}</div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No hay datos de ejecuciones en los últimos 7 días</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bloque-Side">
          <div className="grafica-header">
            <h3>📊 Resumen General</h3>
          </div>
          <div className="stats-summary">
            <div className="summary-item">
              <Activity className="summary-icon" />
              <div className="summary-data">
                <div className="summary-value">{metrics.workflows.total}</div>
                <div className="summary-label">Workflows Configurados</div>
              </div>
            </div>

            <div className="summary-item">
              <CheckCircle className="summary-icon" style={{ color: '#10b981' }} />
              <div className="summary-data">
                <div className="summary-value">{metrics.workflows.active}</div>
                <div className="summary-label">Workflows Activos</div>
              </div>
            </div>

            <div className="summary-item">
              <Clock className="summary-icon" style={{ color: '#f59e0b' }} />
              <div className="summary-data">
                <div className="summary-value">{metrics.workflows.paused}</div>
                <div className="summary-label">Workflows Pausados</div>
              </div>
            </div>

            <div className="summary-item">
              <Zap className="summary-icon" style={{ color: '#3b82f6' }} />
              <div className="summary-data">
                <div className="summary-value">{metrics.executions.total}</div>
                <div className="summary-label">Ejecuciones Totales (7d)</div>
              </div>
            </div>

            <div className="summary-item">
              <TrendingUp className="summary-icon" style={{ color: '#8b5cf6' }} />
              <div className="summary-data">
                <div className="summary-value">{metrics.executions.successRate}%</div>
                <div className="summary-label">Tasa de Éxito Promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricasCom;