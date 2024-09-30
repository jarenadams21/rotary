// src/lexer.js

class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = input[0];
  }

  advance() {
    this.position++;
    this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
  }

  peek() {
    return this.position + 1 < this.input.length ? this.input[this.position + 1] : null;
  }

  getNextToken() {
    while (this.currentChar) {
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      if (/\d/.test(this.currentChar)) {
        return this._number();
      }

      if (/[a-zA-Z_]/.test(this.currentChar)) {
        return this._identifierOrKeyword();
      }

      // Multi-character operators
      if (this.currentChar === '<' && this.peek() === '=') {
        this.advance();
        this.advance();
        return { type: 'OPERATOR', value: '<=' };
      }

      if (this.currentChar === '>' && this.peek() === '=') {
        this.advance();
        this.advance();
        return { type: 'OPERATOR', value: '>=' };
      }

      // Single-character operators and delimiters
      const singleCharTokens = {
        '+': 'OPERATOR',
        '-': 'OPERATOR',
        '*': 'OPERATOR',
        '/': 'OPERATOR',
        '<': 'OPERATOR',
        '>': 'OPERATOR',
        '=': 'OPERATOR',
        ';': 'DELIMITER',
        '^': 'BLOCK_DELIMITER',
        '[': 'ARG_START',
        ']': 'ARG_END',
        ',': 'COMMA',
        '(': 'LPAREN',
        ')': 'RPAREN',
      };

      if (singleCharTokens[this.currentChar]) {
        const char = this.currentChar;
        const type = singleCharTokens[char];
        this.advance();
        return { type, value: char };
      }

      throw new Error(`Unrecognized character: ${this.currentChar}`);
    }
    return { type: 'EOF', value: null };
  }

  _number() {
    let number = '';
    while (this.currentChar && /\d/.test(this.currentChar)) {
      number += this.currentChar;
      this.advance();
    }
    return { type: 'NUMBER', value: parseFloat(number) };
  }

  _identifierOrKeyword() {
    let identifier = '';
    while (this.currentChar && /[a-zA-Z_]/.test(this.currentChar)) {
      identifier += this.currentChar;
      this.advance();
    }

    const keywords = ['routine', 'let', 'return', 'for'];
    if (keywords.includes(identifier)) {
      return { type: 'KEYWORD', value: identifier };
    }

    return { type: 'IDENTIFIER', value: identifier };
  }

  skipWhitespace() {
    while (/\s/.test(this.currentChar)) {
      this.advance();
    }
  }
}

module.exports = Lexer;