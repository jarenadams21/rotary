// src/features/sessionManager.js

class SessionManager {
    constructor() {
        this.sessions = {};
    }

    startSession(id) {
        this.sessions[id] = {};
    }

    storeData(sessionID, key, value) {
        this.sessions[sessionID][key] = value;
    }

    getData(sessionID, key) {
        return this.sessions[sessionID][key];
    }

    endSession(sessionID) {
        delete this.sessions[sessionID];
    }
}

module.exports = SessionManager;