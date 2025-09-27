import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import {
  Client,
  AccountId,
  PrivateKey,
  AccountBalanceQuery,
} from "@hashgraph/sdk";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Hedera client (demo mode)
let hederaClient = null;
let operatorId = null;

async function initializeHedera() {
  try {
    console.log("🔧 Initializing Hedera client...");

    // Check if we have real credentials
    if (
      process.env.HEDERA_OPERATOR_ID &&
      process.env.HEDERA_OPERATOR_KEY &&
      process.env.HEDERA_OPERATOR_ID !== "0.0.YOUR_ACCOUNT_ID" &&
      process.env.HEDERA_OPERATOR_KEY !== "YOUR_PRIVATE_KEY_HERE"
    ) {
      // Use real credentials
      operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
      const operatorKey = PrivateKey.fromString(
        process.env.HEDERA_OPERATOR_KEY
      );

      hederaClient = Client.forTestnet();
      hederaClient.setOperator(operatorId, operatorKey);

      // Test connection
      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(operatorId)
        .execute(hederaClient);

      console.log(`✅ Hedera client initialized for account: ${operatorId}`);
      console.log(`📊 Account balance: ${accountBalance.hbars.toString()}`);
    } else {
      // Demo mode - no real credentials
      console.log(
        "⚠️  Running in DEMO mode - no real Hedera credentials found"
      );
      console.log("📋 To use real Hedera integration, set:");
      console.log("   HEDERA_OPERATOR_ID=0.0.123456 (your actual account ID)");
      console.log("   HEDERA_OPERATOR_KEY=302e... (your actual private key)");

      // Set demo values
      operatorId = "demo-mode";
      hederaClient = "demo-client";
    }
  } catch (error) {
    console.error("❌ Hedera initialization failed:", error.message);
    console.log("⚠️  Falling back to demo mode");
    operatorId = "demo-mode";
    hederaClient = "demo-client";
  }
}

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    hedera: {
      initialized: hederaClient !== null,
      mode: operatorId === "demo-mode" ? "demo" : "live",
      operatorId:
        operatorId === "demo-mode" ? "demo-mode" : operatorId.toString(),
    },
  });
});

app.get("/api/hedera/status", (req, res) => {
  if (operatorId === "demo-mode") {
    res.json({
      initialized: true,
      mode: "demo",
      operatorAccount: "demo-mode",
      balance: { accountId: "demo", hbars: "100.00 ℏ", tokens: {} },
      network: "testnet",
      timestamp: new Date().toISOString(),
      message: "Demo mode - add real credentials to .env for live connection",
    });
  } else {
    res.json({
      initialized: true,
      mode: "live",
      operatorAccount: operatorId.toString(),
      network: "testnet",
      timestamp: new Date().toISOString(),
    });
  }
});

// Demo endpoint
app.get("/api/hedera/demo", (req, res) => {
  res.json({
    message: "Hedera integration is ready!",
    setup: {
      dependencies: ["@hashgraph/sdk", "express", "dotenv", "body-parser"],
      status: "All dependencies installed ✅",
      nextSteps: [
        "1. Get testnet credentials from portal.hedera.com",
        "2. Update .env file with your HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY",
        "3. Restart the server",
        "4. Test with /api/hedera/status endpoint",
      ],
    },
    documentation: "See HEDERA_SETUP.md for detailed instructions",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
async function startServer() {
  try {
    await initializeHedera();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `🔍 Hedera status: http://localhost:${PORT}/api/hedera/status`
      );
      console.log(`🎯 Demo endpoint: http://localhost:${PORT}/api/hedera/demo`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  if (hederaClient && hederaClient.close) {
    hederaClient.close();
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  if (hederaClient && hederaClient.close) {
    hederaClient.close();
  }
  process.exit(0);
});

startServer();
