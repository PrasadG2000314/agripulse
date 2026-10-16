const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware (DevSecOps Hardening)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Native CORS middleware (no extra dependencies required)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json());

// Rate Limiter to mitigate DDoS and brute-force attempts
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Simulated Real-Time IoT Farming Data Store
let farmData = {
  soilMoisture: 68.5,       // %
  soilTemp: 26.8,           // °C
  soilPH: 6.4,              // pH scale
  ambientHumidity: 74.0,    // %
  sunlightLux: 48500,       // lux
  waterTankLevel: 82.0,     // %
  npk: {
    nitrogen: 145,          // mg/kg
    phosphorus: 48,         // mg/kg
    potassium: 195,         // mg/kg
  },
  irrigationPump: {
    status: 'AUTO_RUNNING', // ON | OFF | AUTO_RUNNING
    lastActivated: new Date().toISOString(),
  },
  activeCrop: 'Paddy / වී වගාව',
  healthStatus: 'OPTIMAL',
};

// Periodic IoT simulation jitter for live telemetry
setInterval(() => {
  farmData.soilMoisture = +(60 + Math.random() * 15).toFixed(1);
  farmData.soilTemp = +(25 + Math.random() * 4).toFixed(1);
  farmData.ambientHumidity = +(70 + Math.random() * 10).toFixed(1);
  farmData.soilPH = +(6.2 + Math.random() * 0.5).toFixed(2);
  farmData.waterTankLevel = Math.max(20, +(farmData.waterTankLevel - (farmData.irrigationPump.status.includes('RUNNING') ? 0.2 : 0)).toFixed(1));
}, 5000);

// Kubernetes Health Probes (DevSecOps & Cloud-Native Reliability)
// Liveness Probe: Verifies container is running
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'AgriPulse Smart Farming',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness Probe: Verifies application is ready to accept traffic
app.get('/ready', (req, res) => {
  res.status(200).json({
    ready: true,
    sensorNetwork: 'CONNECTED',
    irrigationController: 'ONLINE',
    kubernetesPod: process.env.HOSTNAME || 'local-instance',
  });
});

// API Routes for Farm Management
app.get('/api/sensors', (req, res) => {
  res.json({
    success: true,
    data: farmData,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/irrigation/toggle', (req, res) => {
  const { mode } = req.body;
  if (!['ON', 'OFF', 'AUTO'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode. Use ON, OFF, or AUTO.' });
  }

  farmData.irrigationPump.status = mode === 'AUTO' ? 'AUTO_RUNNING' : mode;
  farmData.irrigationPump.lastActivated = new Date().toISOString();

  res.json({
    success: true,
    message: `Water pump set to ${farmData.irrigationPump.status}`,
    pump: farmData.irrigationPump,
  });
});

app.post('/api/crop-advisor', (req, res) => {
  const { crop, soilPH, moisture } = req.body;
  let recommendation = {
    advisorySinhala: 'පසෙහි තත්ත්වය බෝග වර්ධනයට ඉතා යෝග්‍ය වේ. කාබනික පොහොර යෙදීම අඛණ්ඩව කරගෙන යන්න.',
    advisoryEnglish: 'Soil condition is optimal for healthy crop growth. Continue balanced organic fertilization.',
    status: 'Good',
    actionRequired: false,
  };

  const ph = parseFloat(soilPH) || farmData.soilPH;
  const moist = parseFloat(moisture) || farmData.soilMoisture;

  if (ph < 5.8) {
    recommendation.advisorySinhala = 'පසෙහි ආම්ලිකතාවය වැඩියි (pH අඩුයි). කෘෂිකාර්මික හුණු (Dolomite) යොදන්න.';
    recommendation.advisoryEnglish = 'Soil is slightly acidic. Apply agricultural dolomite to restore pH balance.';
    recommendation.status = 'Warning';
    recommendation.actionRequired = true;
  } else if (moist < 45) {
    recommendation.advisorySinhala = 'පස් තෙතමනය අඩුයි! ස්වයංක්‍රීය බිංදු ජල සම්පාදනය (Drip Irrigation) සක්‍රිය කරන්න.';
    recommendation.advisoryEnglish = 'Soil moisture is low! Immediate irrigation or activating drip system is recommended.';
    recommendation.status = 'Critical';
    recommendation.actionRequired = true;
  }

  res.json({ success: true, crop: crop || farmData.activeCrop, ...recommendation });
});

// Farmer Dashboard UI (Interactive Single-Page Application)
app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPulse | Smart Farming Web Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Noto+Sans+Sinhala:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #10b981;
      --primary-dark: #047857;
      --primary-light: #d1fae5;
      --bg: #09130e;
      --surface: #112219;
      --surface-border: #1b3829;
      --text: #f0fdf4;
      --text-muted: #86efac;
      --accent-amber: #f59e0b;
      --accent-blue: #0ea5e9;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', 'Noto Sans Sinhala', sans-serif;
      background: radial-gradient(circle at 15% 15%, #0d281a 0%, var(--bg) 100%);
      color: var(--text);
      min-height: 100vh;
      padding: 1.5rem;
    }

    .container { max-width: 1200px; margin: 0 auto; }
    
    /* Top Bar */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--surface-border);
      margin-bottom: 2rem;
    }

    .logo-area { display: flex; align-items: center; gap: 0.8rem; }
    .logo-icon {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
    }
    .logo-text h1 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.5px; }
    .logo-text p { font-size: 0.85rem; color: var(--text-muted); }

    .header-badges { display: flex; gap: 0.75rem; align-items: center; }
    .k8s-badge {
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.4);
      color: #38bdf8;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 600;
      display: flex; align-items: center; gap: 0.4rem;
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    /* Grid Layout */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      padding: 1.3rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .card:hover {
      transform: translateY(-3px);
      border-color: #2e6247;
    }
    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 0.75rem;
      color: #a7f3d0;
      font-size: 0.88rem;
      font-weight: 600;
    }
    .card-icon { font-size: 1.4rem; }
    .card-value {
      font-size: 2.2rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.2;
    }
    .card-unit { font-size: 1rem; color: #a7f3d0; font-weight: 400; margin-left: 0.2rem; }
    .card-footer {
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: #6ee7b7;
      display: flex; justify-content: space-between;
    }

    /* Controls & Advisor Section */
    .section-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media(max-width: 860px) {
      .section-row { grid-template-columns: 1fr; }
    }

    .panel {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      padding: 1.5rem;
    }
    .panel h2 {
      font-size: 1.2rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;
      color: #f0fdf4;
    }

    /* Pump Control Buttons */
    .pump-controls { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .btn {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .btn-auto { background: #065f46; color: #a7f3d0; border: 1px solid #10b981; }
    .btn-auto:hover { background: #047857; }
    .btn-on { background: #10b981; color: #022c22; }
    .btn-on:hover { background: #34d399; }
    .btn-off { background: #374151; color: #e5e7eb; }
    .btn-off:hover { background: #4b5563; }

    /* Advisory Box */
    .advisory-box {
      background: rgba(16, 185, 129, 0.08);
      border-left: 4px solid var(--primary);
      padding: 1rem;
      border-radius: 0 10px 10px 0;
      margin-top: 1rem;
    }
    .advisory-box p { font-size: 0.92rem; line-height: 1.5; color: #e2e8f0; }

    /* Footer */
    footer {
      margin-top: 3rem;
      text-align: center;
      font-size: 0.8rem;
      color: #64748b;
      border-top: 1px solid var(--surface-border);
      padding-top: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-area">
        <div class="logo-icon">🌱</div>
        <div class="logo-text">
          <h1>AgriPulse | ස්මාර්ට් කෘෂිකර්ම කළමනාකරණය</h1>
          <p>IoT Precision Farming & Cloud-Native DevSecOps Kubernetes Platform</p>
        </div>
      </div>
      <div class="header-badges">
        <div class="k8s-badge"><span class="pulse-dot"></span> K8s Pod: <strong><span id="podName">Loading...</span></strong></div>
        <div class="k8s-badge" style="color: #4ade80; border-color: rgba(74, 222, 128, 0.4);">🛡️ DevSecOps Verified</div>
      </div>
    </header>

    <!-- Top IoT Gauges -->
    <div class="dashboard-grid">
      <!-- Moisture -->
      <div class="card">
        <div class="card-header">
          <span>පස් තෙතමනය (Soil Moisture)</span>
          <span class="card-icon">💧</span>
        </div>
        <div class="card-value"><span id="valMoist">68.5</span><span class="card-unit">%</span></div>
        <div class="card-footer">
          <span>තත්ත්වය: ප්‍රශස්තයි (Optimal)</span>
          <span>ඉලක්කය: 60-75%</span>
        </div>
      </div>

      <!-- Soil Temp -->
      <div class="card">
        <div class="card-header">
          <span>පස් උෂ්ණත්වය (Soil Temp)</span>
          <span class="card-icon">🌡️</span>
        </div>
        <div class="card-value"><span id="valTemp">26.8</span><span class="card-unit">°C</span></div>
        <div class="card-footer">
          <span>ප්‍රශස්ත පරාසය: 24-28°C</span>
          <span>ස්ථායී</span>
        </div>
      </div>

      <!-- Soil pH -->
      <div class="card">
        <div class="card-header">
          <span>පස් pH අගය (Soil pH Level)</span>
          <span class="card-icon">🧪</span>
        </div>
        <div class="card-value"><span id="valPH">6.4</span><span class="card-unit">pH</span></div>
        <div class="card-footer">
          <span>මධ්‍යස්ථ (Slightly Acidic)</span>
          <span>වී සහ එළවළු සඳහා විශිෂ්ටයි</span>
        </div>
      </div>

      <!-- Water Reservoir -->
      <div class="card">
        <div class="card-header">
          <span>ජල ටැංකිය (Water Reservoir)</span>
          <span class="card-icon">🚰</span>
        </div>
        <div class="card-value"><span id="valWater">82</span><span class="card-unit">%</span></div>
        <div class="card-footer">
          <span>ප්‍රමාණවත් ජල සැපයුම</span>
          <span>පොම්පය: <strong id="pumpStatus" style="color: #34d399">AUTO</strong></span>
        </div>
      </div>
    </div>

    <!-- Controls and Advisory -->
    <div class="section-row">
      <!-- Pump Controller -->
      <div class="panel">
        <h2>⚡ ස්වයංක්‍රීය ජල සම්පාදනය (Irrigation Pump Controller)</h2>
        <p style="color: #94a3b8; font-size: 0.9rem;">
          ස්වයංක්‍රීයව පසෙහි තෙතමනය නිරීක්ෂණය කර ජලය සපයන ස්මාර්ට් පද්ධතිය. ගොවියාට අවශ්‍ය නම් මෙතැනින් පාලනය කළ හැක.
        </p>
        <div class="pump-controls">
          <button class="btn btn-auto" onclick="setPumpMode('AUTO')">🔄 ස්වයංක්‍රීය (Auto)</button>
          <button class="btn btn-on" onclick="setPumpMode('ON')">▶️ සක්‍රිය (Turn ON)</button>
          <button class="btn btn-off" onclick="setPumpMode('OFF')">⏹️ අක්‍රිය (Turn OFF)</button>
        </div>
        <div style="margin-top: 1.25rem; font-size: 0.85rem; color: #a7f3d0;">
          වත්මන් ක්‍රියාකාරීත්වය: <strong id="currentPumpState" style="color: #38bdf8;">AUTO RUNNING</strong>
        </div>
      </div>

      <!-- AI Crop Advisor -->
      <div class="panel">
        <h2>🌾 කෘෂි AI උපදේශක (Smart Crop Advisory)</h2>
        <div class="advisory-box" id="advisorContent">
          <p id="advSi" style="font-weight: 600; margin-bottom: 0.4rem; color: #34d399;">
            පසෙහි තත්ත්වය බෝග වර්ධනයට ඉතා යෝග්‍ය වේ. කාබනික පොහොර යෙදීම අඛණ්ඩව කරගෙන යන්න.
          </p>
          <p id="advEn" style="font-size: 0.85rem; color: #94a3b8;">
            Soil condition is optimal for healthy crop growth. Continue balanced organic fertilization.
          </p>
        </div>
        <div style="margin-top: 1rem; font-size: 0.82rem; color: #64748b;">
          NPK අනුපාතය: නයිට්‍රජන් (N): <strong>145 mg/kg</strong> | පොස්පරස් (P): <strong>48 mg/kg</strong> | පොටෑසියම් (K): <strong>195 mg/kg</strong>
        </div>
      </div>
    </div>

    <footer>
      AgriPulse DevSecOps Project &copy; 2026 | Built for Sri Lankan Farmers & Precision Agriculture | Multi-Stage Non-Root Docker &amp; Kubernetes
    </footer>
  </div>

  <script>
    async function fetchTelemetry() {
      try {
        const res = await fetch('/api/sensors');
        const json = await res.json();
        if (json.success) {
          const d = json.data;
          document.getElementById('valMoist').textContent = d.soilMoisture;
          document.getElementById('valTemp').textContent = d.soilTemp;
          document.getElementById('valPH').textContent = d.soilPH;
          document.getElementById('valWater').textContent = d.waterTankLevel;
          document.getElementById('pumpStatus').textContent = d.irrigationPump.status;
          document.getElementById('currentPumpState').textContent = d.irrigationPump.status;
        }
      } catch (e) {
        console.error('Failed to sync telemetry', e);
      }
    }

    async function fetchHealth() {
      try {
        const res = await fetch('/ready');
        const json = await res.json();
        if (json.kubernetesPod) {
          document.getElementById('podName').textContent = json.kubernetesPod;
        }
      } catch(e) {
        document.getElementById('podName').textContent = 'agripulse-pod-live';
      }
    }

    async function setPumpMode(mode) {
      try {
        const res = await fetch('/api/irrigation/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode })
        });
        const json = await res.json();
        if (json.success) {
          fetchTelemetry();
        }
      } catch (e) {
        alert('Failed to update pump controller: ' + e);
      }
    }

    fetchHealth();
    fetchTelemetry();
    setInterval(fetchTelemetry, 3000);
  </script>
</body>
</html>`;

  res.send(html);
});

// Start Express Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[AgriPulse] Smart Farming Web App running on port ${PORT}`);
});

// Graceful Shutdown handling for Kubernetes Container Lifecycle
process.on('SIGTERM', () => {
  console.log('[AgriPulse] SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('[AgriPulse] HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[AgriPulse] SIGINT signal received: exiting process');
  server.close(() => {
    process.exit(0);
  });
});
