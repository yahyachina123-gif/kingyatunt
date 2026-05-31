console.log('=== STARTING INDEX.JS ===');

const { spawn } = require('child_process');

console.log('Spawning bot process...');

const bot = spawn('node', ['bot.js'], { stdio: 'inherit' });
const server = spawn('node', ['server.js'], { stdio: 'inherit' });

bot.on('error', (err) => console.error('Bot failed:', err));
server.on('error', (err) => console.error('Server failed:', err));

bot.on('close', (code) => console.log(`Bot exited with code ${code}`));
server.on('close', (code) => console.log(`Server exited with code ${code}`));

console.log('Processes spawned. Waiting...');