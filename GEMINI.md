# Project Overview

This is a Node.js project that appears to be a CLI tool for managing agents and potentially integrating with LangGraph. It includes modules for agents, metrics collection, and a UI.

## Key Files and Directories

- `index.js`: Main entry point of the application.
- `geminiCli.js`: Likely contains the core CLI logic.
- `langGraphIntegration.js`: Handles integration with LangGraph.
- `agents/`: Directory containing agent definitions (`agentOne.js`, `agentTwo.js`).
- `metrics/collector.js`: For collecting metrics.
- `tools/web_search.js`: A tool for web searching.
- `ui/cli.js`: User interface related to the CLI.
- `test/basic.test.js`: Contains basic tests for the project.
- `package.json`: Project metadata and dependencies.
- `PRD.md`: Product Requirements Document.

## Development Commands

### Install Dependencies
```bash
npm install
```

### Run Tests
To run the tests, you would typically use `npm test` or a specific test runner command if configured in `package.json`.

```bash
npm test
```

### Start the Application

To run the multi-agent conversation scenario:

```bash
agentflow [prompt]
```

### Command-Line Arguments

`agentflow` supports the following arguments:

*   `[prompt]`: An optional initial prompt for the multi-agent scenario. If not provided, a default question will be used.
    ```bash
    agentflow "Explain quantum entanglement."
    ```

*   `--help` or `-h`: Display usage information and available commands.
    ```bash
    agentflow --help
    ```

*   `--view-memory` or `-v`: View the stored conversation history.
    ```bash
    agentflow --view-memory
    ```

*   `--clear-memory` or `-c`: Clear the entire conversation history.
    ```bash
    agentflow --clear-memory
    ```

## Conventions

- **Language:** JavaScript (Node.js)
- **Testing Framework:** Likely `mocha` or `jest` given `basic.test.js` and `npm test` convention. Check `package.json` for specifics.
- **Code Style:** Follow existing code style in `.js` files.

## Important Notes

- Always check `package.json` for specific scripts and dependencies.
- The `PRD.md` file might contain important context regarding the project's goals and features.