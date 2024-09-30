// src/interpreter.js

const Environment = require('./environment');

class Interpreter {
  constructor(ast, profiler = null) {
    this.ast = ast;
    this.globalEnv = new Environment();
    this.functionUsage = {}; // Tracks function usage frequency
    this.profiler = profiler;
    this.executionPriority = null; // Dynamic execution priority
  }

  interpret() {
    this._executeBlock(this.ast.body, this.globalEnv);
  }

  _executeBlock(statements, env) {
    for (const stmt of statements) {
      this._executeStatement(stmt, env);
    }
    // Dynamically adjust priority after each block execution
    this._adjustExecutionPriority();
  }

  _executeStatement(stmt, env) {
    switch (stmt.type) {
      case 'VariableDeclaration':
        this._handleVariableDeclaration(stmt, env);
        break;
      case 'RoutineDeclaration':
        this._handleRoutineDeclaration(stmt, env);
        break;
      case 'AssignmentExpression':
        this._handleAssignment(stmt, env);
        break;
      case 'FunctionCall':
        this._evaluateExpression(stmt, env);
        break;
      case 'ReturnStatement':
        throw { type: 'Return', value: this._evaluateExpression(stmt.value, env) };
      case 'ForLoop':
        this._handleForLoop(stmt, env);
        break;
      default:
        throw new Error(`Unknown statement type: ${stmt.type}`);
    }
  }

  _handleVariableDeclaration(stmt, env) {
    const value = this._evaluateExpression(stmt.value, env);
    env.declareVariable(stmt.name, value);
    if (this.profiler) this.profiler.log(`Declared variable ${stmt.name} = ${value}`);
  }

  _handleRoutineDeclaration(stmt, env) {
    const func = {
      params: stmt.params,
      body: stmt.body,
      env: env,
    };
    env.declareVariable(stmt.name, func);
    this.functionUsage[stmt.name] = this.functionUsage[stmt.name] || 0; // Initialize usage count
    if (this.profiler) this.profiler.log(`Declared routine ${stmt.name}`);
  }

  _handleAssignment(stmt, env) {
    const value = this._evaluateExpression(stmt.value, env);
    env.assignVariable(stmt.name, value);
    if (this.profiler) this.profiler.log(`Assigned ${stmt.name} = ${value}`);
  }

  _handleForLoop(stmt, env) {
    // Create a new scope for the loop
    const loopEnv = new Environment(env);

    // Execute initializer
    this._executeStatement(stmt.initializer, loopEnv);

    while (this._evaluateExpression(stmt.condition, loopEnv)) {
      try {
        this._executeBlock(stmt.body, loopEnv);
      } catch (e) {
        if (e.type === 'Break') {
          break;
        } else if (e.type === 'Continue') {
          continue;
        } else {
          throw e;
        }
      }
      // Execute increment
      this._executeStatement(stmt.increment, loopEnv);
    }
  }

  _evaluateExpression(expr, env) {
    switch (expr.type) {
      case 'NumberLiteral':
        return expr.value;
      case 'Identifier':
        return env.getVariable(expr.name);
      case 'AssignmentExpression':
        const value = this._evaluateExpression(expr.value, env);
        env.assignVariable(expr.name, value);
        if (this.profiler) this.profiler.log(`Assigned ${expr.name} = ${value}`);
        return value;
      case 'BinaryExpression':
        return this._evaluateBinaryExpression(expr, env);
      case 'FunctionCall':
        return this._handleFunctionCall(expr, env);
      default:
        throw new Error(`Unknown expression type: ${expr.type}`);
    }
  }

  _evaluateBinaryExpression(expr, env) {
    const left = this._evaluateExpression(expr.left, env);
    const right = this._evaluateExpression(expr.right, env);
    switch (expr.operator) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '<':
        return left < right;
      case '>':
        return left > right;
      case '<=':
        return left <= right;
      case '>=':
        return left >= right;
      default:
        throw new Error(`Unknown operator: ${expr.operator}`);
    }
  }

  _handleFunctionCall(expr, env) {
    const func = env.getVariable(expr.name);

    if (!func) {
      throw new Error(`Function ${expr.name} not found`);
    }

    const args = expr.arguments.map((arg) => this._evaluateExpression(arg, env));

    // Track function usage
    this.functionUsage[expr.name] = (this.functionUsage[expr.name] || 0) + 1;

    // Create new environment for function execution
    const funcEnv = new Environment(func.env);

    // Declare parameters
    for (let i = 0; i < func.params.length; i++) {
      funcEnv.declareVariable(func.params[i], args[i]);
    }

    try {
      this._executeBlock(func.body, funcEnv);
    } catch (e) {
      if (e.type === 'Return') {
        return e.value;
      } else {
        throw e;
      }
    }

    return undefined; // If no return statement, return undefined
  }

  _adjustExecutionPriority() {
    // Simple example: set the execution priority to the function with the highest usage
    let maxUsage = 0;
    let maxFunction = null;
    for (const func in this.functionUsage) {
      if (this.functionUsage[func] > maxUsage) {
        maxUsage = this.functionUsage[func];
        maxFunction = func;
      }
    }
    this.executionPriority = maxFunction;
    if (this.profiler) this.profiler.log(`Adjusted execution priority to ${maxFunction}`);
  }

  getFunctionUsage() {
    return this.functionUsage;
  }

  getExecutionPriority() {
    return this.executionPriority;
  }
}

module.exports = Interpreter;