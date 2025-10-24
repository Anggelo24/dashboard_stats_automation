/**
 * N8N API Service
 * Servicio para conectar con la API de N8N y obtener métricas
 */

const N8N_URL = process.env.REACT_APP_N8N_URL || 'https://your-n8n-instance.com';
const API_KEY = process.env.REACT_APP_N8N_API_KEY || 'your-api-key-here';

const headers = {
  'X-N8N-API-KEY': API_KEY,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

/**
 * Obtener todas las ejecuciones
 * @param {number} limit - Número de ejecuciones a obtener
 * @param {string} status - 'success', 'error', 'waiting', 'running'
 */
export const getExecutions = async (limit = 100, status = null) => {
  try {
    let url = `${N8N_URL}/api/v1/executions?limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`N8N API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data; // N8N devuelve { data: [...] }
  } catch (error) {
    console.error('Error fetching executions:', error);
    throw error;
  }
};

/**
 * Obtener workflows activos
 */
export const getWorkflows = async () => {
  try {
    const response = await fetch(`${N8N_URL}/api/v1/workflows`, { headers });
    
    if (!response.ok) {
      throw new Error(`N8N API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching workflows:', error);
    throw error;
  }
};

/**
 * Obtener detalles de una ejecución específica
 */
export const getExecutionDetails = async (executionId) => {
  try {
    const response = await fetch(
      `${N8N_URL}/api/v1/executions/${executionId}`,
      { headers }
    );
    
    if (!response.ok) {
      throw new Error(`N8N API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching execution details:', error);
    throw error;
  }
};

/**
 * Calcular métricas del dashboard a partir de las ejecuciones
 */
export const calculateDashboardMetrics = async () => {
  try {
    // Obtener ejecuciones de los últimos 7 días
    const executions = await getExecutions(500);
    const workflows = await getWorkflows();
    
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filtrar ejecuciones de los últimos 7 días
    const recentExecutions = executions.filter(exec => {
      const execDate = new Date(exec.startedAt);
      return execDate >= last7Days;
    });
    
    // Contar por estado
    const successfulExecutions = recentExecutions.filter(
      exec => exec.finished === true && !exec.stoppedAt
    );
    const failedExecutions = recentExecutions.filter(
      exec => exec.stoppedAt !== null
    );
    const runningExecutions = recentExecutions.filter(
      exec => exec.finished === false && !exec.stoppedAt
    );
    
    // Encontrar workflow de WhatsApp (ajusta el nombre según tu workflow)
    const whatsappWorkflow = workflows.find(
      w => w.name.toLowerCase().includes('whatsapp') || 
           w.name.toLowerCase().includes('shopify')
    );
    
    // Contar ejecuciones del workflow de WhatsApp
    let whatsappExecutions = 0;
    let ordersProcessed = 0;
    let totalRevenue = 0;
    
    if (whatsappWorkflow) {
      const whatsappExecs = recentExecutions.filter(
        exec => exec.workflowId === whatsappWorkflow.id
      );
      whatsappExecutions = whatsappExecs.length;
      ordersProcessed = successfulExecutions.filter(
        exec => exec.workflowId === whatsappWorkflow.id
      ).length;
    }
    
    // Calcular tiempos de ejecución promedio
    const executionTimes = successfulExecutions
      .filter(exec => exec.startedAt && exec.stoppedAt)
      .map(exec => {
        const start = new Date(exec.startedAt);
        const end = new Date(exec.stoppedAt);
        return (end - start) / 1000; // en segundos
      });
    
    const avgExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
      : 0;
    
    // Construir objeto de métricas
    const metrics = {
      overview: {
        totalExecutions: recentExecutions.length,
        successfulExecutions: successfulExecutions.length,
        failedExecutions: failedExecutions.length,
        runningExecutions: runningExecutions.length,
        successRate: recentExecutions.length > 0 
          ? ((successfulExecutions.length / recentExecutions.length) * 100).toFixed(1)
          : 0
      },
      whatsapp: {
        messagesSent: whatsappExecutions,
        ordersProcessed: ordersProcessed,
        revenue: totalRevenue
      },
      performance: {
        avgExecutionTime: avgExecutionTime.toFixed(2),
        totalActiveWorkflows: workflows.filter(w => w.active).length,
        totalWorkflows: workflows.length
      },
      timeline: generateTimeline(recentExecutions),
      recentActivity: generateRecentActivity(executions.slice(0, 10)),
      workflowStats: generateWorkflowStats(workflows, recentExecutions)
    };
    
    return metrics;
  } catch (error) {
    console.error('Error calculating metrics:', error);
    throw error;
  }
};

/**
 * Generar datos de timeline para gráficos
 */
const generateTimeline = (executions) => {
  const days = {};
  
  executions.forEach(exec => {
    const date = new Date(exec.startedAt).toLocaleDateString();
    if (!days[date]) {
      days[date] = { successful: 0, failed: 0, total: 0 };
    }
    days[date].total++;
    if (exec.finished && !exec.stoppedAt) {
      days[date].successful++;
    } else if (exec.stoppedAt) {
      days[date].failed++;
    }
  });
  
  return Object.entries(days).map(([date, counts]) => ({
    date,
    ...counts
  }));
};

/**
 * Generar actividad reciente
 */
const generateRecentActivity = (executions) => {
  return executions.map(exec => ({
    id: exec.id,
    workflowName: exec.workflowData?.name || 'Unknown Workflow',
    status: exec.finished && !exec.stoppedAt ? 'success' : 
            exec.stoppedAt ? 'error' : 'running',
    startedAt: exec.startedAt,
    duration: exec.stoppedAt 
      ? ((new Date(exec.stoppedAt) - new Date(exec.startedAt)) / 1000).toFixed(1)
      : null
  }));
};

/**
 * Generar estadísticas por workflow
 */
const generateWorkflowStats = (workflows, executions) => {
  const stats = {};
  
  workflows.forEach(workflow => {
    const workflowExecs = executions.filter(
      exec => exec.workflowId === workflow.id
    );
    
    stats[workflow.name] = {
      id: workflow.id,
      active: workflow.active,
      totalExecutions: workflowExecs.length,
      successfulExecutions: workflowExecs.filter(
        exec => exec.finished && !exec.stoppedAt
      ).length,
      failedExecutions: workflowExecs.filter(
        exec => exec.stoppedAt
      ).length
    };
  });
  
  return stats;
};

/**
 * Obtener métricas específicas del workflow de WhatsApp
 * (Analiza los datos de los nodos para obtener métricas detalladas)
 */
export const getWhatsAppWorkflowMetrics = async (workflowId) => {
  try {
    const executions = await getExecutions(100);
    const workflowExecutions = executions.filter(
      exec => exec.workflowId === workflowId
    );
    
    let messagesSent = 0;
    let paymentsReceived = 0;
    let sizesConfirmed = 0;
    let addressesConfirmed = 0;
    
    // Analizar cada ejecución para obtener detalles
    for (const exec of workflowExecutions.slice(0, 50)) {
      try {
        const details = await getExecutionDetails(exec.id);
        
        // Buscar nodos específicos en el workflow
        if (details.data?.resultData?.runData) {
          const runData = details.data.resultData.runData;
          
          // Contar mensajes enviados
          if (runData['Enviar WhatsApp Inicial']) {
            messagesSent++;
          }
          
          // Contar pasos completados
          if (runData['Actualizar Nota Paso 1']) {
            paymentsReceived++;
          }
          if (runData['Actualizar Nota Paso 2']) {
            sizesConfirmed++;
          }
          if (runData['Actualizar Nota y Tags Paso 3']) {
            addressesConfirmed++;
          }
        }
      } catch (err) {
        console.warn(`Could not fetch details for execution ${exec.id}`);
      }
    }
    
    return {
      messagesSent,
      paymentsReceived,
      sizesConfirmed,
      addressesConfirmed,
      conversionRate: messagesSent > 0 
        ? ((addressesConfirmed / messagesSent) * 100).toFixed(1)
        : 0
    };
  } catch (error) {
    console.error('Error getting WhatsApp metrics:', error);
    throw error;
  }
};

export default {
  getExecutions,
  getWorkflows,
  getExecutionDetails,
  calculateDashboardMetrics,
  getWhatsAppWorkflowMetrics
};
