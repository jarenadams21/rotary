// src/lexer.js

class Lexer {
    constructor(input) {
      this.input = input;
      this.position = 0;
      this.currentChar = input[0];
    }
  
    advance() {
      this.position++;
      if (this.position >= this.input.length) {
        this.currentChar = null; // End of input
      } else {
        this.currentChar = this.input[this.position];
      }
    }
  
    skipWhitespace() {
      while (this.currentChar && /\s/.test(this.currentChar)) {
        this.advance();
      }
    }
  
    skipComment() {
      if (this.currentChar === '#') {
        while (this.currentChar && this.currentChar !== '\n') {
          this.advance();
        }
      }
    }
  
    getNextToken() {
      while (this.currentChar) {
        // Skip whitespace
        if (/\s/.test(this.currentChar)) {
          this.skipWhitespace();
          continue;
        }
  
        // Skip comments
        if (this.currentChar === '#') {
          this.skipComment();
          continue;
        }
  
        // Identifiers and keywords
        if (/[a-zA-Z_]/.test(this.currentChar)) {
          return this._identifier();
        }
  
        // Numbers
        if (/\d/.test(this.currentChar)) {
          return this._number();
        }
  
        // Operators and delimiters
        switch (this.currentChar) {
          case '+':
            this.advance();
            return { type: 'PLUS', value: '+' };
          case '-':
            this.advance();
            return { type: 'MINUS', value: '-' };
          case '*':
            this.advance();
            return { type: 'MULTIPLY', value: '*' };
          case '/':
            this.advance();
            return { type: 'DIVIDE', value: '/' };
          case '%':
            this.advance();
            return { type: 'MODULO', value: '%' };
          case '=':
            this.advance();
            if (this.currentChar === '=') {
              this.advance();
              return { type: 'EQUALS', value: '==' };
            }
            return { type: 'ASSIGN', value: '=' };
          case '!':
            this.advance();
            if (this.currentChar === '=') {
              this.advance();
              return { type: 'NOT_EQUALS', value: '!=' };
            }
            return { type: 'NOT', value: '!' };
          case '<':
            this.advance();
            if (this.currentChar === '=') {
              this.advance();
              return { type: 'LESS_EQUALS', value: '<=' };
            }
            return { type: 'LESS_THAN', value: '<' };
          case '>':
            this.advance();
            if (this.currentChar === '=') {
              this.advance();
              return { type: 'GREATER_EQUALS', value: '>=' };
            }
            return { type: 'GREATER_THAN', value: '>' };
          case '(':
            this.advance();
            return { type: 'LPAREN', value: '(' };
          case ')':
            this.advance();
            return { type: 'RPAREN', value: ')' };
          case '{':
            this.advance();
            return { type: 'LBRACE', value: '{' };
          case '}':
            this.advance();
            return { type: 'RBRACE', value: '}' };
          case ';':
            this.advance();
            return { type: 'SEMICOLON', value: ';' };
          case ',':
            this.advance();
            return { type: 'COMMA', value: ',' };
          case '"':
            return this._string();
          default:
            throw new Error(`Unknown character: ${this.currentChar}`);
        }
      }
  
      return { type: 'EOF', value: null };
    }
  
    _identifier() {
      let result = '';
      while (this.currentChar && /[a-zA-Z0-9_]/.test(this.currentChar)) {
        result += this.currentChar;
        this.advance();
      }
      const keywords = [
        'var',
        'function',
        'return',
        'if',
        'else',
        'while',
        'print',
      ];
      if (keywords.includes(result)) {
        return { type: 'KEYWORD', value: result };
      }
      return { type: 'IDENTIFIER', value: result };
    }
  
    _number() {
      let result = '';
      while (this.currentChar && /\d/.test(this.currentChar)) {
        result += this.currentChar;
        this.advance();
      }
      if (this.currentChar === '.') {
        result += '.';
        this.advance();
        while (this.currentChar && /\d/.test(this.currentChar)) {
          result += this.currentChar;
          this.advance();
        }
        return { type: 'NUMBER', value: parseFloat(result) };
      }
      return { type: 'NUMBER', value: parseInt(result, 10) };
    }
  
    _string() {
      let result = '';
      this.advance(); // Skip opening quote
      while (this.currentChar && this.currentChar !== '"') {
        result += this.currentChar;
        this.advance();
      }
      if (this.currentChar !== '"') {
        throw new Error('Unterminated string literal');
      }
      this.advance(); // Skip closing quote
      return { type: 'STRING', value: result };
    }
  }
  
  module.exports = Lexer;