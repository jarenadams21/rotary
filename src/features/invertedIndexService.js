// src/features/invertedIndexService.js

class InvertedIndexService {
    constructor() {
        this.index = {};
    }

    buildIndex(docs) {
        docs.forEach(doc => {
            const tokens = doc.split(/\s+/);
            tokens.forEach(token => {
                if (!this.index[token]) {
                    this.index[token] = [];
                }
                this.index[token].push(doc);
            });
        });
    }

    search(term) {
        return this.index[term] || [];
    }
}

module.exports = InvertedIndexService;