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

    if (this.currentToken.value === 'let') {
        return this._handleLetDeclaration();
    }

    if (this.currentToken.value === 'routine') {
        return this._handleRoutineDeclaration();
    }

    if (this.currentToken.value === 'for') {
        return this._handleForLoop();
    }

    if (this.currentToken.type === 'IDENTIFIER') {
        const identifier = this.currentToken.value;
        this.currentToken = this.lexer.getNextToken(); // Skip the identifier

        if (this.currentToken.value === '=') {
            this.currentToken = this.lexer.getNextToken(); // Skip '='
            const value = this.expression();  // Parse the right-hand side value
            return { type: 'AssignmentExpression', name: identifier, value };
        }
    }

    return this.expression();
}

_handleForLoop() {
  this.log(`Handling for loop`);
  this.currentToken = this.lexer.getNextToken(); // Skip 'for'

  if (this.currentToken.value !== '<') {
      throw new Error(`Expected "<" to start for loop condition, got: ${this.currentToken.value}`);
  }
  this.currentToken = this.lexer.getNextToken(); // Skip '<'

  // Parse the initializer (e.g., let i = 0;)
  const initializer = this.statement();

  // Expect a semicolon after the initializer
  if (this.currentToken.value !== ';') {
      throw new Error(`Expected ";" after initializer, got: ${this.currentToken.value}`);
  }
  this.currentToken = this.lexer.getNextToken(); // Skip ';'

  // Parse the condition (e.g., i < 50)
  const condition = this.expression();

  // Expect a semicolon after the condition
  if (this.currentToken.value !== ';') {
      throw new Error(`Expected ";" after condition, got: ${this.currentToken.value}`);
  }
  this.currentToken = this.lexer.getNextToken(); // Skip ';'

  // Parse the increment (e.g., i*)
  const increment = this.statement();

  // Expect the closing '>'
  if (this.currentToken.value !== '>') {
      throw new Error(`Expected ">" to close for loop condition, got: ${this.currentToken.value}`);
  }
  this.currentToken = this.lexer.getNextToken(); // Skip '>'

  // Parse the body of the loop
  if (this.currentToken.value !== '^') {
      throw new Error(`Expected "^" to start for loop body, got: ${this.currentToken.value}`);
  }
  this.currentToken = this.lexer.getNextToken(); // Skip '^'

  const body = [];
  while (this.currentToken.value !== '^') {
      body.push(this.statement());
  }
  this.currentToken = this.lexer.getNextToken(); // Skip closing '^'

  return { type: 'ForLoop', initializer, condition, increment, body };
}

expression() {
  this.log(`Evaluating expression for token: ${this.currentToken.value}`);
  let left = this.term();

  // Check for relational operators like <, >, <=, >=
  while (this.currentToken.value === '+' || this.currentToken.value === '-' ||
         this.currentToken.value === '<' || this.currentToken.value === '>' ||
         this.currentToken.value === '<=' || this.currentToken.value === '>=') {
      const operator = this.currentToken.value;
      this.currentToken = this.lexer.getNextToken();
      const right = this.term();
      left = { type: 'BinaryExpression', operator, left, right };
  }

  return left;
}

  term() {
    this.log(`Evaluating term for token: ${this.currentToken.value}`);
    let left = this.factor();

    while (this.currentToken.value === '*' || this.currentToken.value === '/') {
      const operator = this.currentToken.value;
      this.currentToken = this.lexer.getNextToken();
      const right = this.factor();
      left = { type: 'BinaryExpression', operator, left, right };
    }

    return left;
  }
  factor() {
    this.log(`Evaluating factor for token: ${this.currentToken.value}`);

    if (this.currentToken.type === 'NUMBER') {
        return this._handleNumber();
    }

    if (this.currentToken.type === 'IDENTIFIER') {
        const identifier = this.currentToken.value;
        this.currentToken = this.lexer.getNextToken(); // Move past the identifier

        // Handle post-increment (i*) as shorthand for incrementing by 1
        if (this.currentToken.value === '*') {
            this.currentToken = this.lexer.getNextToken(); // Move past '*'
            return {
                type: 'AssignmentExpression',
                name: identifier,
                value: {
                    type: 'BinaryExpression',
                    operator: '+', // Treat * as shorthand for i = i + 1
                    left: { type: 'Identifier', name: identifier },
                    right: { type: 'NumberLiteral', value: 1 }
                }
            };
        }

        // Handle function calls and regular identifiers
        if (this.currentToken.value === '[') {
            this.log(`Function call detected for: ${identifier}`);
            const args = [];
            this.currentToken = this.lexer.getNextToken(); // Skip '['

            // Parse the arguments inside the square brackets
            while (this.currentToken.value !== ']') {
                args.push(this.expression());
                if (this.currentToken.value === ',') {
                    this.currentToken = this.lexer.getNextToken(); // Skip comma
                }
            }
            this.currentToken = this.lexer.getNextToken(); // Skip ']'

            return { type: 'FunctionCall', name: identifier, arguments: args };
        }

        return { type: 'Identifier', name: identifier };
    }

    throw new Error(`Invalid expression starting with token: ${this.currentToken.value}`);
}

  _handleLetDeclaration() {
    this.log(`Handling let declaration`);
    this.currentToken = this.lexer.getNextToken();
    const name = this.currentToken.value;
    this.log(`Let variable name: ${name}`);
    this.currentToken = this.lexer.getNextToken();

    if (this.currentToken.value !== '=') {
      throw new Error(`Expected "=" after let variable declaration, got: ${this.currentToken.value}`);
    }
    this.currentToken = this.lexer.getNextToken();
    const value = this.expression();
    this.log(`Let declaration value: ${JSON.stringify(value)}`);
    return { type: 'VariableDeclaration', name, value };
  }

  _handleRoutineDeclaration() {
    this.log(`Handling routine declaration`);
    this.currentToken = this.lexer.getNextToken(); // Skip 'routine'
    const name = this.currentToken.value;
    this.currentToken = this.lexer.getNextToken(); // Skip the routine name

    const params = [];
    if (this.currentToken.value === '[') {
        this.currentToken = this.lexer.getNextToken(); // Skip '['
        while (this.currentToken.value !== ']') {
            params.push(this.currentToken.value);
            this.currentToken = this.lexer.getNextToken(); // Skip parameter
            if (this.currentToken.value === ',') {
                this.currentToken = this.lexer.getNextToken(); // Skip comma
            }
        }
        this.currentToken = this.lexer.getNextToken(); // Skip ']'
    }

    if (this.currentToken.value !== '^') {
        throw new Error(`Expected "^" to start routine block, got: ${this.currentToken.value}`);
    }
    this.currentToken = this.lexer.getNextToken(); // Skip '^'

    const body = [];
    while (this.currentToken.value !== '^') {
        body.push(this.statement());
    }
    this.currentToken = this.lexer.getNextToken(); // Skip closing '^'

    return { type: 'RoutineDeclaration', name, params, body };
}

  _handleIdentifierOrFunctionCall() {
    this.log(`Handling identifier or function call for: ${this.currentToken.value}`);
    const name = this.currentToken.value;
    this.currentToken = this.lexer.getNextToken();

    if (this.currentToken.value === '[') {
      this.log(`Function call detected for: ${name}`);
      this.currentToken = this.lexer.getNextToken();
      const args = [];
      while (this.currentToken.value !== ']') {
        args.push(this.expression());
        if (this.currentToken.value === ',') {
          this.currentToken = this.lexer.getNextToken();
        }
      }
      this.currentToken = this.lexer.getNextToken();
      return { type: 'FunctionCall', name, arguments: args };
    }

    return { type: 'Identifier', name };
  }

  _handleNumber() {
    this.log(`Handling number: ${this.currentToken.value}`);
    const value = parseFloat(this.currentToken.value);
    this.currentToken = this.lexer.getNextToken();
    return { type: 'NumberLiteral', value };
  }

  log(message) {
    console.log(`[Parser Log] ${message}`);
  }
}

module.exports = Parser;