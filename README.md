# Shepherd MCP Client Proof of Concept

This repository demonstrates a proof-of-concept for generating structured training data for large language models using the Model Context Protocol (MCP) and Anthropic's Claude models. The current implementation is focused on generating JSONL-formatted play scripts for children, but the approach can be repurposed for other data generation tasks.

## Features
- Connects to an MCP server and lists available tools
- Uses Anthropic Claude to generate JSONL data in a specific format
- Example prompt and system prompt for generating kids' play scripts
- Easily extensible for other data generation use cases

## Setup

1. Set your Anthropic API key in a `.env` file in the project root:

```env
ANTHROPIC_API_KEY=your-key-here
```

2. Install dependencies in both the root and the `servers/faker` directory:

```bash
npm install
cd servers/faker
npm install
```

## Usage

### 1. Build the project

You must build the TypeScript files before running the client:

```bash
npm run build
cd servers/faker
npm run build
```

This will generate the necessary `.js` files in the `build/` directories.

### 2. Run the MCP client

Example command:

```bash
node build/index.js servers/faker/build/index.js
```

- The first argument is the path to the MCP server script (can be JS or Python).
- The query you enter at the command line does **not** affect the output; the prompt and system prompt are fixed for this proof of concept.

### 3. Interact

After starting, you can type any query (or just press enter). The client will generate a JSONL-formatted play script using the Anthropic Claude model and the tools provided by the MCP server.

## Prompts Used

- **System Prompt:**
  > You are a highly qualified playwrighter for kids' plays writing training data for a large language model.

- **Content Prompt:**
  > Your task is to generate JSONL data that generates a variety of play scripts using different children-friendly characters. Each script should be formatted in a way that is suitable for children, with clear dialogues and stage directions. ...

  (See `index.ts` for the full prompt.)

## Notes
- This is a proof of concept and can be repurposed to generate any kind of structured data you are interested in.
- The query you enter at the command line does not matter; the output is determined by the fixed prompts in the code.
- You can modify the prompts and system prompt in `index.ts` to suit your data generation needs.

## License
MIT
