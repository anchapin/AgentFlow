const { callGeminiCli } = require("../geminiCli");
const { Memory } = require("../memory");

const memory = new Memory();

async function preCallHook(agentName, state) {
  console.log(`[Hook] Pre-call for ${agentName}. Current turn: ${state.turns}`);
}

async function postCallHook(agentName, state, response) {
  console.log(`[Hook] Post-call for ${agentName}. Response length: ${response.length}`);
}

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
    totalGeminiCalls: (state.totalGeminiCalls || 0) + 1,
    totalInputCharacters: (state.totalInputCharacters || 0) + lastMessage.length + currentQuestion.length,
    totalOutputCharacters: (state.totalOutputCharacters || 0) + response.length,
  };
}

module.exports = { agentTwo };