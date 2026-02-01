/**
 * Sends support request payload to n8n webhook
 * Uses Node's built-in fetch (Node 18+)
 * @param {Object} payload - The support request data
 * @param {Array} payload.path - Category path array
 * @param {string} payload.description - User's description
 * @param {string} payload.source - Source system (e.g., 'teams')
 * @param {string} payload.timestamp - ISO timestamp
 */
async function sendToWebhook(payload) {
  if (!process.env.WEBHOOK_URL) {
    console.log('PAYLOAD (no webhook):', payload);
    return;
  }

  try {
    const res = await fetch(process.env.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    console.log('✅ Webhook sent successfully:', JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    console.log('PAYLOAD (failed to send):', payload);
  }
}

module.exports = { sendToWebhook };
