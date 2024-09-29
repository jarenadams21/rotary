// src/features/functionGenerator.js

class FunctionGenerator {
    constructor() {
      this.clientFunctions = {};
    }
  
    generateFunction(clientId, functionName, functionBody) {
      this.clientFunctions[clientId] = this.clientFunctions[clientId] || {};
      this.clientFunctions[clientId][functionName] = new Function(
        'args',
        functionBody
      );
    }
  
    getFunction(clientId, functionName) {
      if (
        this.clientFunctions[clientId] &&
        this.clientFunctions[clientId][functionName]
      ) {
        return this.clientFunctions[clientId][functionName];
      }
      return null;
    }
  }
  
  module.exports = FunctionGenerator;