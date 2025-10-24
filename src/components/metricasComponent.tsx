import React, { useState, useEffect } from 'react';
import '../style/metricasStyle.css';
import { HiOutlineRefresh } from "react-icons/hi";

const MOCK_METRICS = {
  overview: {
    totalExecutions: 247,
    successfulExecutions: 228,
    failedExecutions: 14,
    runningExecutions: 5,
    successRate: 92.3
  },
  whatsapp: {
    messagesSent: 189,
    ordersProcessed: 156,
    revenue: 12450
  },
  performance: {
    avgExecutionTime: 2.4,
    totalActiveWorkflows: 8,
    totalWorkflows: 12
  },
  timeline: [
    { date: '10/17/2025', successful: 32, failed: 2, total: 34 },
    { date: '10/18/2025', successful: 38, failed: 1, total: 39 },
    { date: '10/19/2025', successful: 35, failed: 3, total: 38 },
    { date: '10/20/2025', successful: 31, failed: 2, total: 33 },
    { date: '10/21/2025', successful: 36, failed: 2, total: 38 },
    { date: '10/22/2025', successful: 33, failed: 3, total: 36 },
    { date: '10/23/2025', successful: 23, failed: 1, total: 24 }
  ],
  recentActivity: [
    {
      id: 'exec_1234567890ab',
      workflowName: 'Shopify WhatsApp Automation',
      status: 'success',
      startedAt: '2025-10-23T14:23:45.000Z',
      duration: '2.3'
    },
    {
      id: 'exec_2345678901bc',
      workflowName: 'Instagram Lead Capture',
      status: 'success',
      startedAt: '2025-10-23T14:18:12.000Z',
      duration: '1.8'
    },
    {
      id: 'exec_3456789012cd',
      workflowName: 'Email Campaign Sender',
      status: 'error',
      startedAt: '2025-10-23T14:10:33.000Z',
      duration: '5.1'
    },
    {
      id: 'exec_4567890123de',
      workflowName: 'CRM Data Sync',
      status: 'success',
      startedAt: '2025-10-23T14:05:21.000Z',
      duration: '3.2'
    },
    {
      id: 'exec_5678901234ef',
      workflowName: 'Shopify WhatsApp Automation',
      status: 'success',
      startedAt: '2025-10-23T13:58:45.000Z',
      duration: '2.1'
    }
  ],
  workflowStats: {
    'Shopify WhatsApp Automation': {
      id: 'wf_001',
      active: true,
      totalExecutions: 89,
      successfulExecutions: 84,
      failedExecutions: 5
    },
    'Instagram Lead Capture': {
      id: 'wf_002',
      active: true,
      totalExecutions: 67,
      successfulExecutions: 65,
      failedExecutions: 2
    },
    'Email Campaign Sender': {
      id: 'wf_003',
      active: true,
      totalExecutions: 45,
      successfulExecutions: 42,
      failedExecutions: 3
    },
    'CRM Data Sync': {
      id: 'wf_004',
      active: true,
      totalExecutions: 34,
      successfulExecutions: 30,
      failedExecutions: 4
    },
    'Order Notification System': {
      id: 'wf_005',
      active: false,
      totalExecutions: 12,
      successfulExecutions: 12,
      failedExecutions: 0
    }
  }
};

function Metricas() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Simular carga de datos
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      
      // Simular delay de API
      setTimeout(() => {
        setMetrics(MOCK_METRICS);
        setLastUpdate(new Date());
        setLoading(false);
      }, 800);
    };

    loadData();
    
    // Auto-refresh cada 30 segundos (opcional con mock data)
    // const interval = setInterval(loadData, 30000);
    // return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      // Simular pequeños cambios en los datos
      const updatedMetrics = {
        ...MOCK_METRICS,
        overview: {
          ...MOCK_METRICS.overview,
          totalExecutions: MOCK_METRICS.overview.totalExecutions + Math.floor(Math.random() * 5),
          runningExecutions: Math.floor(Math.random() * 8)
        }
      };
      setMetrics(updatedMetrics);
      setLastUpdate(new Date());
      setLoading(false);
    }, 800);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ textAlign: 'left', fontSize: '15px', fontWeight: '500', paddingTop: '20px',paddingBottom: '10px', color: '#111827' }}>
          Resumen del Negocio
          {lastUpdate && (
            <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '10px' }}>
              • Actualizado: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </h1>
        {!loading && (
          <button onClick={refreshData} className="refresh-metrics-btn">
            <HiOutlineRefresh />
          </button>
        )}
      </div>
      
      <div className='dashboard-sections'>
        {loading && !metrics ? (
          <div className="metrics-loading">
            <div className="spinner"></div>
            <p>Cargando métricas...</p>
          </div>
        ) : (
          <>
            <div className="metricas-container">
              <div className="bloque-Metricas whatsapp">
                <div className="metrica-icon">💬</div>
                <div className="metrica-content">
                  <h3 className="metrica-value">{metrics?.whatsapp?.messagesSent || 0}</h3>
                  <p className="metrica-label">Mensajes WhatsApp</p>
                  <span className="metrica-badge">Últimos 7 días</span>
                </div>
              </div>

              <div className="bloque-Metricas shopify">
                <div className="metrica-icon">📦</div>
                <div className="metrica-content">
                  <h3 className="metrica-value">{metrics?.whatsapp?.ordersProcessed || 0}</h3>
                  <p className="metrica-label">Pedidos Procesados</p>
                  <span className="metrica-badge">Shopify</span>
                </div>
              </div>

              <div className="bloque-Metricas success">
                <div className="metrica-icon">✅</div>
                <div className="metrica-content">
                  <h3 className="metrica-value">{metrics?.overview?.successRate || 0}%</h3>
                  <p className="metrica-label">Tasa de Éxito</p>
                  <span className="metrica-badge">Workflows</span>
                </div>
              </div>

              <div className="bloque-Metricas active">
                <div className="metrica-icon">⚡</div>
                <div className="metrica-content">
                  <h3 className="metrica-value">{metrics?.performance?.totalActiveWorkflows || 0}</h3>
                  <p className="metrica-label">Workflows Activos</p>
                  <span className="metrica-badge">N8N</span>
                </div>
              </div>
            </div>

            <div className="graficas-row">
              <div className="bloque-GraficaUno">
                <div className="grafica-header">
                  <h3>Resumen de Ejecuciones</h3>
                  <span className="live-badge">Datos</span>
                </div>
                <div className="execution-stats">
                  <div className="stat-box success-box">
                    <div className="stat-number">{metrics?.overview?.successfulExecutions || 0}</div>
                    <div className="stat-label">Exitosas</div>
                  </div>
                  <div className="stat-box error-box">
                    <div className="stat-number">{metrics?.overview?.failedExecutions || 0}</div>
                    <div className="stat-label">Fallidas</div>
                  </div>
                  <div className="stat-box running-box">
                    <div className="stat-number">{metrics?.overview?.runningExecutions || 0}</div>
                    <div className="stat-label">En Ejecución</div>
                  </div>
                  <div className="stat-box total-box">
                    <div className="stat-number">{metrics?.overview?.totalExecutions || 0}</div>
                    <div className="stat-label">Total</div>
                  </div>
                </div>
              </div>

              <div className="bloque-Side">
                <div className="grafica-header">
                  <h3>Rendimiento</h3>
                </div>
                <div className="performance-content">
                  <div className="perf-metric">
                    <span className="perf-label">Tiempo promedio</span>
                    <span className="perf-value">{metrics?.performance?.avgExecutionTime || 0}s</span>
                    <div className="perf-bar">
                      <div className="perf-fill" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div className="perf-metric">
                    <span className="perf-label">Tasa de éxito</span>
                    <span className="perf-value">{metrics?.overview?.successRate || 0}%</span>
                    <div className="perf-bar">
                      <div 
                        className="perf-fill success-fill" 
                        style={{width: `${metrics?.overview?.successRate || 0}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="perf-metric">
                    <span className="perf-label">Workflows totales</span>
                    <span className="perf-value">{metrics?.performance?.totalWorkflows || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="graficas-row">
              {/* GraficaDos - Actividad Reciente */}
              <div className="bloque-GraficaDos">
                <div className="grafica-header">
                  <h3>Actividad Reciente</h3>
                  <span className="count-badge">{metrics?.recentActivity?.length || 0} ejecuciones</span>
                </div>
                <div className="activity-list">
                  {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
                    metrics.recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className={`activity-row ${activity.status}`}>
                        <div className="activity-status-icon">
                          {activity.status === 'success' ? '✓' : 
                           activity.status === 'error' ? '✗' : '⚡'}
                        </div>
                        <div className="activity-details">
                          <strong>{activity.workflowName}</strong>
                          <span className="activity-meta">
                            {new Date(activity.startedAt).toLocaleTimeString('es-PA')}
                            {activity.duration && ` • ${activity.duration}s`}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No hay actividad reciente</p>
                  )}
                </div>
              </div>

              <div className="bloque-GraficaTres">
                <div className="grafica-header">
                  <h3>Timeline (7 días)</h3>
                </div>
                <div className="timeline-content">
                  {metrics?.timeline && metrics.timeline.length > 0 ? (
                    metrics.timeline.slice(-7).map((day, index) => (
                      <div key={index} className="timeline-day">
                        <span className="timeline-date">{day.date}</span>
                        <div className="timeline-bar-container">
                          <div 
                            className="timeline-bar success" 
                            style={{width: `${(day.successful / day.total * 100)}%`}}
                            title={`${day.successful} exitosas`}
                          ></div>
                          <div 
                            className="timeline-bar failed" 
                            style={{width: `${(day.failed / day.total * 100)}%`}}
                            title={`${day.failed} fallidas`}
                          ></div>
                        </div>
                        <span className="timeline-count">{day.total}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">Sin datos de timeline</p>
                  )}
                </div>
              </div>
            </div>

            <div className="graficas-row">
              <div className="bloque-GraficaCuatro">
                <div className="grafica-header">
                  <h3>Top Workflows</h3>
                </div>
                <div className="workflow-list">
                  {metrics?.workflowStats && Object.keys(metrics.workflowStats).length > 0 ? (
                    Object.entries(metrics.workflowStats)
                      .sort((a, b) => b[1].totalExecutions - a[1].totalExecutions)
                      .slice(0, 5)
                      .map(([name, stats], index) => (
                        <div key={name} className="workflow-item">
                          <span className="workflow-rank">#{index + 1}</span>
                          <div className="workflow-info">
                            <strong>{name}</strong>
                            <span className="workflow-stats">
                              {stats.successfulExecutions} exitosas • {stats.failedExecutions} fallidas
                            </span>
                          </div>
                          <span className={`workflow-status ${stats.active ? 'active' : 'inactive'}`}>
                            {stats.active ? '🟢' : '🔴'}
                          </span>
                          <span className="workflow-count">{stats.totalExecutions}</span>
                        </div>
                      ))
                  ) : (
                    <p className="no-data">Sin estadísticas de workflows</p>
                  )}
                </div>
              </div>

              <div className="bloque-GraficaCinco">
                <div className="grafica-header">
                  <h3>Estadísticas Generales</h3>
                </div>
                <div className="stats-summary">
                  <div className="summary-item">
                    <div className="summary-icon">🎯</div>
                    <div className="summary-data">
                      <span className="summary-value">{metrics?.overview?.totalExecutions || 0}</span>
                      <span className="summary-label">Total Ejecuciones</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-icon">💬</div>
                    <div className="summary-data">
                      <span className="summary-value">{metrics?.whatsapp?.messagesSent || 0}</span>
                      <span className="summary-label">Mensajes Enviados</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-icon">📦</div>
                    <div className="summary-data">
                      <span className="summary-value">{metrics?.whatsapp?.ordersProcessed || 0}</span>
                      <span className="summary-label">Pedidos Completados</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-icon">⚡</div>
                    <div className="summary-data">
                      <span className="summary-value">{metrics?.performance?.totalActiveWorkflows || 0}</span>
                      <span className="summary-label">Workflows Activos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Metricas;