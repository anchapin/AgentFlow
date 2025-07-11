const { startInteractiveCli } = require("./ui/cli");
const { startInteractiveCli } = require("./ui/cli");
const { Memory } = require("./memory");

async function runMultiAgentScenario() {
  const initialQuestion = "Explain the concept of recursion in programming.";
  const inputs = { question: initialQuestion }; // Messages will be loaded from DB
  console.log("Initial Question:", initialQuestion);

  let allMessages = []; // Messages will be accumulated from the stream

  const memory = new Memory(); // Create a new Memory instance

  try {
    for await (const output of await app.stream(inputs)) {
      if (output.agent_one) {
        const newMessage = output.agent_one.messages[output.agent_one.messages.length - 1];
        console.log("Agent One's response:", newMessage);
        allMessages.push(newMessage);
      } else if (output.agent_two) {
        const newMessage = output.agent_two.messages[output.agent_two.messages.length - 1];
        console.log("Agent Two's response:", newMessage);
        allMessages.push(newMessage);
      }
      console.log("\n---\n");
    }
    console.log("Final conversation history:", allMessages);
  } finally {
    memory.close(); // Ensure the database connection is closed
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--clear-memory') {
    const memory = new Memory();
    try {
      await memory.clearMessages();
      console.log("Memory cleared successfully.");
    } catch (error) {
      console.error("Failed to clear memory:", error);
    } finally {
      memory.close();
    }
  } else if (args[0] === '--view-memory') {
    const memory = new Memory();
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
    } finally {
      memory.close();
    }
  } else {
    startInteractiveCli();
  }
}

main();
