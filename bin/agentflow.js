#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { runMultiAgentScenario } = require('../src/app.js');

yargs(hideBin(process.argv))
  .command('$0 [prompt]', 'Run the AgentFlow multi-agent scenario', (yargs) => {
    yargs
      .positional('prompt', {
        describe: 'An initial prompt for the multi-agent scenario',
        type: 'string',
      })
      .option('clear-memory', {
        alias: 'c',
        type: 'boolean',
        description: 'Clear conversation history',
      })
      .option('view-memory', {
        alias: 'v',
        type: 'boolean
',
        description: 'View conversation history',
      });
  }, async (argv) => {
    if (argv.clearMemory) {
      const { Memory } = require('../memory');
      const memory = new Memory();
      await memory.init();
      try {
        await memory.clearMessages();
        console.log("Memory cleared successfully.");
      } catch (error) {
        console.error("Failed to clear memory:", error);
      } finally {
        memory.close();
      }
    } else if (argv.viewMemory) {
      const { Memory } = require('../memory');
      const memory = new Memory();
      await memory.init();
      try {
        const messages = await memory.getMessages();
        if (messages.length > 0) {
          console.log("\n--- Conversation History ---");
          messages.forEach(msg => console.log(msg));
          console.log("----------------------------");
        } else {
          console.log("No conversation history found.");
        }
      } catch (error) {
        console.error("Failed to retrieve memory:", error);
      } finally {
        memory.close();
      }
    } else {
      runMultiAgentScenario(argv.prompt);
    }
  })
  .help()
  .alias('h', 'help')
  .argv;
