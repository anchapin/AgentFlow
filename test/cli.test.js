const assert = require('assert');
const sinon = require('sinon');
const { EventEmitter } = require('events');

// Mock readline interface
class MockReadline extends EventEmitter {
  constructor() {
    super();
    this.output = [];
    this.prompt = sinon.stub();
    this.close = sinon.stub();
  }

  write(data) {
    this.output.push(data);
  }
}

// Mock Memory class
class MockMemory {
  constructor() {
    this.messages = [];
    this.init = sinon.stub().resolves();
    this.addMessage = sinon.stub().callsFake((msg) => this.messages.push(msg));
    this.getMessages = sinon.stub().callsFake(() => this.messages);
    this.clearMessages = sinon.stub().callsFake(() => { this.messages = []; });
    this.close = sinon.stub();
  }
}

// Mock geminiCli
const mockGeminiCli = {
  callGeminiCli: sinon.stub()
};

// Import the module to be tested after mocks are defined
const proxyquire = require('proxyquire');
const { startInteractiveCli } = proxyquire('../ui/cli', {
  'readline': {
    createInterface: () => new MockReadline()
  },
  '../geminiCli': mockGeminiCli,
  '../memory': { Memory: MockMemory }
});

describe('Interactive CLI', () => {
  let mockRl;
  let mockMemoryInstance;

  beforeEach(() => {
    mockRl = new MockReadline();
    mockMemoryInstance = new MockMemory();
    mockGeminiCli.callGeminiCli.resetHistory();

    // Re-proxyquire for each test to get fresh mocks
    const proxiedCli = proxyquire('../ui/cli', {
      'readline': {
        createInterface: () => mockRl
      },
      '../geminiCli': mockGeminiCli,
      '../memory': { Memory: sinon.stub().returns(mockMemoryInstance) }
    });
    // Assign the function to a global or directly call it if not exported
    // For this test, we'll call it directly in each test case.
  });

  it('should display welcome message and prompt on start', async () => {
    const consoleLogSpy = sinon.spy(console, 'log');
    await startInteractiveCli();
    assert(consoleLogSpy.calledWith('Welcome to AgentFlow Interactive CLI!'));
    assert(consoleLogSpy.calledWith('Type your questions, or use commands: --view-memory, --clear-memory, --exit'));
    assert(mockRl.prompt.calledOnce);
    consoleLogSpy.restore();
  });

  it('should exit on --exit command', async () => {
    await startInteractiveCli();
    mockRl.emit('line', '--exit');
    assert(mockRl.close.calledOnce);
    assert(mockMemoryInstance.close.calledOnce);
  });

  it('should view memory on --view-memory command', async () => {
    const consoleLogSpy = sinon.spy(console, 'log');
    mockMemoryInstance.addMessage({ role: 'user', content: 'test message' });

    await startInteractiveCli();
    mockRl.emit('line', '--view-memory');

    assert(consoleLogSpy.calledWith('\n--- Conversation History ---'));
    assert(consoleLogSpy.calledWith({ role: 'user', content: 'test message' }));
    assert(mockRl.prompt.calledTwice); // Initial prompt + after command
    consoleLogSpy.restore();
  });

  it('should clear memory on --clear-memory command', async () => {
    const consoleLogSpy = sinon.spy(console, 'log');
    mockMemoryInstance.addMessage({ role: 'user', content: 'test message' });

    await startInteractiveCli();
    mockRl.emit('line', '--clear-memory');

    assert(mockMemoryInstance.clearMessages.calledOnce);
    assert(consoleLogSpy.calledWith('Memory cleared successfully.'));
    assert(mockRl.prompt.calledTwice);
    consoleLogSpy.restore();
  });

  it('should call Gemini CLI and save messages for regular input', async () => {
    const testInput = 'What is the capital of France?';
    const testResponse = 'Paris';
    mockGeminiCli.callGeminiCli.resolves(testResponse);
    const consoleLogSpy = sinon.spy(console, 'log');

    await startInteractiveCli();
    mockRl.emit('line', testInput);

    assert(mockGeminiCli.callGeminiCli.calledWith(testInput));
    assert(mockMemoryInstance.addMessage.calledWith({ role: 'user', content: testInput }));
    assert(mockMemoryInstance.addMessage.calledWith({ role: 'agent', content: testResponse }));
    assert(consoleLogSpy.calledWith('AgentFlow Response:', testResponse));
    assert(mockRl.prompt.calledTwice);
    consoleLogSpy.restore();
  });

  it('should handle errors during Gemini CLI call', async () => {
    const testInput = 'Error test';
    const errorMessage = 'API error';
    mockGeminiCli.callGeminiCli.rejects(new Error(errorMessage));
    const consoleErrorSpy = sinon.spy(console, 'error');

    await startInteractiveCli();
    mockRl.emit('line', testInput);

    assert(consoleErrorSpy.calledWith('Error during agent interaction:', sinon.match.instanceOf(Error)));
    assert(mockRl.prompt.calledTwice);
    consoleErrorSpy.restore();
  });
});
