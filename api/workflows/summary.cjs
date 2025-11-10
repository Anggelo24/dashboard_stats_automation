// api/workflows/summary.js
// Vercel Serverless Function for getting workflow summary

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
    const { active, limit = 100 } = req.query;

    const N8N_BASE_URL = process.env.N8N_BASE_URL;
    const N8N_API_KEY = process.env.N8N_API_KEY;

    if (!N8N_BASE_URL || !N8N_API_KEY) {
      throw new Error('N8N configuration missing');
    }

    const params = new URLSearchParams({
      limit: limit.toString()
    });

    if (active !== undefined) {
      params.append('active', active);
    }

    const url = `${N8N_BASE_URL}/workflows?${params}`;

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

    const workflows = await response.json();

    // Return summary with minimal data
    const summary = workflows.data.map(wf => ({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      tags: wf.tags,
      updatedAt: wf.updatedAt,
      createdAt: wf.createdAt
    }));

    res.status(200).json({
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
}
