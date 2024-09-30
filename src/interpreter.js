class Interpreter {
  constructor(ast, profiler = null) {
      this.ast = ast;
      this.globalEnv = new Environment();
      this.functionUsage = {};  // Tracks function usage frequency
      this.profiler = profiler;
      this.executionPriority = {};  // Dynamic execution priority
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
          case 'FunctionDeclaration':
              this._handleFunctionDeclaration(stmt, env);
              break;
          case 'ExpressionStatement':
              this._evaluateExpression(stmt.expression, env);
              break;
          default:
              throw new Error(`Unknown statement type: ${stmt.type}`);
      }
  }

  _handleFunctionDeclaration(stmt, env) {
      const func = {
          params: stmt.params,
          body: stmt.body,
          env: env,
      };
      env.declareVariable(stmt.name, func);
      this.functionUsage[stmt.name] = this.functionUsage[stmt.name] || 0;  // Initialize usage count
      if (this.profiler) this.profiler.log(`Declared function ${stmt.name}`);
  }

  _evaluateExpression(expr, env) {
      switch (expr.type) {
          case 'AssignmentExpression':
              const value = this._evaluateExpression(expr.right, env);
              env.assignVariable(expr.left.name, value);
              if (this.profiler) this.profiler.log(`Assigned ${expr.left.name} = ${value}`);
              return value;
          case 'Identifier':
              const val = env.getVariable(expr.name);
              if (this.functionUsage[expr.name]) {
                  this.functionUsage[expr.name]++;  // Increment function usage count
              }
              if (this.profiler) this.profiler.log(`Retrieved ${expr.name} = ${val}`);
              return val;
          // Other cases for evaluating expressions...
      }
  }

  // Adjusts execution priorities based on function usage
  _adjustExecutionPriority() {
      const maxUsageFunc = Object.keys(this.functionUsage).reduce((a, b) => 
          this.functionUsage[a] > this.functionUsage[b] ? a : b
      );
      this.executionPriority = maxUsageFunc;
      if (this.profiler) this.profiler.log(`Adjusted execution priority to ${maxUsageFunc}`);
  }

  getFunctionUsage() {
      return this.functionUsage;
  }

  getExecutionPriority() {
      return this.executionPriority;
  }
}

module.exports = Interpreter;