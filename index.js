const { exec } = require('child_process');

const prompt = '"Hello, world!"';

exec(`gemini -p ${prompt}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
});