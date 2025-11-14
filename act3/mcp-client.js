// act3/mcp-client.js
// ========================================================================
// STEP 1: Import required modules
// ========================================================================
import {Client} from '@modelcontextprotocol/sdk/client/index.js'
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js'

async function main() {
  console.log('Initializing MCP test client...')

  // ======================================================================
  // STEP 2: Create a client and transport
  // ======================================================================
  const client = new Client({
    name: 'prompts-test-client',
    version: '0.1.0',
  })

  const transport = new StdioClientTransport({
    // İstersen process.execPath de kullanabilirsin:
    // command: process.execPath,
    command: 'node',
    // Burayı kendi dosya yapına göre ayarla
    args: ['./act3/mcp-server.js'],
  })

  try {
    await client.connect(transport)
    console.log('Connected to server successfully!')

    // ====================================================================
    // STEP 3: List and display available resources
    // ====================================================================
    const resourcesList = await client.listResources()

    console.log('\nAvailable Resources:')
    const resources = resourcesList.resources || []
    const templates = resourcesList.resourceTemplates || []

    if (resources.length === 0 && templates.length === 0) {
      console.log('(no resources defined)')
    } else {
      resources.forEach((resource) => {
        console.log(`- ${resource.name}: ${resource.uri}`)
      })
      templates.forEach((t) => {
        console.log(`- TEMPLATE ${t.name}: ${t.uriTemplate}`)
      })
    }

    // ====================================================================
    // STEP 4: List and display available prompts
    // ====================================================================
    const promptsList = await client.listPrompts()

    console.log('\nAvailable Prompts:')
    promptsList.prompts.forEach((prompt) => {
      console.log(`- ${prompt.name}: ${prompt.description}`)
      if (prompt.arguments && prompt.arguments.length > 0) {
        console.log('  Arguments:')
        prompt.arguments.forEach((arg) => {
          console.log(
            `  - ${arg.name}${arg.required ? ' (required)' : ''}: ${arg.description}`
          )
        })
      }
    })

    // ====================================================================
    // STEP 5: Execute market-trend prompt (AAPL, 7 days)
    // ====================================================================
    console.log('\nExecuting market-trend prompt for AAPL...')

    const marketTrend = await client.getPrompt({
      name: 'market-trend',
      arguments: {
        symbol: 'AAPL',
        timeframe: '7',
      },
    })

    console.log('\nMarket Trend Analysis:')
    console.log(`Description: ${marketTrend.description}`)
    console.log('Messages:')

    marketTrend.messages.forEach((message) => {
      const contents = Array.isArray(message.content)
        ? message.content
        : [message.content]

      contents.forEach((part) => {
        if (part && part.type === 'text') {
          console.log(`[${message.role}]: ${part.text}`)
        }
      })
    })

    // ====================================================================
    // STEP 6: Execute market-crash-prediction prompt (severity 8)
    // ====================================================================
    console.log('\nExecuting market-crash-prediction prompt with severity 8...')

    const crashPrediction = await client.getPrompt({
      name: 'market-crash-prediction',
      arguments: {
        severity: '8',
      },
    })

    console.log('\nMarket Crash Prediction:')
    console.log(`Description: ${crashPrediction.description}`)
    console.log('Messages:')

    crashPrediction.messages.forEach((message) => {
      const contents = Array.isArray(message.content)
        ? message.content
        : [message.content]

      contents.forEach((part) => {
        if (part && part.type === 'text') {
          console.log(`[${message.role}]: ${part.text}`)
        }
      })
    })
  } catch (error) {
    console.error('Error:', error)
    process.exitCode = 1
  } finally {
    if (typeof client.dispose === 'function') {
      await client.dispose()
    }
    if (typeof transport.close === 'function') {
      transport.close()
    }
  }
}

main().catch((err) => {
  console.error('Unrecoverable error:', err)
  process.exit(1)
})
