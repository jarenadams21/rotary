// src/memory.js

function* lazySequence(start, end) {
    for (let i = start; i <= end; i++) {
      yield i;
    }
  }
  
  module.exports = { lazySequence };