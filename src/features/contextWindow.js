// src/features/contextWindow.js

class ContextWindow {
    constructor() {
      this.context = {};
    }
  
    updateContext(feedback) {
      // Parse feedback and update context
      if (feedback.includes('exclude')) {
        const field = feedback.split('exclude ')[1];
        this.context.excludeFields = this.context.excludeFields || [];
        this.context.excludeFields.push(field);
      }
      // Further feedback handling
    }
  
    getContext() {
      return this.context;
    }
  }
  
  module.exports = ContextWindow;