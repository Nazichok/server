/* abstract */
class SessionStore {
  findSession(id: string): any | undefined {
    throw new Error("Method not implemented.");
  }
  saveSession(id: string, session: any): void {
    throw new Error("Method not implemented.");
  }
  findAllSessions(): any[] {
    throw new Error("Method not implemented.");
  }
}

class InMemorySessionStore extends SessionStore {
  private sessions: Map<string, any>;

  constructor() {
    super();
    this.sessions = new Map<string, any>();
  }

  findSession(id: string): any | undefined {
    return this.sessions.get(id);
  }

  saveSession(id: string, session: any): void {
    this.sessions.set(id, session);
  }

  findAllSessions(): any[] {
    return Array.from(this.sessions.values());
  }
}

export { InMemorySessionStore };

