import express from 'express';
import https from 'https';
import http from 'http';

const router = express.Router();

// Función helper para hacer requests HTTP
const makeRequest = (url: string, options: any = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestModule = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 5000
    };

    const req = requestModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ ok: res.statusCode === 200, json: () => jsonData });
        } catch (error) {
          resolve({ ok: res.statusCode === 200, text: () => data });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
};

// Middleware para logging
router.use((req, res, next) => {
  console.log(`ESP32 Proxy: ${req.method} ${req.path}`);
  next();
});

// GET /status - Verificar estado del ESP32
router.get('/status', async (req, res) => {
  try {
    console.log('Consultando estado del ESP32...');
    const response = await makeRequest('http://192.168.100.30/status');
    
    if (response.ok) {
      const data = await response.json();
      console.log('ESP32 respondió:', data);
      res.json(data);
    } else {
      throw new Error(`ESP32 responded with error`);
    }
  } catch (error: any) {
    console.error('Error conectando con ESP32:', error.message);
    res.status(500).json({ 
      connected: false, 
      error: 'ESP32 not reachable',
      message: error.message 
    });
  }
});

// POST /start-auto - Iniciar modo automático
router.post('/start-auto', async (req, res) => {
  try {
    console.log('Enviando comando start-auto al ESP32...');
    const response = await makeRequest('http://192.168.100.30/start-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('ESP32 start-auto response:', data);
      res.json(data);
    } else {
      throw new Error(`ESP32 responded with error`);
    }
  } catch (error: any) {
    console.error('Error enviando start-auto al ESP32:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'ESP32 not reachable',
      message: error.message 
    });
  }
});

// POST /stop-auto - Detener modo automático
router.post('/stop-auto', async (req, res) => {
  try {
    console.log('Enviando comando stop-auto al ESP32...');
    const response = await makeRequest('http://192.168.100.30/stop-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('ESP32 stop-auto response:', data);
      res.json(data);
    } else {
      throw new Error(`ESP32 responded with error`);
    }
  } catch (error: any) {
    console.error('Error enviando stop-auto al ESP32:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'ESP32 not reachable',
      message: error.message 
    });
  }
});

// GET /get-result - Obtener resultados del ESP32
router.get('/get-result', async (req, res) => {
  try {
    const response = await makeRequest('http://192.168.100.30/get-result');
    
    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      throw new Error(`ESP32 responded with error`);
    }
  } catch (error: any) {
    console.error('Error obteniendo resultados del ESP32:', error.message);
    res.status(500).json({ 
      type: 'error', 
      error: 'ESP32 not reachable',
      message: error.message 
    });
  }
});

export default router;
