class ConversationStateData {
  constructor() {
    this.path = [];
  }

  addStep(step) {
    this.path.push(step);
  }

  reset() {
    this.path = [];
  }
}

module.exports = ConversationStateData;
