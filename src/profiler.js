// src/profiler.js

class Profiler {
    constructor() {
      this.logs = [];
      this.maxLogs = 1000;
    }
  
    log(operation, details) {
      if (this.logs.length >= this.maxLogs) {
        this.logs.shift(); // Remove oldest log
      }
      this.logs.push({ timestamp: new Date(), operation, details });
    }
  
    getLogs() {
      return this.logs;
    }
  }
  
  module.exports = Profiler;