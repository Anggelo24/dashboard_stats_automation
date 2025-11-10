// api/metrics/workflow/[id].js
// Vercel Serverless Function for getting workflow-specific metrics

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
    const { id } = req.query;
    const { days = 7 } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Workflow ID is required' });
    }

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

    res.status(200).json({
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
}
