import * as vscode from "vscode";
import axios from "axios";

export function activate(context: vscode.ExtensionContext) {
  console.log("TradeHax extension is now active");

  // Command: Open Dashboard
  const openDashboard = vscode.commands.registerCommand(
    "tradehax.openDashboard",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "tradehaxDashboard",
        "TradeHax Bot Dashboard",
        vscode.ViewColumn.One,
        { enableScripts: true }
      );

      const apiUrl = vscode.workspace
        .getConfiguration("tradehax")
        .get("apiUrl", "http://localhost:3000");

      panel.webview.html = getWebviewContent(apiUrl);
    }
  );

  // Command: Create Bot
  const createBot = vscode.commands.registerCommand(
    "tradehax.createBot",
    async () => {
      const name = await vscode.window.showInputBox({
        prompt: "Enter bot name",
        placeholder: "My Trading Bot",
      });

      if (!name) return;

      const strategy = await vscode.window.showQuickPick(
        ["scalping", "swing", "long-term", "arbitrage"],
        { placeHolder: "Select strategy" }
      );

      if (!strategy) return;

      try {
        const apiUrl = vscode.workspace
          .getConfiguration("tradehax")
          .get("apiUrl", "http://localhost:3000");

        const response = await axios.post(`${apiUrl}/api/trading/bot/create`, {
          name,
          strategy,
          riskLevel: "medium",
          allocatedCapital: 5,
        });

        vscode.window.showInformationMessage(
          `✅ Bot "${name}" created successfully!`
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to create bot: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  );

  // Command: View Stats
  const viewStats = vscode.commands.registerCommand(
    "tradehax.viewStats",
    async () => {
      const botId = await vscode.window.showInputBox({
        prompt: "Enter bot ID",
        placeholder: "bot-123456",
      });

      if (!botId) return;

      try {
        const apiUrl = vscode.workspace
          .getConfiguration("tradehax")
          .get("apiUrl", "http://localhost:3000");

        const response = await axios.get(
          `${apiUrl}/api/trading/bot/${botId}/stats`
        );

        const stats = response.data.stats;
        vscode.window.showInformationMessage(
          `📊 Bot Stats:\n\n` +
            `Trades: ${stats.totalTrades}\n` +
            `Win Rate: ${stats.winRate}%\n` +
            `Profit: ${stats.netProfit} SOL`
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to fetch stats: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  );

  context.subscriptions.push(openDashboard, createBot, viewStats);
}

function getWebviewContent(apiUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>TradeHax Dashboard</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #0f172a;
          color: #e2e8f0;
          padding: 20px;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          color: #10b981;
          margin-bottom: 20px;
        }
        .bot-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .bot-card {
          background: #1e293b;
          border: 1px solid #10b981;
          border-radius: 8px;
          padding: 20px;
        }
        .bot-title {
          font-weight: bold;
          color: #10b981;
          margin-bottom: 10px;
        }
        .stat {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          padding: 8px 0;
          border-bottom: 1px solid #334155;
        }
        button {
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
          width: 100%;
        }
        button:hover {
          background: #059669;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 TradeHax Bot Dashboard</h1>
        <p>API: ${apiUrl}</p>
        <div class="bot-grid" id="botsContainer">
          <div style="grid-column: 1/-1; text-align: center; color: #64748b;">
            Loading bots...
          </div>
        </div>
      </div>

      <script>
        const apiUrl = "${apiUrl}";

        async function loadBots() {
          try {
            // TODO: Fetch bots from API
            const container = document.getElementById("botsContainer");
            container.innerHTML = \`
              <div class="bot-card">
                <div class="bot-title">Scalping Bot Alpha</div>
                <div class="stat">
                  <span>Status:</span>
                  <strong style="color: #10b981;">Active</strong>
                </div>
                <div class="stat">
                  <span>Win Rate:</span>
                  <strong>83.3%</strong>
                </div>
                <div class="stat">
                  <span>Net Profit:</span>
                  <strong style="color: #10b981;">2.45 SOL</strong>
                </div>
                <button onclick="alert('Bot details')">View Details</button>
              </div>
            \`;
          } catch (error) {
            console.error("Failed to load bots:", error);
          }
        }

        loadBots();
        setInterval(loadBots, 5000);
      </script>
    </body>
    </html>
  `;
}

export function deactivate() {
  console.log("TradeHax extension deactivated");
}
