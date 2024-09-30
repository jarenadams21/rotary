// src/profiler.js

class Profiler {
    constructor(refinementService) {
        this.logs = [];
        this.reasoningLogs = [];
        this.refinementService = refinementService;
    }

    log(operation) {
        this.logs.push({ operation, timestamp: new Date() });
    }

    refineExecution(operation) {
        this.reasoningLogs.push(`Refining execution of ${operation}`);
        this.refinementService.refineBasedOnFrequency(operation);
    }

    getLogs() {
        return this.logs;
    }

    getReasoningLogs() {
        return this.reasoningLogs;
    }

    discardReasoningLogs() {
        this.reasoningLogs = [];
    }
}

module.exports = Profiler;