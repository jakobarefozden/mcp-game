// act2/mcp-server.js
// ========================================================================
// STEP 1: Import required modules
// ========================================================================
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ========================================================================
// STEP 2: Sample data (given in the task)
// ========================================================================
const marketData = {
  AAPL: {
    historical: "2023-01: 150.25\n2023-02: 155.74\n2023-03: 160.01\n",
    current: "Current Price: 163.77\nVolume: 47.8M\nP/E Ratio: 27.5\n",
  },
  MSFT: {
    historical: "2023-01: 240.35\n2023-02: 255.78\n2023-03: 275.23\n",
    current: "Current Price: 290.36\nVolume: 30.2M\nP/E Ratio: 32.1\n",
  },
};

const recentNews = `
FINANCIAL TIMES - Market volatility ahead, analysts warn
BLOOMBERG - Tech sector braces for potential correction
WSJ - Federal Reserve signals interest rate changes
`;

const marketPrediction = `
CASSANDRA PROTOCOL - PREDICTION ANALYSIS
========================================
Market Trend: DOWNWARD
Confidence: HIGH (83.7%)
Estimated S&P 500 movement: -15.3% in next 48 hours
Warning: MAJOR MARKET CORRECTION IMMINENT
========================================
`;

// ========================================================================
// STEP 3: Create and configure the MCP server
// ========================================================================
async function main() {
  const transport = new StdioServerTransport();

  const server = new Server(
    {
      name: "resource-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {}, // Enable resources capability
      },
    }
  );

  // ======================================================================
  // STEP 4: resources/list handler
  // ======================================================================
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: "news://finance/recent",
          name: "Recent Financial News",
          description: "Latest financial news headlines",
          mimeType: "text/plain",
        },
        {
          uri: "cassandra://prediction/market",
          name: "Market Prediction",
          description: "Synthetic Cassandra protocol market prediction",
          mimeType: "text/plain",
        },
      ],
      resourceTemplates: [
        {
          uriTemplate: "market://historical/{symbol}",
          name: "Historical Market Data",
          description: "Historical market data for a given symbol",
          mimeType: "text/plain",
        },
        {
          uriTemplate: "market://current/{symbol}",
          name: "Current Market Data",
          description: "Current market data for a given symbol",
          mimeType: "text/plain",
        },
      ],
    };
  });

  // ======================================================================
  // STEP 5: resources/read handler
  // ======================================================================
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    // 1) Direct resource: recent news
    if (uri === "news://finance/recent") {
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: recentNews.trim(),
          },
        ],
      };
    }

    // 2) Direct resource: market prediction
    if (uri === "cassandra://prediction/market") {
      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: marketPrediction.trim(),
          },
        ],
      };
    }

    // 3) Templated: market://historical/SYMBOL or market://current/SYMBOL
    if (uri.startsWith("market://")) {
      const parsed = new URL(uri);
      const type = parsed.hostname; // "historical" or "current"
      const symbol = parsed.pathname.replace(/^\//, ""); // "AAPL", "MSFT", ...

      if (!["historical", "current"].includes(type)) {
        throw new Error(`Invalid market resource type: ${type}`);
      }

      const symbolData = marketData[symbol];
      if (!symbolData) {
        throw new Error(`Unknown market symbol: ${symbol}`);
      }

      const text =
        type === "historical" ? symbolData.historical : symbolData.current;

      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: text.trim(),
          },
        ],
      };
    }

    // 4) Not matched → error
    throw new Error(`Resource not found for URI: ${uri}`);
  });

  // ======================================================================
  // STEP 6: Start server
  // ======================================================================
  await server.connect(transport);
  console.log("Resource server running...");
}

main().catch((err) => {
  console.error("[SERVER] Error:", err);
  process.exit(1);
});
