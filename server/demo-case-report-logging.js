import fetch from "node-fetch";
import crypto from "crypto";

// Your specific example session summary
const CASE_REPORT_SUMMARY = `Police Case Report #CR-2025-0927-001
Officer: Detective Sarah Johnson, Badge #4521
Date: September 27, 2025, 2:30 PM EST
Location: Downtown Financial District

Incident Type: Cryptocurrency Fraud Investigation
Victim: John Doe, DOB: 1985-03-15
Reported Loss: $50,000 in Bitcoin

Incident Details:
The victim reported unauthorized access to his cryptocurrency wallet on September 26, 2025. Analysis of blockchain transactions shows suspicious activity starting at 11:47 PM. Multiple small transfers were made to obfuscate the theft, followed by consolidation into a single wallet address.

Evidence Collected:
1. Victim's original wallet private key (secured)
2. Transaction hashes: 0x7d86...7730, 0x9a12...5f89, 0x3c45...8b21
3. Blockchain analysis report
4. Victim statement (digitally signed)
5. Screen recordings of wallet interface

Investigative Actions:
- Secured victim's remaining assets
- Initiated blockchain trace analysis
- Contacted exchange platforms for KYC information
- Filed report with Financial Crimes Unit
- Victim referred to support services

This case involves sensitive financial information and victim privacy. The integrity of this report is critical for legal proceedings and must be verifiable through blockchain audit trail.`;

const SERVER_URL = "http://localhost:4000";

// Color codes for better console output
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

async function demonstrateSessionLogging() {
  console.log("\n" + "=".repeat(70));
  log("cyan", "🚔 POLICE CASE REPORT SESSION LOGGING DEMONSTRATION");
  console.log("=".repeat(70));

  try {
    // Show what we're about to log
    log("blue", "\n📋 CASE REPORT TO BE LOGGED:");
    console.log("-".repeat(50));
    console.log(CASE_REPORT_SUMMARY);
    console.log("-".repeat(50));

    // Compute hash locally for comparison
    const localHash = crypto
      .createHash("sha256")
      .update(CASE_REPORT_SUMMARY)
      .digest("hex");
    log("magenta", `\n🔒 Expected SHA-256 Hash: ${localHash}`);

    log("yellow", "\n📤 Sending case report to session logging service...\n");

    // Send session summary to logging endpoint
    const startTime = Date.now();
    const response = await fetch(`${SERVER_URL}/log-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionSummary: CASE_REPORT_SUMMARY,
        enableVerification: true, // Enable Mirror Node verification
      }),
    });

    const endTime = Date.now();
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${data.error || "Unknown error"}`
      );
    }

    log("green", "\n✅ SESSION LOGGING COMPLETED SUCCESSFULLY!");
    console.log("⏱️  Processing time:", endTime - startTime, "ms");

    // Display results
    console.log("\n📊 LOGGING RESULTS:");
    console.log("==================");
    console.log("🔒 SHA-256 Hash:", data.hash);
    console.log("📩 Transaction ID:", data.transactionId);
    console.log("🔗 Hedera Topic ID:", data.topicId);
    console.log("⏰ Timestamp:", data.timestamp);

    // Verify hash matches
    if (data.hash === localHash) {
      log("green", "✅ Hash verification: MATCH");
    } else {
      log("red", "❌ Hash verification: MISMATCH");
    }

    // Mirror Node verification results
    if (data.verification) {
      console.log("\n🔍 MIRROR NODE VERIFICATION:");
      console.log("============================");
      if (data.verification.verified) {
        log("green", "✅ Verification: SUCCESS");
        console.log("📋 Sequence Number:", data.verification.sequenceNumber);
        console.log(
          "⏰ Consensus Timestamp:",
          data.verification.consensusTimestamp
        );
        console.log("🔄 Verification Attempts:", data.verification.attempt);
      } else {
        log(
          "yellow",
          "⚠️  Verification: TIMED OUT (hash may still be propagating)"
        );
        if (data.verification.error) {
          console.log("❌ Error:", data.verification.error);
        } else {
          console.log("💡 Note:", data.verification.message);
        }
      }
    }

    // Show audit trail information
    console.log("\n📋 AUDIT TRAIL CREATED:");
    console.log("=======================");
    log(
      "cyan",
      "🛡️  Privacy Protection: Full case report NOT stored on blockchain"
    );
    log(
      "cyan",
      "🔒 Integrity Protection: SHA-256 hash IS stored on blockchain"
    );
    log(
      "cyan",
      "📜 Immutable Record: Transaction logged to Hedera Consensus Service"
    );
    log("cyan", "🔍 Verifiable: Hash can be independently verified");

    // Show next steps
    console.log("\n🔄 NEXT STEPS FOR COMPLETE AUDIT:");
    console.log("=================================");
    console.log(
      "1. 📁 Store full case report in secure local/encrypted storage"
    );
    console.log(
      "2. 🔗 Reference Hedera transaction ID in case management system"
    );
    console.log(
      "3. 🔍 Verify integrity by comparing stored report hash with blockchain"
    );
    console.log(
      "4. 📊 Use Mirror Node API for additional verification if needed"
    );

    // Mirror Node API info
    console.log("\n🌐 MIRROR NODE API ACCESS:");
    console.log("==========================");
    console.log(
      `🔗 Topic Messages: https://testnet.mirrornode.hedera.com/api/v1/topics/${data.topicId}/messages`
    );
    console.log(
      `🔍 Specific Transaction: https://testnet.mirrornode.hedera.com/api/v1/transactions/${data.transactionId}`
    );

    log("green", "\n🎉 DEMONSTRATION COMPLETED SUCCESSFULLY!");
    log(
      "green",
      "🔐 Case report hash is now immutably recorded on Hedera blockchain"
    );
    log("green", "👮 Law enforcement can verify report integrity at any time");
  } catch (error) {
    log("red", "\n❌ DEMONSTRATION FAILED:");
    console.error("Error:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      log("yellow", "\n💡 TROUBLESHOOTING:");
      console.log("1. Make sure the server is running:");
      console.log("   cd server && node session-logging-server.js");
      console.log("2. Check server is listening on port 4000");
      console.log("3. Verify environment variables are set in .env file");
    }
  }

  console.log("\n" + "=".repeat(70));
}

// Additional helper functions
async function checkServerHealth() {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();
    return data.status === "healthy";
  } catch (error) {
    return false;
  }
}

async function getTopicInfo() {
  try {
    const response = await fetch(`${SERVER_URL}/session-topic`);
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

// Main execution
async function main() {
  console.log("🔍 Checking server health...");

  const isHealthy = await checkServerHealth();
  if (!isHealthy) {
    log("red", "❌ Server is not running or not healthy");
    log("yellow", "💡 Please start the server first:");
    console.log("   cd server && node session-logging-server.js");
    return;
  }

  log("green", "✅ Server is healthy, proceeding with demonstration...");

  await demonstrateSessionLogging();
}

main().catch((error) => {
  log("red", "❌ Fatal error:");
  console.error(error);
});
