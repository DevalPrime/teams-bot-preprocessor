const { ActivityHandler, CardFactory } = require('botbuilder');
const ConversationStateData = require('./state');
const categoriesCard = require('./cards/categories.json');
const textInputCard = require('./cards/textInput.json');
const { getNextCard } = require('./cardRouter');
const { sendToWebhook } = require('./webhookService');

class TeamsBot extends ActivityHandler {
  constructor() {
    super();
    this.state = new ConversationStateData();

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;

      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity({
            attachments: [
              CardFactory.adaptiveCard(require('./cards/categories.json'))
            ]
          });
        }
      }

      await next();
    });

    this.onMessage(async (context, next) => {
      const value = context.activity.value;

      // Button clicks (Adaptive Card submit)
      if (value && value.selection) {
        this.state.addStep(value.selection);

        // Use tree-based routing to get next card
        const nextCard = getNextCard(value.selection, this.state.path.slice(0, -1));
        
        if (nextCard) {
          // Show the next card in the hierarchy
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(nextCard)]
          });
        } else {
          // Leaf reached - ask for text input
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(textInputCard)]
          });
        }
      }

      // Text input submission
      if (value && value.description) {
        const payload = {
          path: this.state.path,
          description: value.description,
          source: 'teams',
          timestamp: new Date().toISOString()
        };

        await sendToWebhook(payload);

        await context.sendActivity('✅ Thanks — your request has been submitted successfully.\n\nOur support team will follow up shortly.');
        this.state.reset();
      }

      await next();
    });
  }
}

module.exports.TeamsBot = TeamsBot;
