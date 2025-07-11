const assert = require('assert');

// Basic test for memory.js
const { Memory } = require('../memory');

async function testMemory() {
  const memory = new Memory();
  await memory.saveMessage('user', 'Hello');
  await memory.saveMessage('assistant', 'Hi there!');
  const messages = await memory.getMessages();
  assert.strictEqual(messages.length, 2, 'Memory should have 2 messages');
  assert.strictEqual(messages[0], 'user: Hello', 'First message should be correct');
  assert.strictEqual(messages[1], 'assistant: Hi there!', 'Second message should be correct');
  memory.close();
  console.log('Memory tests passed!');
}

// Run all tests
async function runAllTests() {
  try {
    await testMemory();
    console.log('All tests passed!');
  } catch (error) {
    console.error('Tests failed:', error.message);
    process.exit(1);
  }
}

runAllTests();