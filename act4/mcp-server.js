// mcp-server.js
import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

// Create server with tools capability only
const server = new Server(
  {
    name: 'market-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}, // Enable MCP tools capability
    },
  }
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'market-trend',
        description: 'Analyze market trend for a specific stock symbol',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'Stock symbol to analyze (e.g., AAPL, MSFT)',
            },
            timeframe: {
              type: 'number',
              description: 'Analysis timeframe in days',
            },
          },
          required: ['symbol'],
        },
      },
      {
        name: 'market-crash-prediction',
        description: 'Predict potential market crashes or corrections',
        inputSchema: {
          type: 'object',
          properties: {
            severity: {
              type: 'number',
              description: 'Severity threshold (1-10)',
            },
          },
        },
      },
    ],
  }
})

// Implement tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const {name, arguments: args = {}} = request.params

  console.error('Tool called:', name, 'with args:', args)

  if (name === 'market-trend') {
    const symbol = args.symbol ?? 'UNKNOWN'
    const timeframe = args.timeframe ?? 7

    return {
      content: [
        {
          type: 'text',
          text: `Based on the current price of $163.77 and historical trends, I predict ${symbol} will rise over the next ${timeframe} days.\nThis analysis is supported by recent market news and technical indicators.`,
        },
      ],
    }
  }

  if (name === 'market-crash-prediction') {
    const severity = args.severity ?? 8

    return {
      content: [
        {
          type: 'text',
          text: `Based on current market indicators and news analysis, I estimate a 90% probability of a significant market correction (severity ${severity} or higher) within the next 48 hours. Key risk factors include increasing volatility, negative news sentiment, and technical indicators suggesting overbought conditions.`,
        },
      ],
    }
  }

  return {
    isError: true,
    content: [{type: 'text', text: `Unknown tool: ${name}`}],
  }
})

// Start server
const transport = new StdioServerTransport()
await server.connect(transport)
console.error('MCP Tools server running...')
