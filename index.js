require('dotenv').config();
const restify = require('restify');
const { BotFrameworkAdapter } = require('botbuilder');
const { TeamsBot } = require('./bot');

// Create server
const server = restify.createServer();
server.listen(3978, () => {
  console.log(`Bot listening on http://localhost:3978`);
  console.log(`Webhook URL: ${process.env.WEBHOOK_URL || 'Not configured'}`);
});

// Adapter (credentials will come later)
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID || '',
  appPassword: process.env.MICROSOFT_APP_PASSWORD || ''
});

// Error handler
adapter.onTurnError = async (context, error) => {
  console.error(error);
  await context.sendActivity('Oops. Something went wrong.');
};

// Create bot
const bot = new TeamsBot();

// Endpoint
server.post('/api/messages', async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
});
