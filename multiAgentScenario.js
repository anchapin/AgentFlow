const { StateGraph } = require("@langchain/langgraph");
const { callGeminiCli } = require("./geminiCli");
const { z } = require("zod");
const { Memory } = require("./memory");

const memory = new Memory();

// Define the state of our graph using Zod
const graphState = {
  messages: {
    value: (x, y) => x.concat(y),
    default: async () => await memory.getMessages(),
    schema: z.array(z.string()),
  },
  turns: {
    value: (x, y) => x + y,
    default: () => 0,
    schema: z.number(),
  },
  question: {
    value: null,
    type: "string",
  },
  totalGeminiCalls: {
    value: (x, y) => x + y,
    default: () => 0,
    schema: z.number(),
  },
  totalInputCharacters: {
    value: (x, y) => x + y,
    default: () => 0,
    schema: z.number(),
  },
  totalOutputCharacters: {
    value: (x, y) => x + y,
    default: () => 0,
    schema: z.number(),
  },
};

// Define the first agent
async function preCallHook(agentName, state) {
  console.log(`[Hook] Pre-call for ${agentName}. Current turn: ${state.turns}`);
}

async function postCallHook(agentName, state, response) {
  console.log(`[Hook] Post-call for ${agentName}. Response length: ${response.length}`);
}

// Define the first agent
async function agentOne(state) {
  await preCallHook("Agent One", state);
  const currentQuestion = state.question;
  console.log("Agent One received question:", currentQuestion);
  const response = await callGeminiCli(`As Agent One, provide an initial answer to: ${currentQuestion}`);
  await postCallHook("Agent One", state, response);
  await memory.saveMessage("Agent One", response);
  return {
    messages: state.messages.concat(`Agent One: ${response}`),
    turns: state.turns + 1,
    totalGeminiCalls: state.totalGeminiCalls + 1,
    totalInputCharacters: state.totalInputCharacters + currentQuestion.length,
    totalOutputCharacters: state.totalOutputCharacters + response.length,
  };
}

// Define the second agent
async function agentTwo(state) {
  await preCallHook("Agent Two", state);
  const lastMessage = state.messages[state.messages.length - 1];
  const currentQuestion = state.question;
  console.log("Agent Two received message:", lastMessage);
  const response = await callGeminiCli(`As Agent Two, refine the following answer to "${currentQuestion}" based on this previous response: ${lastMessage}`);
  await postCallHook("Agent Two", state, response);
  await memory.saveMessage("Agent Two", response);
  return {
    messages: state.messages.concat(`Agent Two: ${response}`),
    turns: state.turns + 1,
    totalGeminiCalls: state.totalGeminiCalls + 1,
    totalInputCharacters: state.totalInputCharacters + lastMessage.length + currentQuestion.length,
    totalOutputCharacters: state.totalOutputCharacters + response.length,
  };
}

// Define a router to decide which agent to call next
const MAX_TURNS = 3; // Define a maximum number of turns for collaboration

function router(state) {
  if (state.turns >= MAX_TURNS) {
    return "__end__";
  }
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.includes("Agent One")) {
    return "agent_two";
  } else if (lastMessage.includes("Agent Two")) {
    return "agent_one";
  }
  return "agent_one"; // Start with agent one if no specific agent is mentioned
}

// Build the graph
const workflow = new StateGraph({ channels: graphState });

workflow.addNode("agent_one", agentOne);
workflow.addNode("agent_two", agentTwo);

workflow.setEntryPoint("agent_one");

workflow.addConditionalEdges(
  "agent_one",
  router,
  { agent_two: "agent_two", __end__: "__end__" }
);

workflow.addConditionalEdges(
  "agent_two",
  router,
  { agent_one: "agent_one", __end__: "__end__" }
);

const app = workflow.compile();

module.exports = { app };