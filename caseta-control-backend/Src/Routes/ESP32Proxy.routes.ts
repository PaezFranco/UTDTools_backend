import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Middleware para logging
router.use((req, res, next) => {
  console.log(`ESP32 Proxy: ${req.method} ${req.path}`);
  next();
});

// GET /status - Verificar estado del ESP32
router.get('/status', async (req, res) => {
  try {
    console.log('Consultando estado del ESP32...');
    const response = await fetch('http://192.168.100.30/status', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('ESP32 respondió:', data);
      res.json(data);
    } else {
      throw new Error(`ESP32 responded with status: ${response.status}`);
    }
  } catch (error) {
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
    const response = await fetch('http://192.168.100.30/start-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('ESP32 start-auto response:', data);
      res.json(data);
    } else {
      throw new Error(`ESP32 responded with status: ${response.status}`);
    }
  } catch (error) {
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
    const response = await fetch('http://192.168.100.30/stop-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('ESP32 stop-auto response:', data);
      res.json(data);
    } else {
      throw new Error(`ESP32 responded with status: ${response.status}`);
    }
  } catch (error) {
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
    const response = await fetch('http://192.168.100.30/get-result', {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      throw new Error(`ESP32 responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error obteniendo resultados del ESP32:', error.message);
    res.status(500).json({ 
      type: 'error', 
      error: 'ESP32 not reachable',
      message: error.message 
    });
  }
});

export default router;
