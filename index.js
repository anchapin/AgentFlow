const { app } = require("./multiAgentScenario");
const { Memory } = require("./memory");

const memory = new Memory();

async function runMultiAgentScenario() {
  const initialQuestion = "Explain the concept of recursion in programming.";
  const inputs = { messages: await memory.getMessages(), question: initialQuestion };
  console.log("Initial Question:", initialQuestion);

  let finalState = { // Initialize finalState outside the loop
    messages: [],
    turns: 0,
    question: initialQuestion,
    totalGeminiCalls: 0,
    totalInputCharacters: 0,
    totalOutputCharacters: 0,
  };

  try {
    for await (const output of await app.stream(inputs)) {
      // Accumulate messages and metrics
      if (output.agent_one) {
        const newMessage = output.agent_one.messages[output.agent_one.messages.length - 1];
        console.log("Agent One's response:", newMessage);
        finalState.messages.push(newMessage);
        finalState.totalGeminiCalls += output.agent_one.totalGeminiCalls;
        finalState.totalInputCharacters += output.agent_one.totalInputCharacters;
        finalState.totalOutputCharacters += output.agent_one.totalOutputCharacters;
        finalState.turns = output.agent_one.turns;
      } else if (output.agent_two) {
        const newMessage = output.agent_two.messages[output.agent_two.messages.length - 1];
        console.log("Agent Two's response:", newMessage);
        finalState.messages.push(newMessage);
        finalState.totalGeminiCalls += output.agent_two.totalGeminiCalls;
        finalState.totalInputCharacters += output.agent_two.totalInputCharacters;
        finalState.totalOutputCharacters += output.agent_two.totalOutputCharacters;
        finalState.turns = output.agent_two.turns;
      }
      console.log("\n---\n");
    }
    console.log("Final conversation history:", finalState.messages);
    console.log("\n--- Performance Metrics ---");
    console.log("Total Gemini Calls:", finalState.totalGeminiCalls);
    console.log("Total Input Characters:", finalState.totalInputCharacters);
    console.log("Total Output Characters:", finalState.totalOutputCharacters);
  } finally {
    memory.close();
  }
}

runMultiAgentScenario();