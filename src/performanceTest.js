// src/performanceTest.js

const Lexer = require('./lexer');
const Parser = require('./parser');
const Interpreter = require('./interpreter');
const Profiler = require('./profiler');

// Test case for dynamic function reprioritization with < > for loop delimiters and * for increment
const code = `
let x = 10
routine add[a, b] ^
    return a + b
^

routine subtract[a, b] ^
    return a - b
^

x = add[x, 5]
x = subtract[x, 3]
x = add[x, 10]
x = subtract[x, 8]
x = subtract[x, 12]
x = add[x, 20]
x = subtract[x, 2]

for <let i = 0; i < 50; i*> ^ x = add[x, 1] ^
for <let i = 0; i < 51; i*> ^ x = subtract[x, 1] ^
`

const lexer = new Lexer(code);
const parser = new Parser(lexer);
const ast = parser.parse();

const profiler = new Profiler();
const interpreter = new Interpreter(ast, profiler);

interpreter.interpret();

console.log("Function Usage:", interpreter.getFunctionUsage());
console.log("Execution Priority:", interpreter.getExecutionPriority());
console.log("Profiler Logs:", profiler.getLogs());