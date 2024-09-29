// src/parser.js

class Parser {
    constructor(lexer) {
      this.lexer = lexer;
      this.currentToken = this.lexer.getNextToken();
    }
  
    eat(tokenType) {
      if (this.currentToken.type === tokenType) {
        this.currentToken = this.lexer.getNextToken();
      } else {
        throw new Error(
          `Unexpected token ${this.currentToken.type}, expected ${tokenType}`
        );
      }
    }
  
    parse() {
      const statements = [];
      while (this.currentToken.type !== 'EOF') {
        statements.push(this.statement());
      }
      return { type: 'Program', body: statements };
    }
  
    statement() {
      if (this.currentToken.type === 'KEYWORD') {
        switch (this.currentToken.value) {
          case 'var':
            return this.variableDeclaration();
          case 'function':
            return this.functionDeclaration();
          case 'if':
            return this.ifStatement();
          case 'while':
            return this.whileStatement();
          case 'return':
            return this.returnStatement();
          case 'print':
            return this.printStatement();
          default:
            throw new Error(`Unknown keyword ${this.currentToken.value}`);
        }
      } else if (this.currentToken.type === 'IDENTIFIER') {
        return this.expressionStatement();
      } else {
        throw new Error(`Unexpected token ${this.currentToken.type}`);
      }
    }
  
    variableDeclaration() {
      this.eat('KEYWORD'); // 'var'
      const name = this.currentToken.value;
      this.eat('IDENTIFIER');
      this.eat('ASSIGN');
      const value = this.expression();
      this.eat('SEMICOLON');
      return { type: 'VariableDeclaration', name, value };
    }
  
    functionDeclaration() {
      this.eat('KEYWORD'); // 'function'
      const name = this.currentToken.value;
      this.eat('IDENTIFIER');
      this.eat('LPAREN');
      const params = this.parameterList();
      this.eat('RPAREN');
      this.eat('LBRACE');
      const body = [];
      while (this.currentToken.type !== 'RBRACE') {
        body.push(this.statement());
      }
      this.eat('RBRACE');
      return { type: 'FunctionDeclaration', name, params, body };
    }
  
    parameterList() {
      const params = [];
      if (this.currentToken.type === 'IDENTIFIER') {
        params.push(this.currentToken.value);
        this.eat('IDENTIFIER');
        while (this.currentToken.type === 'COMMA') {
          this.eat('COMMA');
          params.push(this.currentToken.value);
          this.eat('IDENTIFIER');
        }
      }
      return params;
    }
  
    expressionStatement() {
      const expr = this.expression();
      this.eat('SEMICOLON');
      return { type: 'ExpressionStatement', expression: expr };
    }
  
    returnStatement() {
      this.eat('KEYWORD'); // 'return'
      const argument = this.expression();
      this.eat('SEMICOLON');
      return { type: 'ReturnStatement', argument };
    }
  
    printStatement() {
      this.eat('KEYWORD'); // 'print'
      this.eat('LPAREN');
      const argument = this.expression();
      this.eat('RPAREN');
      this.eat('SEMICOLON');
      return { type: 'PrintStatement', argument };
    }
  
    ifStatement() {
      this.eat('KEYWORD'); // 'if'
      this.eat('LPAREN');
      const test = this.expression();
      this.eat('RPAREN');
      this.eat('LBRACE');
      const consequent = [];
      while (this.currentToken.type !== 'RBRACE') {
        consequent.push(this.statement());
      }
      this.eat('RBRACE');
      let alternate = null;
      if (
        this.currentToken.type === 'KEYWORD' &&
        this.currentToken.value === 'else'
      ) {
        this.eat('KEYWORD'); // 'else'
        this.eat('LBRACE');
        alternate = [];
        while (this.currentToken.type !== 'RBRACE') {
          alternate.push(this.statement());
        }
        this.eat('RBRACE');
      }
      return { type: 'IfStatement', test, consequent, alternate };
    }
  
    whileStatement() {
      this.eat('KEYWORD'); // 'while'
      this.eat('LPAREN');
      const test = this.expression();
      this.eat('RPAREN');
      this.eat('LBRACE');
      const body = [];
      while (this.currentToken.type !== 'RBRACE') {
        body.push(this.statement());
      }
      this.eat('RBRACE');
      return { type: 'WhileStatement', test, body };
    }
  
    expression() {
      return this.assignment();
    }
  
    assignment() {
      const left = this.logicalOr();
      if (this.currentToken.type === 'ASSIGN') {
        this.eat('ASSIGN');
        const right = this.assignment();
        return { type: 'AssignmentExpression', left, right };
      }
      return left;
    }
  
    logicalOr() {
      let left = this.logicalAnd();
      while (this.currentToken.type === 'OR') {
        this.eat('OR');
        const right = this.logicalAnd();
        left = { type: 'LogicalExpression', operator: '||', left, right };
      }
      return left;
    }
  
    logicalAnd() {
      let left = this.equality();
      while (this.currentToken.type === 'AND') {
        this.eat('AND');
        const right = this.equality();
        left = { type: 'LogicalExpression', operator: '&&', left, right };
      }
      return left;
    }
  
    equality() {
      let left = this.relational();
      while (
        this.currentToken.type === 'EQUALS' ||
        this.currentToken.type === 'NOT_EQUALS'
      ) {
        const operator = this.currentToken.value;
        this.eat(this.currentToken.type);
        const right = this.relational();
        left = { type: 'BinaryExpression', operator, left, right };
      }
      return left;
    }
  
    relational() {
      let left = this.additive();
      while (
        this.currentToken.type === 'LESS_THAN' ||
        this.currentToken.type === 'GREATER_THAN' ||
        this.currentToken.type === 'LESS_EQUALS' ||
        this.currentToken.type === 'GREATER_EQUALS'
      ) {
        const operator = this.currentToken.value;
        this.eat(this.currentToken.type);
        const right = this.additive();
        left = { type: 'BinaryExpression', operator, left, right };
      }
      return left;
    }
  
    additive() {
      let left = this.multiplicative();
      while (
        this.currentToken.type === 'PLUS' ||
        this.currentToken.type === 'MINUS'
      ) {
        const operator = this.currentToken.value;
        this.eat(this.currentToken.type);
        const right = this.multiplicative();
        left = { type: 'BinaryExpression', operator, left, right };
      }
      return left;
    }
  
    multiplicative() {
      let left = this.unary();
      while (
        this.currentToken.type === 'MULTIPLY' ||
        this.currentToken.type === 'DIVIDE' ||
        this.currentToken.type === 'MODULO'
      ) {
        const operator = this.currentToken.value;
        this.eat(this.currentToken.type);
        const right = this.unary();
        left = { type: 'BinaryExpression', operator, left, right };
      }
      return left;
    }
  
    unary() {
      if (
        this.currentToken.type === 'PLUS' ||
        this.currentToken.type === 'MINUS' ||
        this.currentToken.type === 'NOT'
      ) {
        const operator = this.currentToken.value;
        this.eat(this.currentToken.type);
        const argument = this.unary();
        return { type: 'UnaryExpression', operator, argument };
      }
      return this.primary();
    }
  
    primary() {
      if (this.currentToken.type === 'NUMBER') {
        const value = this.currentToken.value;
        this.eat('NUMBER');
        return { type: 'Literal', value };
      } else if (this.currentToken.type === 'STRING') {
        const value = this.currentToken.value;
        this.eat('STRING');
        return { type: 'Literal', value };
      } else if (this.currentToken.type === 'IDENTIFIER') {
        const name = this.currentToken.value;
        this.eat('IDENTIFIER');
        if (this.currentToken.type === 'LPAREN') {
          this.eat('LPAREN');
          const args = [];
          if (this.currentToken.type !== 'RPAREN') {
            args.push(this.expression());
            while (this.currentToken.type === 'COMMA') {
              this.eat('COMMA');
              args.push(this.expression());
            }
          }
          this.eat('RPAREN');
          return { type: 'CallExpression', callee: name, arguments: args };
        }
        return { type: 'Identifier', name };
      } else if (this.currentToken.type === 'LPAREN') {
        this.eat('LPAREN');
        const expr = this.expression();
        this.eat('RPAREN');
        return expr;
      } else {
        throw new Error(`Unexpected token ${this.currentToken.type}`);
      }
    }
  }
  
  module.exports = Parser;