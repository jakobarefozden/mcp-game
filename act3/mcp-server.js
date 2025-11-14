// act3/mcp-server.js
// ========================================================================
// STEP 1: Import required modules
// ========================================================================
import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

async function main() {
  // ======================================================================
  // STEP 2: Create server with both resources and prompts capabilities
  // ======================================================================
  const server = new Server(
    {
      name: 'market-oracle',
      version: '0.1.0',
    },
    {
      capabilities: {
        resources: {}, // Resources capability
        prompts: {}, // Prompts capability
      },
    }
  )

  // ======================================================================
  // (Optional) resources/list – boş da olsa tanımlayalım
  // ======================================================================
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    // Bu görev prompt’lara odaklı, o yüzden sadece boş liste döndürüyoruz
    return {
      resources: [],
      resourceTemplates: [],
    }
  })

  // ======================================================================
  // STEP 3: Implement prompts listing (prompts/list)
  // ======================================================================
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: 'market-trend',
          description: 'Analyze market trend for a specific symbol',
          arguments: [
            {
              name: 'symbol',
              description: 'Stock symbol to analyze',
              required: true,
            },
            {
              name: 'timeframe',
              description: 'Analysis timeframe (days)',
              required: false,
            },
          ],
        },
        {
          name: 'market-crash-prediction',
          description: 'Predict potential market crashes or corrections',
          arguments: [
            {
              name: 'severity',
              description: 'Severity threshold (1-10)',
              required: false,
            },
          ],
        },
      ],
    }
  })

  // ======================================================================
  // STEP 4: Implement prompt execution (prompts/get)
  // ======================================================================
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const promptName = request.params.name
    const args = request.params.arguments || {}

    console.error(
      `Prompt requested: ${promptName} with args:`,
      args
    )

    if (promptName === 'market-trend') {
      const symbol = args.symbol || 'UNKNOWN'
      const timeframe = args.timeframe || '7'

      return {
        description: `Market trend analysis for ${symbol} over ${timeframe} days`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Analyze the market trend for ${symbol} over the next ${timeframe} days.`,
            },
          },
        ],
      }
    }

    if (promptName === 'market-crash-prediction') {
      const severity = args.severity || '5'

      // Görevde istenen metinle birebir uyumlu
      return {
        description: `Market crash prediction with severity threshold ${severity}`,
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Analyze the likelihood of a market crash or significant correction with severity threshold ${severity} (on a scale of 1-10).`,
            },
          },
        ],
      }
    }

    // Bilinmeyen prompt
    throw new Error(`Prompt not found: ${promptName}`)
  })

  // ======================================================================
  // STEP 5: Initialize and start the server
  // ======================================================================
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Prompts + Resources server running...')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
