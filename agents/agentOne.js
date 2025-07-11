const { callGeminiCli } = require("../geminiCli");
const { Memory } = require("../memory");

const memory = new Memory();

async function preCallHook(agentName, state) {
  console.log(`[Hook] Pre-call for ${agentName}. Current turn: ${state.turns}`);
}

async function postCallHook(agentName, state, response) {
  console.log(`[Hook] Post-call for ${agentName}. Response length: ${response.length}`);
}

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

module.exports = { agentOne };