// api/executions/index.js
// Vercel Serverless Function for getting executions with filters

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
    const {
      workflowId,
      status,
      limit = 100,
      includeData = false
    } = req.query;

    const N8N_BASE_URL = process.env.N8N_BASE_URL;
    const N8N_API_KEY = process.env.N8N_API_KEY;

    if (!N8N_BASE_URL || !N8N_API_KEY) {
      throw new Error('N8N configuration missing');
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      includeData: includeData.toString()
    });

    if (workflowId) params.append('workflowId', workflowId);
    if (status) params.append('status', status);

    const url = `${N8N_BASE_URL}/executions?${params}`;

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

    const executions = await response.json();

    res.status(200).json({
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
}
