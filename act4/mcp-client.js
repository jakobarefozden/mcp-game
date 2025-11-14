// mcp-client.js
import {Client} from '@modelcontextprotocol/sdk/client/index.js'
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js'

async function main() {
  console.log('Initializing MCP test client...')

  const client = new Client({
    name: 'market-mcp-client',
    version: '1.0.0',
  })

  // IMPORTANT: This must match your file location
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./act4/mcp-server.js'], // <-- sadece bu yolu doğru ayarlaman gerekiyor
  })

  try {
    await client.connect(transport)
    console.log('Connected to server successfully!\n')

    // List available tools
    const toolsResponse = await client.listTools()

    console.log('Available Tools:')
    toolsResponse.tools.forEach((tool) => {
      console.log(`- ${tool.name}: ${tool.description}`)
      if (tool.inputSchema?.properties) {
        console.log('  Parameters:')
        for (const [key, schema] of Object.entries(tool.inputSchema.properties)) {
          const isRequired =
            Array.isArray(tool.inputSchema.required) &&
            tool.inputSchema.required.includes(key)

          console.log(
            `  - ${key}${isRequired ? ' (required)' : ''}: ${
              schema.description ?? ''
            }`
          )
        }
        console.log('')
      }
    })

    // --------------------------------------------------------------------
    // Execute market-trend tool
    // --------------------------------------------------------------------
    console.log('Executing market-trend tool for AAPL...\n')

    const trend = await client.callTool({
      name: 'market-trend',
      arguments: {symbol: 'AAPL', timeframe: 7},
    })

    console.log('Market Trend Analysis:')
    console.log(trend.content?.[0]?.text ?? '(no content)')
    console.log('')

    // --------------------------------------------------------------------
    // Execute crash prediction
    // --------------------------------------------------------------------
    console.log('Executing market-crash-prediction tool with severity 8...\n')

    const crash = await client.callTool({
      name: 'market-crash-prediction',
      arguments: {severity: 8},
    })

    console.log('Market Crash Prediction:')
    console.log(crash.content?.[0]?.text ?? '(no content)')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    if (typeof client.dispose === 'function') await client.dispose()
    if (typeof transport.close === 'function') transport.close()
  }
}

main().catch((err) => {
  console.error('Unrecoverable error:', err)
})
