# AgentFlow: Multi-Agent Orchestration CLI

## Introduction

This repository, `AgentFlow`, serves as a powerful Command Line Interface (CLI) tool for orchestrating multi-agent AI workflows. It integrates with large language models (LLMs) like Gemini and provides features for persistent memory, performance metrics, and extensibility.

## Features

*   **Multi-Agent Orchestration:** Allows for the definition and execution of multiple AI agents that can interact with each other in a structured workflow.
*   **Persistent Memory System:** Integrates a SQLite-based database to store conversational history and agent-specific states persistently.
*   **Performance Metrics (Token Usage):** Tracks and reports token usage for interactions with LLMs.
*   **LLM Integration:** Seamlessly integrates with LLMs, allowing their capabilities to be leveraged within agent workflows.
*   **Configurability:** Allows users to configure agent behaviors, memory settings, and LLM interaction parameters.
*   **Extensibility:** Agents are refactored into separate files to improve extensibility.
*   **Basic Unit Tests:** Includes a basic unit test for the memory system.
*   **GitHub Actions:** Basic CI workflow implemented for automated testing.
*   **Agent Tool Use (Placeholder):** Includes a placeholder for agents to utilize external tools.
*   **CLI Commands for Memory Management:** Provides command-line tools to manage conversation history.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/anchapin/AgentFlow.git
    cd AgentFlow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

### Running the Multi-Agent Scenario

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

### Running Tests

To run the basic unit tests:

```bash
npm test
```

## Future Enhancements

*   **User Interface:** Develop a more interactive CLI or web-based interface.
*   **Advanced Metrics:** Explore additional performance metrics beyond token usage, such as latency and cost estimation.
*   **Full Agent Tool Use:** Fully implement agents' ability to use external tools.
