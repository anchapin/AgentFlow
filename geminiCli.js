const { exec } = require('child_process');
const { getEncoding } = require('tiktoken');
const config = require('./config');

const encoding = getEncoding('cl100k_base');
let proQuotaExceeded = false;

async function callGeminiCli(prompt) {
  const escapedPrompt = JSON.stringify(prompt);
  const proCommand = `gemini -m ${config.gemini.proModel} -p ${escapedPrompt}`;
  const flashCommand = `gemini -m ${config.gemini.flashModel} -p ${escapedPrompt}`;

  const executeCommand = (command, model) => {
    return new Promise((res, rej) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          rej({ error, stdout, stderr });
        } else {
          const promptTokens = encoding.encode(prompt).length;
          const outputTokens = encoding.encode(stdout).length;
          console.log(`${model} Token Usage: ${promptTokens} (prompt) + ${outputTokens} (output) = ${promptTokens + outputTokens} (total)`);
          res({ stdout, stderr });
        }
      });
    });
  };

  await new Promise(resolve => setTimeout(resolve, config.gemini.rateLimitDelay));

  if (!proQuotaExceeded) {
    try {
      const proResult = await executeCommand(proCommand, 'Gemini 1.5 Pro');
      return proResult.stdout;
    } catch (proExecError) {
      console.warn('Gemini Pro failed. Attempting fallback to Gemini Flash.');
      if (proExecError.stderr && proExecError.stderr.includes('Quota exceeded')) {
        proQuotaExceeded = true;
      }
      try {
        const flashResult = await executeCommand(flashCommand, 'Gemini 1.5 Flash');
        return flashResult.stdout;
      } catch (flashExecError) {
        console.error(`Gemini Flash also failed: ${flashExecError.stderr || flashExecError.error?.message}`);
        throw new Error(`Both Gemini Pro and Flash failed. Pro error: ${proExecError.stderr || proExecError.error?.message}. Flash error: ${flashExecError.stderr || flashExecError.error?.message}`);
      }
    }
  } else {
    console.warn('Gemini Pro quota previously exceeded. Directly attempting Gemini Flash.');
    try {
      const flashResult = await executeCommand(flashCommand, 'Gemini 1.5 Flash');
      return flashResult.stdout;
    } catch (flashExecError) {
      console.error(`Gemini Flash failed: ${flashExecError.stderr || flashExecError.error?.message}`);
      throw new Error(`Gemini Flash failed: ${flashExecError.stderr || flashExecError.error?.message}`);
    }
  }
}

module.exports = { callGeminiCli };
