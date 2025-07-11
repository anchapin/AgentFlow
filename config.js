module.exports = {
  gemini: {
    defaultModel: 'gemini-1.5-flash',
    proModel: 'gemini-2.5-pro',
    flashModel: 'gemini-2.5-flash',
    rateLimitDelay: 1000, // milliseconds
  },
  agents: {
    maxTurns: 3,
  },
  memory: {
    dbDir: './.swarm',
    dbName: 'memory.db',
  },
};