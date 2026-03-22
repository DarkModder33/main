# TradeHax + PolyClaw Integration (2026)

## System Overview
The **TradeHax AI Assistant** has been upgraded with the **PolyClaw Skill**, allowing it to interface directly with Polymarket's CLOB and provide institutional-grade analysis for prediction markets.

### Key Features Integrated:
1.  **OpenClaw Brain**: High-accuracy LLM analysis for sentiment and market mispricing.
2.  **PolyClaw Skill**: Dedicated settlement adapter for Polymarket (`web/api/trading/settlement/adapters/polymarket-adapter.ts`).
3.  **Arb/Hedge Detection**: Logic to identify YES+NO < 1.00 opportunities automatically.
4.  **Neural Hub Mode**: A new `POLYCLAW` mode in the Neural Hub to visualize live signals.

### Codebase Changes:
-   **Execution Policy**: Added `polymarket-skill` profile in `web/shared/trading/execution-policy.js`.
-   **Settlement Engine**: Registered `polymarketSettlementAdapter` in the core trading gate.
-   **Signal Engine**: Created `web/src/engine/polymarket-strategy.js` for Arb-optimized decision making.
-   **UI Enhancement**: Integrated `PolyClawAssistant.jsx` into the main `NeuralHub.jsx` workflow.

### Usage:
1.  Navigate to **Neural Hub**.
2.  Select **POLYCLAW** from the mode dropdown.
3.  The sidebar will activate the live signal assistant.
4.  Trading commands like "Execute $50 arb split" are now supported via the Polymarket settlement adapter.

---
*Professional Build by TradeHax Engineering Team | March 2026*

