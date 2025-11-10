// api/health.js
// Vercel Serverless Function for health check

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

    // Test N8N connection
    const url = `${N8N_BASE_URL}/workflows?limit=1`;
    const response = await fetch(url, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('N8N connection failed');
    }

    res.status(200).json({
      success: true,
      status: 'healthy',
      n8n: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      n8n: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
