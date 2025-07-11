const { StateGraph } = require("@langchain/langgraph");
const { StateGraph } = require("@langchain/langgraph");
const { z } = require("zod");
const config = require('./config');
const { agentOne } = require('./agents/agentOne');
const { agentTwo } = require('./agents/agentTwo');

// Define the state of our graph using Zod
const graphState = {
  messages: {
    value: (x, y) => x.concat(y),
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
};

// Define a router to decide which agent to call next
const MAX_TURNS = config.agents.maxTurns; // Define a maximum number of turns for collaboration

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