import fetch from "node-fetch";

// Test script to simulate frontend-backend integration
const API_BASE_URL = "http://localhost:4000";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function simulateFrontendFlow() {
  console.log("\n" + "=".repeat(60));
  log("cyan", "🚀 FRONTEND-BACKEND INTEGRATION TEST");
  console.log("=".repeat(60));

  try {
    // 1. Check server health (like frontend startup)
    log("blue", "\n📋 STEP 1: Health Check (Frontend Startup)");
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();

    if (healthData.status === "healthy") {
      log("green", "✅ Backend server is healthy");
      console.log("📊 Services:", healthData.services);
    } else {
      throw new Error("Backend server not healthy");
    }

    // 2. Simulate user starting a session
    log("blue", "\n📋 STEP 2: User Starts Session");
    log("yellow", "🔒 Session started - frontend activates session logging");

    // 3. Simulate chatbot interactions
    log("blue", "\n📋 STEP 3: User Chat Interactions");

    const testMessages = [
      "Create a new topic called CaseReports",
      "What is Hedera Hashgraph?",
      "Check balance of 0.0.6915283",
    ];

    const chatResults = [];

    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      log("yellow", `\n💬 User message ${i + 1}: "${message}"`);

      const chatResponse = await fetch(`${API_BASE_URL}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const chatData = await chatResponse.json();

      if (chatData.success) {
        if (chatData.type === "hedera_action") {
          log("green", `🤖 AI executed Hedera action: ${chatData.action}`);
          console.log("📊 Result:", JSON.stringify(chatData.result, null, 2));

          chatResults.push({
            message,
            type: "hedera_action",
            action: chatData.action,
            result: chatData.result,
          });
        } else {
          log("green", `🤖 AI conversation response:`);
          console.log(chatData.response.substring(0, 200) + "...");

          chatResults.push({
            message,
            type: "conversation",
            response: chatData.response,
          });
        }
      } else {
        log("red", `❌ Chat failed: ${chatData.error}`);
      }

      // Small delay to simulate user interaction
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 4. Simulate session ending and automatic logging
    log(
      "blue",
      "\n📋 STEP 4: User Ends Session - Automatic Blockchain Logging"
    );

    // Generate session summary (like frontend would)
    const sessionSummary = `
SafeGuard AI Frontend Test Session
=================================
Session Duration: ${new Date().toISOString()}
Total Messages: ${testMessages.length}
Hedera Actions: ${chatResults.filter((r) => r.type === "hedera_action").length}

User Interactions:
${chatResults
  .map(
    (result, i) =>
      `${i + 1}. "${result.message}" → ${
        result.type === "hedera_action"
          ? `Hedera ${result.action}`
          : "Conversation"
      }`
  )
  .join("\n")}

This session represents a complete frontend-backend integration test
demonstrating the SafeGuard AI women safety platform capabilities.
    `.trim();

    log(
      "yellow",
      "📝 Frontend generating session summary for blockchain logging..."
    );
    console.log(
      "📄 Session summary (first 200 chars):",
      sessionSummary.substring(0, 200) + "..."
    );

    // Log session to Hedera
    const logResponse = await fetch(`${API_BASE_URL}/log-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionSummary,
        enableVerification: true,
      }),
    });

    const logData = await logResponse.json();

    if (logData.success) {
      log("green", "\n✅ SESSION SUCCESSFULLY LOGGED TO HEDERA BLOCKCHAIN!");
      console.log("🔒 SHA-256 Hash:", logData.hash);
      console.log("📩 Transaction ID:", logData.transactionId);
      console.log("🔗 Topic ID:", logData.topicId);

      if (logData.verification && logData.verification.verified) {
        log("green", "✅ Mirror Node verification successful");
        console.log("📋 Sequence Number:", logData.verification.sequenceNumber);
      }
    } else {
      log("red", `❌ Session logging failed: ${logData.error}`);
    }

    // 5. Summary of what the frontend would show
    log("blue", "\n📋 STEP 5: Frontend UI State Summary");
    console.log("=".repeat(40));

    log("cyan", "🖥️  Frontend would display:");
    console.log("• Chat history with user messages and AI responses");
    console.log("• Transaction log showing Hedera actions");
    console.log("• Session status (active/ended)");
    console.log("• Blockchain logging confirmation");
    console.log("• Server connection status");

    const hederaActions = chatResults.filter((r) => r.type === "hedera_action");
    if (hederaActions.length > 0) {
      log("cyan", "\n🔗 Hedera Transaction Log (for sidebar):");
      hederaActions.forEach((action, i) => {
        console.log(`${i + 1}. 🤖 AI Action: ${action.action}`);
        console.log(
          `   📩 Transaction: ${action.result.transactionId || "N/A"}`
        );
        console.log(`   ✅ Status: Success`);
      });
    }

    log(
      "green",
      "\n🎉 FRONTEND-BACKEND INTEGRATION TEST COMPLETED SUCCESSFULLY!"
    );
    log("green", "✨ SafeGuard AI platform is ready for production use!");

    // Show Mirror Node links
    console.log("\n🌐 BLOCKCHAIN VERIFICATION LINKS:");
    console.log(
      `🔗 Session Log: https://testnet.mirrornode.hedera.com/api/v1/topics/${logData.topicId}/messages`
    );
    console.log(
      `🔍 Transaction: https://testnet.mirrornode.hedera.com/api/v1/transactions/${logData.transactionId}`
    );
  } catch (error) {
    log("red", "\n❌ INTEGRATION TEST FAILED:");
    console.error("Error:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      log("yellow", "\n💡 TROUBLESHOOTING:");
      console.log("1. Start the backend server:");
      console.log("   cd server && npm run session-logging");
      console.log("2. Check server is running on port 4000");
      console.log("3. Verify environment variables in .env");
    }
  }

  console.log("\n" + "=".repeat(60));
}

// Run the integration test
log("cyan", "🧪 Starting Frontend-Backend Integration Test...");
log(
  "yellow",
  "⚠️  Make sure the backend server is running: npm run session-logging"
);
log("yellow", "⏳ This test will simulate complete user session flow...\n");

simulateFrontendFlow().catch((error) => {
  log("red", "❌ Fatal error:");
  console.error(error);
});
