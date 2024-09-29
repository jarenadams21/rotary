// src/interpreter.js

  // Generic Environments // 
class Environment {
    constructor(parent = null) {
      this.parent = parent;
      this.variables = {};
    }
  
    declareVariable(name, value) {
      if (this.variables.hasOwnProperty(name)) {
        throw new Error(`Variable ${name} is already declared`);
      }
      this.variables[name] = value;
    }
  
    assignVariable(name, value) {
      if (this.variables.hasOwnProperty(name)) {
        this.variables[name] = value;
      } else if (this.parent) {
        this.parent.assignVariable(name, value);
      } else {
        throw new Error(`Variable ${name} is not declared`);
      }
    }
  
    getVariable(name) {
      if (this.variables.hasOwnProperty(name)) {
        return this.variables[name];
      } else if (this.parent) {
        return this.parent.getVariable(name);
      } else {
        throw new Error(`Variable ${name} is not declared`);
      }
    }
  }

  // INTERPRETER //

const Profiler = require('./profiler');
const profiler = new Profiler();
  
  class Interpreter {
    constructor(ast) {
      this.ast = ast;
      this.globalEnv = new Environment();
      this.functions = {};
      this.profiler = profiler;
    }  
  
    interpret() {
      return this._executeBlock(this.ast.body, this.globalEnv);
    }
  
    _executeBlock(statements, env) {
      let result;
      for (const stmt of statements) {
        result = this._executeStatement(stmt, env);
        if (stmt.type === 'ReturnStatement') {
          return result;
        }
      }
      return result;
    }
  
    _executeStatement(stmt, env) {
      switch (stmt.type) {
        case 'VariableDeclaration':
          const value = this._evaluateExpression(stmt.value, env);
          env.declareVariable(stmt.name, value);
          break;
        case 'FunctionDeclaration':
          this.functions[stmt.name] = {
            params: stmt.params,
            body: stmt.body,
          };
          break;
        case 'ExpressionStatement':
          return this._evaluateExpression(stmt.expression, env);
        case 'ReturnStatement':
          return this._evaluateExpression(stmt.argument, env);
        case 'PrintStatement':
          const arg = this._evaluateExpression(stmt.argument, env);
          console.log(arg);
          break;
        case 'IfStatement':
          const test = this._evaluateExpression(stmt.test, env);
          if (test) {
            return this._executeBlock(stmt.consequent, new Environment(env));
          } else if (stmt.alternate) {
            return this._executeBlock(stmt.alternate, new Environment(env));
          }
          break;
        case 'WhileStatement':
          while (this._evaluateExpression(stmt.test, env)) {
            const result = this._executeBlock(stmt.body, new Environment(env));
            if (result !== undefined) {
              return result;
            }
          }
          break;
        default:
          throw new Error(`Unknown statement type: ${stmt.type}`);
      }
    }
  
    _evaluateExpression(expr, env) {
      switch (expr.type) {
        case 'Literal':
          return expr.value;
        case 'Identifier':
          return env.getVariable(expr.name);
        case 'AssignmentExpression':
          const value = this._evaluateExpression(expr.right, env);
          env.assignVariable(expr.left.name, value);
          return value;
        case 'BinaryExpression':
          const left = this._evaluateExpression(expr.left, env);
          const right = this._evaluateExpression(expr.right, env);
          return this._applyOperator(expr.operator, left, right);
        case 'UnaryExpression':
          const arg = this._evaluateExpression(expr.argument, env);
          return this._applyUnaryOperator(expr.operator, arg);
        case 'CallExpression':
          if (expr.callee in this.functions) {
            const func = this.functions[expr.callee];
            const funcEnv = new Environment(this.globalEnv);
            for (let i = 0; i < func.params.length; i++) {
              const paramName = func.params[i];
              const argValue = this._evaluateExpression(
                expr.arguments[i],
                env
              );
              funcEnv.declareVariable(paramName, argValue);
            }
            return this._executeBlock(func.body, funcEnv);
          } else if (expr.callee === 'print') {
            const argValue = this._evaluateExpression(expr.arguments[0], env);
            console.log(argValue);
            return argValue;
          } else {
            throw new Error(`Undefined function ${expr.callee}`);
          }
        default:
          throw new Error(`Unknown expression type: ${expr.type}`);
      }
    }
  
    _applyOperator(operator, left, right) {
      switch (operator) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          return left / right;
        case '%':
          return left % right;
        case '==':
          return left === right;
        case '!=':
          return left !== right;
        case '<':
          return left < right;
        case '>':
          return left > right;
        case '<=':
          return left <= right;
        case '>=':
          return left >= right;
        default:
          throw new Error(`Unknown operator ${operator}`);
      }
    }
  
    _applyUnaryOperator(operator, argument) {
      switch (operator) {
        case '+':
          return +argument;
        case '-':
          return -argument;
        case '!':
          return !argument;
        default:
          throw new Error(`Unknown unary operator ${operator}`);
      }
    }
  }
  
  module.exports = Interpreter;