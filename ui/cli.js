const readline = require('readline');
const { callGeminiCli } = require('../geminiCli');
const { Memory } = require('../memory');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startInteractiveCli() {
  const memory = new Memory();
  try {
    await memory.init();
  } catch (error) {
    console.error("Failed to initialize memory:", error);
    return;
  }

  console.log("Welcome to AgentFlow Interactive CLI!");
  console.log("Type your questions, or use commands: --view-memory, --clear-memory, --exit");

  rl.on('line', async (input) => {
    const trimmedInput = input.trim();

    if (trimmedInput === '--exit') {
      rl.close();
      memory.close();
      return;
    }

    if (trimmedInput === '--view-memory') {
      try {
        const messages = await memory.getMessages();
        if (messages.length > 0) {
          console.log("\n--- Conversation History ---");
          messages.forEach(msg => console.log(msg));
          console.log("----------------------------");
        } else {
          console.log("No conversation history found.");
        }
      } catch (error) {
        console.error("Failed to retrieve memory:", error);
      }
      rl.prompt();
      return;
    }

    if (trimmedInput === '--clear-memory') {
      try {
        await memory.clearMessages();
        console.log("Memory cleared successfully.");
      } catch (error) {
        console.error("Failed to clear memory:", error);
      }
      rl.prompt();
      return;
    }

    if (trimmedInput) {
      console.log(`You asked: ${trimmedInput}`);
      try {
        const response = await callGeminiCli(trimmedInput);
        console.log("AgentFlow Response:", response);
        await memory.addMessage({ role: 'user', content: trimmedInput });
        await memory.addMessage({ role: 'agent', content: response });
      } catch (error) {
        console.error("Error during agent interaction:", error);
      }
    }
    rl.prompt();
  });

  rl.on('close', () => {
    console.log("Exiting AgentFlow Interactive CLI. Goodbye!");
    process.exit(0);
  });

  rl.prompt();
}

module.exports = { startInteractiveCli };
