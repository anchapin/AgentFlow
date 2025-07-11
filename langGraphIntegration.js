const { StateGraph } = require("@langchain/langgraph");
const { callGeminiCli } = require("./geminiCli");
const { Memory } = require("./memory");

const graphState = {
  question: { value: null, type: "string" },
  answer: { value: null, type: "string" },
  history: { value: () => [], type: "array" },
};

async function callGemini(state) {
  console.log("Calling Gemini with question:", state.question);
  const memory = new Memory();
  const history = await memory.getMessages();
  const fullPrompt = `History:\n${history.join("\n")}\n\nQuestion: ${state.question}`;
  const geminiOutput = await callGeminiCli(fullPrompt);
  await memory.saveMessage("user", state.question);
  await memory.saveMessage("assistant", geminiOutput);
  memory.close();
  return { answer: geminiOutput };
}

const workflow = new StateGraph({ typ: "object", properties: graphState });

workflow.addNode("gemini_call", callGemini);
workflow.setEntryPoint("gemini_call");
workflow.setFinishPoint("gemini_call");

const app = workflow.compile();

module.exports = { app };
