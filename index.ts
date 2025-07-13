import { Anthropic } from '@anthropic-ai/sdk'
import {
  MessageParam,
  Tool,
} from '@anthropic-ai/sdk/resources/messages/messages.mjs'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import readline from 'readline/promises'
import dotenv from 'dotenv'

dotenv.config()

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set')
}

class MCPClient {
  private mcp: Client
  private anthropic: Anthropic
  private transport: StdioClientTransport | null = null
  private tools: Tool[] = []

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    })
    this.mcp = new Client({ name: 'mcp-client-cli', version: '1.0.0' })
  }

  async connectToServer(serverScriptPath: string) {
    try {
      const isJs = serverScriptPath.endsWith('.js')
      const isPy = serverScriptPath.endsWith('.py')
      if (!isJs && !isPy) {
        throw new Error('Server script must be a .js or .py file')
      }
      const command = isPy
        ? process.platform === 'win32'
          ? 'python'
          : 'python3'
        : process.execPath

      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
      })
      await this.mcp.connect(this.transport)

      const toolsResult = await this.mcp.listTools()
      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        }
      })
      console.log(
        'Connected to server with tools:',
        this.tools.map(({ name }) => name),
      )
    }
    catch (e) {
      console.log('Failed to connect to MCP server: ', e)
      throw e
    }
  }

  async processQuery(query: string) {
    const messages: MessageParam[] = [
      {
        role: 'user',
        content: `
Your task is to generate JSONL data that generates a variety of play scripts using different children-friendly characters.
Each script should be formatted in a way that is suitable for children, with clear dialogues and stage directions.

You only respond with one single JSONL response.
Always start with the same system prompt: {"role": "system", "content": "A conversation between a user and a helpful assistant. Taking the role as a play writer assistant for a kids' play."}
Vary the character in the user request: {"role": "user", "content": "generate a script about The Wise Owl"}
Generate a new script for each request, ensuring it is suitable for children.:  {"role": "assistant", "content": "<center>Act One</center>\n\n<center>Scene 1</center>\n\n<stage>A moonlit forest clearing. Night time. An ancient oak tree dominates the center.</stage>\n\n<center>PROFESSOR FINCH</center>\n\n<dialog>I've been searching these woods for hours. The rare night owl must be somewhere!</dialog>\n\n<center>OWL</center>\n\n<dialog>Perhaps what you seek has been watching you all along.</dialog>\n\n<stage>PROFESSOR FINCH jumps, startled, and looks up to see OWL perched on a branch above.</stage>\n\n<center>PROFESSOR FINCH</center>\n\n<dialog>Magnificent! A Tawny Owl with the ability to speak!</dialog>\n\n<center>OWL</center>\n\n<dialog>All creatures speak. Few humans listen.</dialog>"}]

Only generate ONE system prompt, ONE user request, and ONE assistant response in the JSONL format.

Use the tools provided to vary the characters and themes of the plays.

Example:
[{"role": "system", "content": "A conversation between a user and a helpful assistant. Taking the role as a play writer assistant for a kids' play."}, {"role": "user", "content": "generate a script about The Wise Owl"}, {"role": "assistant", "content": "<center>Act One</center>\n\n<center>Scene 1</center>\n\n<stage>A moonlit forest clearing. Night time. An ancient oak tree dominates the center.</stage>\n\n<center>PROFESSOR FINCH</center>\n\n<dialog>I've been searching these woods for hours. The rare night owl must be somewhere!</dialog>\n\n<center>OWL</center>\n\n<dialog>Perhaps what you seek has been watching you all along.</dialog>\n\n<stage>PROFESSOR FINCH jumps, startled, and looks up to see OWL perched on a branch above.</stage>\n\n<center>PROFESSOR FINCH</center>\n\n<dialog>Magnificent! A Tawny Owl with the ability to speak!</dialog>\n\n<center>OWL</center>\n\n<dialog>All creatures speak. Few humans listen.</dialog>"}]

JSONL format:
`,
      },
    ]

    const SYSTEM_PROMPT = "You are a highly qualified playwrighter for kids' plays writing training data for a large language model."

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
      tools: this.tools,
    })

    const finalText = []

    for (const content of response.content) {
      if (content.type === 'text') {
        finalText.push(content.text)
      }
      else if (content.type === 'tool_use') {
        const toolName = content.name
        const toolArgs = content.input as { [x: string]: unknown } | undefined

        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs,
        })
        finalText.push(
          `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`,
        )

        messages.push({
          role: 'user',
          content: result.content as string,
        })

        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages,
        })

        finalText.push(
          response.content[0].type === 'text' ? response.content[0].text : '',
        )
      }
    }

    return finalText.join('\n')
  }

  async chatLoop() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    try {
      console.log('\nMCP Client Started!')
      console.log('Type your queries or \'quit\' to exit.')

      while (true) {
        const message = await rl.question('\nQuery: ')
        if (message.toLowerCase() === 'quit') {
          break
        }
        const response = await this.processQuery(message)
        console.log('\n' + response)
      }
    }
    finally {
      rl.close()
    }
  }

  async cleanup() {
    await this.mcp.close()
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: node index.ts <path_to_server_script>')
    return
  }
  const mcpClient = new MCPClient()
  try {
    await mcpClient.connectToServer(process.argv[2])
    await mcpClient.chatLoop()
  }
  finally {
    await mcpClient.cleanup()
    process.exit(0)
  }
}

main()
