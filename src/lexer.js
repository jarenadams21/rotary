class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = input[0];
    this.tokenFrequency = {};
  }

  advance() {
    this.position++;
    this.currentChar = this.position < this.input.length ? this.input[this.position] : null;
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

      if (this.currentChar === '^') {
        this.advance();
        return { type: 'BLOCK_DELIMITER', value: '^' };
      }

      if (this.currentChar === '[') {
        this.advance();
        return { type: 'ARG_START', value: '[' };
      }

      if (this.currentChar === ']') {
        this.advance();
        return { type: 'ARG_END', value: ']' };
      }

      return this._symbol();
    }
    return { type: 'EOF', value: null };
  }

  _number() {
    let number = '';
    while (this.currentChar && /\d/.test(this.currentChar)) {
      number += this.currentChar;
      this.advance();
    }
    return { type: 'NUMBER', value: number };
  }

  _identifierOrKeyword() {
    let identifier = '';
    while (this.currentChar && /[a-zA-Z_]/.test(this.currentChar)) {
      identifier += this.currentChar;
      this.advance();
    }

    if (identifier === 'routine') {
      return { type: 'KEYWORD', value: identifier };
    }

    return { type: 'IDENTIFIER', value: identifier };
  }

  _symbol() {
    const symbol = this.currentChar;
    this.advance();
    return { type: 'SYMBOL', value: symbol };
  }

  skipWhitespace() {
    while (/\s/.test(this.currentChar)) {
      this.advance();
    }
  }
}

module.exports = Lexer;