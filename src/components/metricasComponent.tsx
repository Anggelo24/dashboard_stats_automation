import React, { useState, useEffect } from "react";
import "../style/metricas.css";
import {
  RefreshCcw,
  MessageSquare,
  Phone,
  ClipboardCheck,
  ShoppingBag,
  ShoppingCart,
  MessageCircle,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  Loader,
  AlertCircle,
  Users,
  Trophy,
  BarChart3,
  Clock,
} from "lucide-react";
import { supabaseService } from "../services/supabaseService.ts";
import type { BusinessMetrics } from "../services/supabaseService.ts";

// ⚠️ REEMPLAZA CON TU UUID REAL DE FLUFFY DESDE SUPABASE
const FLUFFY_CLIENT_ID = "2e75e60c-2362-42d1-8300-225944efb8db";

function MetricasCom() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const response = await supabaseService.getBusinessMetrics(FLUFFY_CLIENT_ID, 7);

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
          <p>Cargando métricas del negocio...</p>
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

  // Preparar datos del timeline
  const timelineData = Object.entries(metrics.timeline)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, data]) => ({ date, ...data }));

  return (
    <div className="metricas-container-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Resumen del negocio Fluffy</h1>
          <p className="last-update">
            Actividad de tu negocio en tiempo real. Última actualización: {new Date().toLocaleString('es-ES')}
          </p>
        </div>
        <button
          className="refresh-metrics-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCcw size={16} className={refreshing ? 'spinning' : ''} />
        </button>
      </div>

      <div className="dashboard-sections">
        {/* Main Summary Cards */}
        <div className="metricas-container">
          <div className="bloque-Metricas">
            <div className="metrica-icon" style={{ backgroundColor: '#3b82f6' }}>
              <Activity size={24} />
            </div>
            <div className="metrica-content">
              <h3 className="metrica-value">{metrics.summary.totalEvents}</h3>
              <p className="metrica-label">Eventos Totales</p>
              <span className="metrica-badge">Últimos 7 días</span>
            </div>
          </div>

          <div className="bloque-Metricas">
            <div className="metrica-icon" style={{ backgroundColor: '#10b981' }}>
              <Users size={24} />
            </div>
            <div className="metrica-content">
              <h3 className="metrica-value">{metrics.summary.uniqueContacts}</h3>
              <p className="metrica-label">Contactos Únicos</p>
              <span className="metrica-badge">Clientes alcanzados</span>
            </div>
          </div>

          <div className="bloque-Metricas">
            <div className="metrica-icon" style={{ backgroundColor: '#8b5cf6' }}>
              <TrendingUp size={24} />
            </div>
            <div className="metrica-content">
              <h3 className="metrica-value">{metrics.summary.successRate}%</h3>
              <p className="metrica-label">Tasa de Éxito</p>
              <span className="metrica-badge">Automatizaciones</span>
            </div>
          </div>

          <div className="bloque-Metricas">
            <div className="metrica-icon" style={{ backgroundColor: '#f59e0b' }}>
              <Zap size={24} />
            </div>
            <div className="metrica-content">
              <h3 className="metrica-value">{metrics.summary.last24Hours}</h3>
              <p className="metrica-label">Últimas 24 Horas</p>
              <span className="metrica-badge">Actividad reciente</span>
            </div>
          </div>
        </div>

        {/* Business Metrics Row 1 */}
        <div className="graficas-row">
          {/* WhatsApp Card */}
          {metrics.metrics.whatsapp && (
            <div className="bloque-GraficaUno">
              <div className="grafica-header">
                <h3>
                  <MessageSquare size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                  WhatsApp
                </h3>
                <span className="live-badge">Últimos 7 días</span>
              </div>
              <div className="execution-stats">
                <div className="stat-box">
                  <div className="stat-number">{metrics.metrics.whatsapp.sent}</div>
                  <div className="stat-label">Enviados</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#10b981' }}>
                    {metrics.metrics.whatsapp.delivered}
                  </div>
                  <div className="stat-label">Entregados</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#3b82f6' }}>
                    {metrics.metrics.whatsapp.read}
                  </div>
                  <div className="stat-label">Leídos</div>
                </div>
              </div>
            </div>
          )}

          {/* Calls Card */}
          {metrics.metrics.calls && (
            <div className="bloque-GraficaDos">
              <div className="grafica-header">
                <h3>
                  <Phone size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                  Llamadas
                </h3>
              </div>
              <div className="performance-content">
                <div className="perf-metric">
                  <div className="perf-label">Llamadas Realizadas</div>
                  <div className="perf-value">{metrics.metrics.calls.made}</div>
                  <div className="perf-bar">
                    <div className="perf-fill" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="perf-metric">
                  <div className="perf-label">Contestadas</div>
                  <div className="perf-value">{metrics.metrics.calls.answered}</div>
                  <div className="perf-bar">
                    <div
                      className="perf-fill success-fill"
                      style={{ width: `${(metrics.metrics.calls.answered / metrics.metrics.calls.made) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="perf-metric">
                  <div className="perf-label">Duración Promedio</div>
                  <div className="perf-value">{metrics.metrics.calls.avgDuration}</div>
                  <div className="perf-bar">
                    <div className="perf-fill" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Business Metrics Row 2 */}
        <div className="graficas-row">
          {/* Surveys Card */}
          {metrics.metrics.surveys && (
            <div className="bloque-GraficaTres">
              <div className="grafica-header">
                <h3>
                  <ClipboardCheck size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                  Encuestas
                </h3>
              </div>
              <div className="timeline-content">
                <div className="perf-metric" style={{ marginBottom: '1rem' }}>
                  <div className="perf-label">Encuestas Enviadas</div>
                  <div className="perf-value">{metrics.metrics.surveys.sent}</div>
                </div>
                <div className="perf-metric" style={{ marginBottom: '1rem' }}>
                  <div className="perf-label">Completadas</div>
                  <div className="perf-value" style={{ color: '#10b981' }}>
                    {metrics.metrics.surveys.completed}
                  </div>
                </div>
                <div className="perf-metric">
                  <div className="perf-label">Tasa de Completado</div>
                  <div className="perf-value">{metrics.metrics.surveys.completionRate}%</div>
                  <div className="perf-bar">
                    <div
                      className="perf-fill success-fill"
                      style={{ width: `${metrics.metrics.surveys.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Card */}
          {metrics.metrics.sales && (
            <div className="bloque-GraficaCuatro">
              <div className="grafica-header">
                <h3>
                  <ShoppingBag size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                  Ventas
                </h3>
                <span className="count-badge">
                  {metrics.metrics.sales.registered}
                </span>
              </div>
              <div className="performance-content">
                <div className="perf-metric">
                  <div className="perf-label">Ventas Registradas</div>
                  <div className="perf-value">{metrics.metrics.sales.registered}</div>
                </div>

                <div className="perf-metric">
                  <div className="perf-label">Ingresos Totales</div>
                  <div className="perf-value" style={{ color: '#10b981' }}>
                    ${metrics.metrics.sales.totalRevenue.toFixed(2)}
                  </div>
                </div>

                <div className="perf-metric">
                  <div className="perf-label">Ticket Promedio</div>
                  <div className="perf-value">${metrics.metrics.sales.avgOrderValue.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Business Metrics Row 3 */}
        <div className="graficas-row">
          {/* Abandoned Cart Card */}
          {metrics.metrics.abandonedCart && (
            <div className="bloque-GraficaUno">
              <div className="grafica-header">
                <h3>
                  <ShoppingCart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                  Carritos Abandonados
                </h3>
              </div>
              <div className="execution-stats">
                <div className="stat-box">
                  <div className="stat-number">{metrics.metrics.abandonedCart.contacted}</div>
                  <div className="stat-label">Contactados</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#10b981' }}>
                    {metrics.metrics.abandonedCart.recovered}
                  </div>
                  <div className="stat-label">Recuperados</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number" style={{ color: '#8b5cf6' }}>
                    {metrics.metrics.abandonedCart.recoveryRate}%
                  </div>
                  <div className="stat-label">Tasa</div>
                </div>
              </div>
            </div>
          )}

          {/* AI Comments Card */}
          {metrics.metrics.aiComments && (
            <div className="bloque-GraficaDos">
              <div className="grafica-header">
                <h3>
                  <MessageCircle size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                  Community Manager AI
                </h3>
              </div>
              <div className="performance-content">
                <div className="perf-metric">
                  <div className="perf-label">Comentarios Procesados</div>
                  <div className="perf-value">{metrics.metrics.aiComments.processed}</div>
                  <div className="perf-bar">
                    <div className="perf-fill" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="perf-metric">
                  <div className="perf-label">Respuestas Públicas</div>
                  <div className="perf-value">{metrics.metrics.aiComments.replied}</div>
                  <div className="perf-bar">
                    <div
                      className="perf-fill success-fill"
                      style={{ width: `${(metrics.metrics.aiComments.replied / metrics.metrics.aiComments.processed) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="perf-metric">
                  <div className="perf-label">DMs Enviados</div>
                  <div className="perf-value">{metrics.metrics.aiComments.dmsSent}</div>
                  <div className="perf-bar">
                    <div
                      className="perf-fill"
                      style={{ width: `${(metrics.metrics.aiComments.dmsSent / metrics.metrics.aiComments.processed) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="graficas-row">
          <div className="bloque-GraficaTres">
            <div className="grafica-header">
              <h3>
                <TrendingUp size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                Actividad Diaria (7 días)
              </h3>
            </div>
            <div className="timeline-content">
              {timelineData.map((day) => {
                const successWidth = day.total > 0 ? (day.success / day.total) * 100 : 0;
                const failedWidth = day.total > 0 ? (day.failed / day.total) * 100 : 0;

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

          {/* Recent Activity */}
          <div className="bloque-GraficaCuatro">
            <div className="grafica-header">
              <h3>
                <Trophy size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                Actividad Reciente
              </h3>
              <span className="count-badge">{metrics.recentActivity.length}</span>
            </div>
            <div className="workflow-list">
              {metrics.recentActivity.length > 0 ? (
                metrics.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="workflow-item">
                    <div className={`workflow-status ${activity.status === 'success' ? 'active' : 'inactive'}`}>
                      {activity.status === 'success' ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                    </div>
                    <div className="workflow-info">
                      <strong>{activity.eventType}</strong>
                      <div className="workflow-stats">
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No hay actividad reciente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bloque-Side">
          <div className="grafica-header">
            <h3>
              <BarChart3 size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
              Resumen General
            </h3>
          </div>
          <div className="stats-summary">
            <div className="summary-item">
              <Activity className="summary-icon" />
              <div className="summary-data">
                <div className="summary-value">{metrics.summary.totalEvents}</div>
                <div className="summary-label">Eventos Totales (7d)</div>
              </div>
            </div>

            <div className="summary-item">
              <Users className="summary-icon" style={{ color: '#10b981' }} />
              <div className="summary-data">
                <div className="summary-value">{metrics.summary.uniqueContacts}</div>
                <div className="summary-label">Contactos Únicos</div>
              </div>
            </div>

            <div className="summary-item">
              <TrendingUp className="summary-icon" style={{ color: '#8b5cf6' }} />
              <div className="summary-data">
                <div className="summary-value">{metrics.summary.successRate}%</div>
                <div className="summary-label">Tasa de Éxito</div>
              </div>
            </div>

            <div className="summary-item">
              <Zap className="summary-icon" style={{ color: '#f59e0b' }} />
              <div className="summary-data">
                <div className="summary-value">{metrics.summary.last24Hours}</div>
                <div className="summary-label">Últimas 24 Horas</div>
              </div>
            </div>

            {metrics.metrics.sales && (
              <div className="summary-item">
                <ShoppingBag className="summary-icon" style={{ color: '#10b981' }} />
                <div className="summary-data">
                  <div className="summary-value">${metrics.metrics.sales.totalRevenue.toFixed(2)}</div>
                  <div className="summary-label">Ingresos Totales</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricasCom;