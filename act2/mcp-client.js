// act2/mcp-client.js
// ========================================================================
// STEP 1: Import required modules
// ========================================================================
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Küçük yardımcı: başlık + URI → çıktı
async function printResource(client, title, uri) {
  const res = await client.readResource({ uri });
  const contents = res?.contents ?? [];
  const text = contents[0]?.text ?? "";

  console.log(`${title}:`);
  console.log("----------------------------------");
  console.log(text.trim());
  console.log("");
}

// ========================================================================
// STEP 2: Main
// ========================================================================
async function main() {
  console.log("Initializing MCP test client...");

  const client = new Client({
    name: "resource-client",
    version: "0.1.0",
  });

  // ÖNEMLİ: Sunucu path’i root dizine göre verilir
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["./act2/mcp-server.js"], // 🔧 BURASI DÜZELTİLDİ
  });

  try {
    await client.connect(transport);
    console.log("Connected to server successfully!\n");

    // ====================================================================
    // STEP 3: List resources
    // ====================================================================
    const listResult = await client.listResources();
    const resources = listResult.resources ?? [];
    const templates = listResult.resourceTemplates ?? [];

    console.log("Available Resources:");
    for (const r of resources) {
      console.log(`- ${r.name} (${r.uri})`);
    }
    console.log("");

    console.log("Resource Templates:");
    for (const t of templates) {
      console.log(`- ${t.name} (${t.uriTemplate})`);
    }
    console.log("");

    // ====================================================================
    // STEP 4: Read required resources
    // ====================================================================
    await printResource(
      client,
      "Recent Financial News",
      "news://finance/recent"
    );

    await printResource(
      client,
      "Market Prediction",
      "cassandra://prediction/market"
    );

    await printResource(
      client,
      "AAPL Historical Data",
      "market://historical/AAPL"
    );

    await printResource(
      client,
      "MSFT Historical Data",
      "market://historical/MSFT"
    );

    await printResource(
      client,
      "AAPL Current Data",
      "market://current/AAPL"
    );
  } catch (error) {
    console.error("Failed to connect or read resources:", error);
    process.exitCode = 1;
  } finally {
    if (typeof client.dispose === "function") {
      await client.dispose();
    }
    if (typeof transport.close === "function") {
      transport.close();
    }
  }
}

main().catch((err) => {
  console.error("Unrecoverable error:", err);
  process.exit(1);
});
