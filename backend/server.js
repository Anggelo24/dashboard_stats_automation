// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// N8N Configuration
const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

// Email Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to make N8N API calls
async function n8nRequest(endpoint, options = {}) {
  const url = `${N8N_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`N8N API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ==================== WORKFLOWS ENDPOINTS ====================

// Get all workflows summary
app.get('/api/workflows/summary', async (req, res) => {
  try {
    const { active, limit = 100 } = req.query;
    
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    if (active !== undefined) {
      params.append('active', active);
    }

    const workflows = await n8nRequest(`/workflows?${params}`);
    
    // Return summary with minimal data
    const summary = workflows.data.map(wf => ({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      tags: wf.tags,
      updatedAt: wf.updatedAt,
      createdAt: wf.createdAt
    }));

    res.json({
      success: true,
      data: summary,
      total: summary.length
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific workflow details
app.get('/api/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await n8nRequest(`/workflows/${id}`);

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Activate workflow
app.patch('/api/workflows/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await n8nRequest(`/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: true })
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error activating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Deactivate workflow
app.patch('/api/workflows/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await n8nRequest(`/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: false })
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error deactivating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== EXECUTIONS ENDPOINTS ====================

// Get executions with filters
app.get('/api/executions', async (req, res) => {
  try {
    const { 
      workflowId, 
      status, 
      limit = 100,
      includeData = false 
    } = req.query;
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      includeData: includeData.toString()
    });
    
    if (workflowId) params.append('workflowId', workflowId);
    if (status) params.append('status', status);

    const executions = await n8nRequest(`/executions?${params}`);

    res.json({
      success: true,
      data: executions.data,
      total: executions.data.length
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get execution by ID
app.get('/api/executions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { includeData = true } = req.query;
    
    const execution = await n8nRequest(`/executions/${id}?includeData=${includeData}`);

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    console.error('Error fetching execution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== METRICS ENDPOINTS ====================

// Get dashboard metrics
app.get('/api/metrics/dashboard', async (req, res) => {
  try {
    // Get workflows summary (N8N max limit is 250)
    const workflowsData = await n8nRequest('/workflows?limit=250');
    const workflows = workflowsData.data;

    // Get recent executions (last 7 days, N8N max limit is 250)
    const executions = await n8nRequest('/executions?limit=250&includeData=false');
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentExecutions = executions.data.filter(exec => {
      const execDate = new Date(exec.startedAt);
      return execDate >= sevenDaysAgo;
    });

    // Calculate metrics
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.active).length;
    const pausedWorkflows = workflows.filter(w => !w.active).length;

    // Determine execution status correctly
    const successfulExecutions = recentExecutions.filter(e => {
      if (e.status === 'success') return true;
      if (e.status === 'error') return false;
      return e.finished && e.stoppedAt && !e.waitTill;
    }).length;

    const failedExecutions = recentExecutions.filter(e => {
      if (e.status === 'error') return true;
      return false;
    }).length;

    const runningExecutions = recentExecutions.filter(e => {
      if (e.status === 'running' || e.status === 'waiting') return true;
      return !e.finished;
    }).length;

    const totalExecutions = recentExecutions.length;
    const successRate = totalExecutions > 0
      ? ((successfulExecutions / totalExecutions) * 100).toFixed(1)
      : 0;

    // Calculate average execution time (in seconds)
    const completedExecutions = recentExecutions.filter(e => {
      // Include executions that are explicitly successful OR finished with both timestamps
      const isSuccess = e.status === 'success';
      const isFinished = e.finished && e.stoppedAt;
      return (isSuccess || isFinished) && e.startedAt && e.stoppedAt;
    });

    let avgExecutionTime = "n/a";
    if (completedExecutions.length > 0) {
      const totalTime = completedExecutions.reduce((acc, exec) => {
        const start = new Date(exec.startedAt).getTime();
        const end = new Date(exec.stoppedAt).getTime();
        const duration = (end - start) / 1000; // convert to seconds
        return acc + duration;
      }, 0);
      avgExecutionTime = (totalTime / completedExecutions.length).toFixed(2);
    }

    // Get executions by day for the last 7 days
    const executionsByDay = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      executionsByDay[dateKey] = {
        success: 0,
        failed: 0,
        total: 0
      };
    }

    recentExecutions.forEach(exec => {
      const dateKey = new Date(exec.startedAt).toISOString().split('T')[0];
      if (executionsByDay[dateKey]) {
        executionsByDay[dateKey].total++;
        if (exec.status === 'success' || (exec.finished && exec.stoppedAt && !exec.waitTill)) {
          executionsByDay[dateKey].success++;
        } else if (exec.status === 'error') {
          executionsByDay[dateKey].failed++;
        }
      }
    });

    // Top workflows by execution count
    const workflowExecutionCounts = {};
    recentExecutions.forEach(exec => {
      if (exec.workflowId) {
        workflowExecutionCounts[exec.workflowId] = 
          (workflowExecutionCounts[exec.workflowId] || 0) + 1;
      }
    });

    const topWorkflows = Object.entries(workflowExecutionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([workflowId, count]) => {
        const workflow = workflows.find(w => w.id === workflowId);
        return {
          id: workflowId,
          name: workflow?.name || 'Unknown',
          count,
          active: workflow?.active || false
        };
      });

    res.json({
      success: true,
      data: {
        workflows: {
          total: totalWorkflows,
          active: activeWorkflows,
          paused: pausedWorkflows,
          withErrors: 0 // N8N doesn't track this directly
        },
        executions: {
          total: totalExecutions,
          successful: successfulExecutions,
          failed: failedExecutions,
          running: runningExecutions,
          successRate: parseFloat(successRate),
          avgExecutionTime: avgExecutionTime
        },
        timeline: executionsByDay,
        topWorkflows,
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get workflow-specific metrics
app.get('/api/metrics/workflow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 7 } = req.query;

    // Get workflow details
    const workflow = await n8nRequest(`/workflows/${id}`);
    
    // Get workflow executions (N8N max limit is 250)
    const executions = await n8nRequest(
      `/executions?workflowId=${id}&limit=250&includeData=false`
    );

    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(days) * 24 * 60 * 60 * 1000);
    
    const recentExecutions = executions.data.filter(exec => {
      const execDate = new Date(exec.startedAt);
      return execDate >= daysAgo;
    });

    // Determine execution status correctly using N8N status field
    const successfulExecutions = recentExecutions.filter(e => {
      if (e.status === 'success') return true;
      if (e.status === 'error') return false;
      return e.finished && e.stoppedAt && !e.waitTill;
    }).length;

    const failedExecutions = recentExecutions.filter(e => {
      if (e.status === 'error') return true;
      return false;
    }).length;

    const successRate = recentExecutions.length > 0
      ? ((successfulExecutions / recentExecutions.length) * 100).toFixed(1)
      : 0;

    // Get latest execution
    const latestExecution = recentExecutions.length > 0
      ? recentExecutions.sort((a, b) =>
          new Date(b.startedAt) - new Date(a.startedAt)
        )[0]
      : null;

    // Determine last execution status
    let lastStatus = 'success';
    if (latestExecution) {
      if (latestExecution.status) {
        lastStatus = latestExecution.status;
      } else if (!latestExecution.finished) {
        lastStatus = latestExecution.waitTill ? 'waiting' : 'running';
      } else if (latestExecution.finished) {
        lastStatus = 'success';
      }
    }

    res.json({
      success: true,
      data: {
        workflow: {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
          tags: workflow.tags
        },
        metrics: {
          totalExecutions: recentExecutions.length,
          successful: successfulExecutions,
          failed: failedExecutions,
          successRate: parseFloat(successRate),
          lastExecution: latestExecution?.startedAt || null,
          lastStatus: lastStatus
        },
        recentExecutions: recentExecutions.slice(0, 10).map(exec => ({
          id: exec.id,
          startedAt: exec.startedAt,
          stoppedAt: exec.stoppedAt,
          finished: exec.finished,
          status: exec.status || (exec.finished ? 'success' : (exec.waitTill ? 'waiting' : 'running'))
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching workflow metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== SUPPORT TICKET ENDPOINT ====================

app.post('/api/support/ticket', async (req, res) => {
  try {
    const { nombre, email, asunto, prioridad, categoria, mensaje } = req.body;

    // Validate required fields
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'Soporte@tuinity.lat',
      subject: `[${categoria.toUpperCase()}] [${prioridad.toUpperCase()}] ${asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
            Nuevo Ticket de Soporte
          </h2>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Nombre:</strong> ${nombre}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Categoría:</strong> ${categoria}</p>
            <p style="margin: 5px 0;"><strong>Prioridad:</strong> ${prioridad}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Asunto:</h3>
            <p style="color: #666;">${asunto}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Descripción:</h3>
            <p style="color: #666; white-space: pre-line;">${mensaje}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <p style="color: #999; font-size: 12px; text-align: center;">
            Este ticket fue enviado desde el Dashboard de Tuinity
          </p>
        </div>
      `,
      text: `
Nuevo Ticket de Soporte

Nombre: ${nombre}
Email: ${email}
Categoría: ${categoria}
Prioridad: ${prioridad}

Asunto: ${asunto}

Descripción:
${mensaje}

---
Este ticket fue enviado desde el Dashboard de Tuinity
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Ticket enviado exitosamente'
    });
  } catch (error) {
    console.error('Error sending support ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar el ticket. Por favor intente nuevamente.'
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', async (req, res) => {
  try {
    // Test N8N connection
    await n8nRequest('/workflows?limit=1');
    
    res.json({
      success: true,
      status: 'healthy',
      n8n: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      n8n: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 N8N Base URL: ${N8N_BASE_URL}`);
  console.log(`🔒 API Key configured: ${N8N_API_KEY ? 'Yes' : 'No'}`);
});