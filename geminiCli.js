const { exec } = require('child_process');

let proQuotaExceeded = false;

async function callGeminiCli(prompt) {
  // Escape the prompt using JSON.stringify to handle special characters
  const escapedPrompt = JSON.stringify(prompt);
  const proCommand = `gemini -m gemini-2.5-pro -p ${escapedPrompt}`;
  const flashCommand = `gemini -m gemini-2.5-flash -p ${escapedPrompt}`;

  return new Promise(async (resolve, reject) => {
    const executeCommand = (command) => {
      return new Promise((res, rej) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            rej({ error, stdout, stderr });
          } else {
            res({ stdout, stderr });
          }
        });
      });
    };

    // Add a small delay to avoid hitting rate limits too quickly
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

    if (!proQuotaExceeded) {
      try {
        const proResult = await executeCommand(proCommand);
        resolve(proResult.stdout);
      } catch (proExecError) {
        console.warn(`Gemini Pro failed. Attempting fallback to Gemini Flash.`);
        if (proExecError.stderr && proExecError.stderr.includes("Quota exceeded")) {
          proQuotaExceeded = true; // Remember that pro quota is exceeded
        }
        try {
          const flashResult = await executeCommand(flashCommand);
          resolve(flashResult.stdout);
        } catch (flashExecError) {
          console.error(`Gemini Flash also failed: ${flashExecError.stderr || flashExecError.error?.message || flashExecError.message}`);
          reject(new Error(`Both Gemini Pro and Flash failed. Pro error: ${proExecError.stderr || proExecError.error?.message || proExecError.message}. Flash error: ${flashExecError.stderr || flashExecError.error?.message || flashExecError.message}`));
        }
      }
    } else {
      // If pro quota is already known to be exceeded, directly try flash
      console.warn("Gemini Pro quota previously exceeded. Directly attempting Gemini Flash.");
      try {
        const flashResult = await executeCommand(flashCommand);
        resolve(flashResult.stdout);
      } catch (flashExecError) {
        console.error(`Gemini Flash failed: ${flashExecError.stderr || flashExecError.error?.message || flashExecError.message}`);
        reject(new Error(`Gemini Flash failed: ${flashExecError.stderr || flashExecError.error?.message || flashExecError.message}`));
      }
    }
  });
}

module.exports = { callGeminiCli };
