# Tech Support Bot - Teams Channel Preprocessor

A Microsoft Teams bot that captures structured support requests through nested Adaptive Card menus, then forwards them to an external n8n webhook for LLM processing.

## 🎯 What It Does

Users submit support tickets through an interactive Teams bot flow:

1. **Category Selection** → 8 top-level categories
2. **Nested Drilldown** → Specific subcategories (up to 3 levels deep)
3. **Text Input** → Detailed problem description
4. **Webhook POST** → Full path + description sent to n8n

Example payload sent to webhook:
```json
{
  "path": ["Salesforce", "Access / Login", "Cannot login"],
  "description": "I can't reset my password",
  "source": "teams",
  "timestamp": "2026-02-01T12:34:56.789Z"
}
```

## 🏗️ Technology Stack

- **Microsoft Bot Framework SDK** - Teams-native integration
- **Adaptive Cards** - Interactive UI in Teams
- **Node.js 22 LTS** - Backend runtime
- **Restify** - Lightweight server
- **n8n Webhook** - External request handling

## 📋 Supported Categories

- ✅ Salesforce (7 subcategories)
- ✅ Hardware (with nested laptop/desktop)
- ✅ Network / Internet
- ✅ Onboarding & Email
- ✅ Office Software
- ✅ Telephone (with nested installation/connection)
- ✅ Security
- ✅ Other

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (tested on Node 22 LTS)
- npm

### Installation

```bash
git clone <repo-url>
cd teams-bot-preprocessor
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your values:
```env
MICROSOFT_APP_ID=your-app-id-here
MICROSOFT_APP_PASSWORD=your-app-password-here
WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-endpoint
```

### Running the Bot

```bash
node index.js
```

Output:
```
[dotenv] injecting env from .env
Bot listening on http://localhost:3978
Webhook URL: https://your-n8n-instance.com/webhook/your-endpoint
```

The bot will now:
- Listen for Teams messages on `POST /api/messages`
- Show the category card when added to a channel
- Track user selections through the tree
- POST to your webhook when complete

## 📁 Project Structure

```
teams-bot-preprocessor/
│
├─ index.js                  # Server entry point
├─ bot.js                    # Bot logic & message handling
├─ state.js                  # Conversation state tracker
├─ treeConfig.js            # Category tree definition
├─ cardRouter.js            # Dynamic card routing
├─ webhookService.js        # Webhook POST handler
│
├─ cards/
│   ├─ categories.json      # Main menu (8 categories)
│   ├─ salesforce.json      # Salesforce subcategories
│   ├─ hardware.json        # Hardware menu
│   ├─ hardware-laptop.json # Laptop/Desktop submenu
│   ├─ onboarding.json      # Onboarding & Email
│   ├─ office-software.json # Office Software
│   ├─ telephone.json       # Telephone menu
│   ├─ telephone-installation.json # Installation platforms
│   ├─ telephone-connection.json   # Connection types
│   ├─ textInput.json       # Final text input card
│   └─ salesforce-access.json # Example nested card
│
├─ .env                     # Environment variables (git-ignored)
├─ .env.example             # Template for .env
├─ .gitignore              # Git exclusions
├─ package.json            # Dependencies & metadata
└─ README.md               # This file
```

## 🔧 How to Add New Categories

### 1. Update `treeConfig.js`

Add your category to the `TREE` object:

```javascript
'My New Category': {
  cardFile: 'my-new-category',  // Optional: if has subcategories
  children: {
    'Subcategory 1': 'leaf',
    'Subcategory 2': 'leaf'
  }
}
```

Or, for a simple leaf category:
```javascript
'Simple Category': 'leaf'
```

### 2. Create Adaptive Card (if needed)

Create `cards/my-new-category.json`:

```json
{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    {
      "type": "TextBlock",
      "text": "My New Category - Select option",
      "weight": "Bolder"
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Option 1",
      "data": { "selection": "Option 1", "isLeaf": true }
    }
  ]
}
```

### 3. Update main categories card

If adding a top-level category, add button to `cards/categories.json`:

```json
{
  "type": "Action.Submit",
  "title": "My New Category",
  "data": { "selection": "My New Category", "nextCard": "my-new-category" }
}
```

### 4. Restart bot
```bash
node index.js
```

## 🔌 Webhook Format

Your n8n webhook will receive POST requests with this payload:

```json
{
  "path": ["Category", "Subcategory", "Specific Issue"],
  "description": "User's detailed problem description",
  "source": "teams",
  "timestamp": "2026-02-01T12:34:56.789Z"
}
```

### Error Handling

- **If webhook not configured**: Bot logs payload to console, continues normally
- **If webhook fails**: Error logged, user still sees success message (prevents duplicate submissions)
- **If card not found**: User sees error message, can retry

## 🛡️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MICROSOFT_APP_ID` | No | Teams bot app ID (empty for local testing) |
| `MICROSOFT_APP_PASSWORD` | No | Teams bot password (empty for local testing) |
| `WEBHOOK_URL` | Yes* | n8n webhook endpoint URL |

*Required for production; optional for local development

## 📊 State Management

The `ConversationStateData` class tracks:
- User's selection path through the category tree
- Example: `["Salesforce", "Access / Login", "Cannot login"]`
- Resets after submission

**Note**: Currently in-memory only. For production with multiple users, implement persistent conversation state using Azure Cosmos DB or similar.

## 🚦 Testing

### Local Testing (without Teams)

Bot listens on `http://localhost:3978/api/messages`

To test with curl:
```bash
curl -X POST http://localhost:3978/api/messages \
  -H "Content-Type: application/json" \
  -d '{"activity": {"type": "message", "text": "test"}}'
```

### Teams Deployment

1. Create Azure Bot resource
2. Set App ID and Password from Azure
3. Configure Teams channel
4. Deploy code to Azure App Service

## 🔄 Message Flow

```
User joins channel
    ↓
Bot sends categories card (onMembersAdded)
    ↓
User clicks button
    ↓
Bot stores selection in state
    ↓
Get next card from tree / Show text input
    ↓
User enters description
    ↓
POST to webhook with full path + description
    ↓
Show completion message
    ↓
Reset state
```

## 📝 Logging

The bot logs to console:

```
✅ Webhook sent successfully: {"path": [...], ...}
❌ Webhook error: HTTP 500
PAYLOAD (no webhook): {"path": [...], ...}
```

For production, consider integrating with:
- Azure Application Insights
- Winston
- Bunyan

## 🤝 Contributing

1. Update `treeConfig.js` for new categories
2. Create corresponding Adaptive Card JSON files
3. Test flow end-to-end
4. Commit with clear messages

## 📄 License

[Your License Here]

## 📞 Support

For issues or questions:
- Check `.env` configuration
- Verify webhook URL is accessible
- Review bot logs
- Test Adaptive Cards in Teams card playground: https://adaptivecards.io/designer/

---

**Created**: February 2026
**Framework**: Microsoft Bot Framework SDK
**Node Version**: 22 LTS
