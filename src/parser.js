// src/parser.js

class Parser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
    this.log(`Starting parser with token: ${this.currentToken.value}`);
  }

  parse() {
    const statements = [];
    while (this.currentToken.type !== 'EOF') {
      this.log(`Parsing token: ${this.currentToken.value}`);
      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
        this.log(`Statement parsed: ${JSON.stringify(stmt)}`);
      } else {
        throw new Error("Parser encountered an invalid statement.");
      }
    }
    return { type: 'Program', body: statements };
  }

  statement() {
    this.log(`Handling statement, current token: ${this.currentToken.value}`);

    if (this.currentToken.type === 'KEYWORD') {
      switch (this.currentToken.value) {
        case 'let':
          return this._handleLetDeclaration();
        case 'routine':
          return this._handleRoutineDeclaration();
        case 'return':
          return this._handleReturnStatement();
        case 'for':
          return this._handleForLoop();
        default:
          throw new Error(`Unknown keyword: ${this.currentToken.value}`);
      }
    }

    if (this.currentToken.type === 'IDENTIFIER') {
      return this._handleAssignmentOrFunctionCall();
    }

    throw new Error(`Invalid statement starting with token: ${this.currentToken.value}`);
  }

  _handleLetDeclaration() {
    this.log(`Handling let declaration`);
    this.currentToken = this.lexer.getNextToken(); // Skip 'let'
    const name = this.currentToken.value;
    this.currentToken = this.lexer.getNextToken(); // Skip variable name

    if (this.currentToken.type !== 'OPERATOR' || this.currentToken.value !== '=') {
      throw new Error(`Expected "=" after let variable declaration, got: ${this.currentToken.value}`);
    }
    this.currentToken = this.lexer.getNextToken(); // Skip '='
    const value = this.expression();
    return { type: 'VariableDeclaration', name, value };
  }

  _handleRoutineDeclaration() {
    this.log(`Handling routine declaration`);
    this.currentToken = this.lexer.getNextToken(); // Skip 'routine'
    const name = this.currentToken.value;
    this.currentToken = this.lexer.getNextToken(); // Skip routine name

    const params = [];
    if (this.currentToken.type === 'ARG_START') {
      this.currentToken = this.lexer.getNextToken(); // Skip '['
      while (this.currentToken.type !== 'ARG_END') {
        params.push(this.currentToken.value);
        this.currentToken = this.lexer.getNextToken(); // Skip parameter or comma
        if (this.currentToken.type === 'COMMA') {
          this.currentToken = this.lexer.getNextToken(); // Skip comma
        }
      }
      this.currentToken = this.lexer.getNextToken(); // Skip ']'
    }

    if (this.currentToken.type !== 'BLOCK_DELIMITER') {
      throw new Error(`Expected "^" to start routine block, got: ${this.currentToken.value}`);
    }
    this.currentToken = this.lexer.getNextToken(); // Skip '^'

    const body = [];
    while (this.currentToken.type !== 'BLOCK_DELIMITER') {
      body.push(this.statement());
    }
    this.currentToken = this.lexer.getNextToken(); // Skip closing '^'

    return { type: 'RoutineDeclaration', name, params, body };
  }

  _handleReturnStatement() {
    this.log(`Handling return statement`);
    this.currentToken = this.lexer.getNextToken(); // Skip 'return'
    const value = this.expression();
    return { type: 'ReturnStatement', value };
  }

  _handleForLoop() {
    this.log(`Handling for loop`);
    this.currentToken = this.lexer.getNextToken(); // Skip 'for'

    if (this.currentToken.type !== 'OPERATOR' || this.currentToken.value !== '<') {
      throw new Error(`Expected "<" to start for loop condition, got: ${this.currentToken.value}`);
    }
    this.currentToken = this.lexer.getNextToken(); // Skip '<'

    // Parse the initializer (e.g., let i = 0;)
    const initializer = this.statement();

    // Expect a semicolon after the initializer
    if (this.currentToken.type !== 'DELIMITER' || this.currentToken.value !== ';') {
      throw new Error(`Expected ";" after initializer, got: ${this.currentToken.value}`);
    }
    this.currentToken = this.lexer.getNextToken(); // Skip ';'

    // Parse the condition (e.g., i < 50)
    const condition = this.expression();

    // Expect a semicolon after the condition
    if (this.currentToken.type !== 'DELIMITER' || this.currentToken.value !== ';') {
      throw new Error(`Expected ";" after condition, got: ${this.currentToken.value}`);
    }
    this.currentToken = this.lexer.getNextToken(); // Skip ';'

    // Parse the increment (e.g., i*)
    const increment = this._handleIncrement();

    // Expect the closing '>'
    if (this.currentToken.type !== 'OPERATOR' || this.currentToken.value !== '>') {
      throw new Error(`Expected ">" to close for loop condition, got: ${this.currentToken.value}`);
    }
    this.currentToken = this.lexer.getNextToken(); // Skip '>'

    // Parse the body of the loop
    if (this.currentToken.type !== 'BLOCK_DELIMITER') {
      throw new Error(`Expected "^" to start for loop body, got: ${this.currentToken.value}`);
    }
    this.currentToken = this.lexer.getNextToken(); // Skip '^'

    const body = [];
    while (this.currentToken.type !== 'BLOCK_DELIMITER') {
      body.push(this.statement());
    }
    this.currentToken = this.lexer.getNextToken(); // Skip closing '^'

    return { type: 'ForLoop', initializer, condition, increment, body };
  }

  _handleIncrement() {
    if (this.currentToken.type === 'IDENTIFIER') {
      const identifier = this.currentToken.value;
      this.currentToken = this.lexer.getNextToken(); // Skip identifier

      if (this.currentToken.type === 'OPERATOR' && this.currentToken.value === '*') {
        this.currentToken = this.lexer.getNextToken(); // Skip '*'
        return {
          type: 'AssignmentExpression',
          name: identifier,
          value: {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Identifier', name: identifier },
            right: { type: 'NumberLiteral', value: 1 },
          },
        };
      }
    }

    throw new Error(`Invalid increment expression in for loop`);
  }

  _handleAssignmentOrFunctionCall() {
    const identifier = this.currentToken.value;
    this.currentToken = this.lexer.getNextToken(); // Skip identifier

    if (this.currentToken.type === 'OPERATOR' && this.currentToken.value === '=') {
      this.currentToken = this.lexer.getNextToken(); // Skip '='
      const value = this.expression();
      return { type: 'AssignmentExpression', name: identifier, value };
    }

    if (this.currentToken.type === 'OPERATOR' && this.currentToken.value === '*') {
      this.currentToken = this.lexer.getNextToken(); // Skip '*'
      return {
        type: 'AssignmentExpression',
        name: identifier,
        value: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: identifier },
          right: { type: 'NumberLiteral', value: 1 },
        },
      };
    }

    if (this.currentToken.type === 'ARG_START') {
      return this._handleFunctionCall(identifier);
    }

    throw new Error(`Invalid assignment or function call starting with: ${identifier}`);
  }

  _handleFunctionCall(name) {
    const args = [];
    this.currentToken = this.lexer.getNextToken(); // Skip '['

    while (this.currentToken.type !== 'ARG_END') {
      args.push(this.expression());
      if (this.currentToken.type === 'COMMA') {
        this.currentToken = this.lexer.getNextToken(); // Skip comma
      }
    }
    this.currentToken = this.lexer.getNextToken(); // Skip ']'

    return { type: 'FunctionCall', name, arguments: args };
  }

  expression() {
    this.log(`Evaluating expression for token: ${this.currentToken.value}`);
    let left = this.term();

    while (this.currentToken.type === 'OPERATOR' && ['+', '-', '<', '>', '<=', '>='].includes(this.currentToken.value)) {
      const operator = this.currentToken.value;
      this.currentToken = this.lexer.getNextToken(); // Skip operator
      const right = this.term();
      left = { type: 'BinaryExpression', operator, left, right };
    }

    return left;
  }

  term() {
    let left = this.factor();

    while (this.currentToken.type === 'OPERATOR' && ['*', '/'].includes(this.currentToken.value)) {
      const operator = this.currentToken.value;
      this.currentToken = this.lexer.getNextToken(); // Skip operator
      const right = this.factor();
      left = { type: 'BinaryExpression', operator, left, right };
    }

    return left;
  }

  factor() {
    if (this.currentToken.type === 'NUMBER') {
      const value = this.currentToken.value;
      this.currentToken = this.lexer.getNextToken(); // Skip number
      return { type: 'NumberLiteral', value };
    }

    if (this.currentToken.type === 'IDENTIFIER') {
      const identifier = this.currentToken.value;
      this.currentToken = this.lexer.getNextToken(); // Skip identifier

      if (this.currentToken.type === 'ARG_START') {
        return this._handleFunctionCall(identifier);
      }

      return { type: 'Identifier', name: identifier };
    }

    throw new Error(`Invalid expression starting with token: ${this.currentToken.value}`);
  }

  log(message) {
    // Uncomment the following line to enable parser logs
    // console.log(`[Parser Log] ${message}`);
  }
}

module.exports = Parser;