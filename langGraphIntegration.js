const { StateGraph } = require("@langchain/langgraph");
const { callGeminiCli } = require("./geminiCli");

// Define the state of our graph
const graphState = {
  question: {
    value: null,
    type: "string",
  },
  answer: {
    value: null,
    type: "string",
  },
};

// Define the nodes of our graph
async function callGemini(state) {
  console.log("Calling Gemini with question:", state.question);
  const geminiOutput = await callGeminiCli(state.question);
  return { answer: geminiOutput };
}

// Build the graph
const workflow = new StateGraph({ typ: "object", properties: graphState });

workflow.addNode("gemini_call", callGemini);

workflow.setEntryPoint("gemini_call");
workflow.setFinishPoint("gemini_call");

const app = workflow.compile();

module.exports = { app };
