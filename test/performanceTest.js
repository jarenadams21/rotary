// tests/performanceTest.js

// Import the necessary components for your custom language
const Lexer = require('../src/lexer');  // Custom language lexer
const Parser = require('../src/parser');  // Custom language parser
const Interpreter = require('../src/interpreter');  // Custom language interpreter

// Helper function to measure execution time in the custom language
function measureExecutionTimeCustomLanguage(code) {
  const start = process.hrtime(); // Start the timer

  const lexer = new Lexer(code);  // Tokenize the input code
  const parser = new Parser(lexer);  // Parse the tokens into an AST
  const ast = parser.parse();  // Generate the AST from the parser
  const interpreter = new Interpreter(ast);  // Interpret the AST
  interpreter.interpret();  // Run the interpreted code

  const diff = process.hrtime(start);  // Get the time difference
  const timeInMs = diff[0] * 1000 + diff[1] / 1e6;  // Convert to milliseconds
  return timeInMs;  // Return the execution time in milliseconds
}

// Helper function to measure execution time in JavaScript
function measureExecutionTimeJS(code) {
  const start = process.hrtime(); // Start the timer

  eval(code);  // Use eval to run the plain JavaScript code

  const diff = process.hrtime(start);  // Get the time difference
  const timeInMs = diff[0] * 1000 + diff[1] / 1e6;  // Convert to milliseconds
  return timeInMs;  // Return the execution time in milliseconds
}

// Sample code to test in both languages
const codeToTest = `
var x = 0;
while (x < 100000) {
  x = x + 1;
}
`;

// Measure execution time in the custom language
const customLanguageTime = measureExecutionTimeCustomLanguage(codeToTest);
console.log(`Custom Language Execution Time: ${customLanguageTime.toFixed(2)}ms`);

// Measure execution time in JavaScript
const jsTime = measureExecutionTimeJS(codeToTest);
console.log(`JavaScript Execution Time: ${jsTime.toFixed(2)}ms`);