module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    if (req.method === 'POST') {
      res.status(200).json({
        success: true,
        message: req.body,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(200).json({
        status: 'ok',
        message: 'Chat API is running'
      });
    }
  };
  