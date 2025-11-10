// api/metrics/dashboard.js
// Vercel Serverless Function for getting dashboard metrics

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const N8N_BASE_URL = process.env.N8N_BASE_URL;
    const N8N_API_KEY = process.env.N8N_API_KEY;

    if (!N8N_BASE_URL || !N8N_API_KEY) {
      throw new Error('N8N configuration missing');
    }

    // Helper function to make N8N API calls
    async function n8nRequest(endpoint) {
      const url = `${N8N_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`N8N API Error: ${response.status} - ${error}`);
      }

      return response.json();
    }

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
      const isSuccess = e.status === 'success';
      const isFinished = e.finished && e.stoppedAt;
      return (isSuccess || isFinished) && e.startedAt && e.stoppedAt;
    });

    let avgExecutionTime = "n/a";
    if (completedExecutions.length > 0) {
      const totalTime = completedExecutions.reduce((acc, exec) => {
        const start = new Date(exec.startedAt).getTime();
        const end = new Date(exec.stoppedAt).getTime();
        const duration = (end - start) / 1000;
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

    res.status(200).json({
      success: true,
      data: {
        workflows: {
          total: totalWorkflows,
          active: activeWorkflows,
          paused: pausedWorkflows,
          withErrors: 0
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
}
