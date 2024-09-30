// src/environment.js

class Environment {
    constructor(parent = null) {
      this.variables = {};
      this.parent = parent;
    }
  
    declareVariable(name, value) {
      this.variables[name] = value;
    }
  
    assignVariable(name, value) {
      if (name in this.variables) {
        this.variables[name] = value;
      } else if (this.parent) {
        this.parent.assignVariable(name, value);
      } else {
        throw new Error(`Variable ${name} not declared`);
      }
    }
  
    getVariable(name) {
      if (name in this.variables) {
        return this.variables[name];
      } else if (this.parent) {
        return this.parent.getVariable(name);
      } else {
        throw new Error(`Variable ${name} not declared`);
      }
    }
  }
  
  module.exports = Environment;