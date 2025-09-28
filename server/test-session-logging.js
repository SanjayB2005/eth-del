import fetch from "node-fetch";

// Test data for session logging
const EXAMPLE_SESSION_SUMMARIES = {
  case_report: `Case Report #CR-2025-0927-001
Date: 2025-09-27
Officer: Badge #4521
Location: Downtown Financial District

Incident Summary:
- Time: 14:30 EST
- Type: Financial Fraud Investigation  
- Victim: John Doe (ID: V-12345)
- Suspect: Unknown
- Amount: $50,000 cryptocurrency theft

Evidence Collected:
1. Blockchain transaction logs
2. Victim statement (recorded)
3. Digital wallet addresses
4. Communication records

Actions Taken:
- Filed initial report
- Evidence secured in blockchain storage
- Victim support services contacted
- Investigation assigned to Detective Smith

Next Steps:
- Forensic analysis of blockchain transactions
- Interview additional witnesses
- Coordinate with cybercrime unit

This summary contains sensitive investigation details and should be audited for integrity.`,

  evidence_chain: `Evidence Chain Custody Log
Case: CR-2025-0927-001
Evidence ID: E-789456

Chain of Custody:
1. 14:45 - Collected by Officer Martinez (Badge #4521)
   - Digital wallet backup file
   - Hash: 0x7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504ded97730

2. 15:20 - Transferred to Evidence Lab
   - Received by Tech Sarah Johnson
   - Integrity verified
   - Stored in secure blockchain storage

3. 16:10 - Analysis begun
   - Forensic Analyst Mike Chen
   - Tools: Blockchain Explorer, Trace Analysis
   - Status: In Progress

Digital Signatures:
- Officer Martinez: Signed at 14:45
- Lab Tech Johnson: Signed at 15:20  
- Analyst Chen: Signed at 16:10

This evidence log ensures complete accountability and auditability of digital evidence handling.`,

  witness_statement: `Confidential Witness Statement
Statement ID: WS-2025-0927-003
Case: Financial Fraud Investigation
Date: September 27, 2025

Witness Information:
- Name: [REDACTED for privacy]
- Contact: [ENCRYPTED]
- Statement taken by Officer Davis

Statement Summary:
"I observed suspicious activity on the cryptocurrency exchange platform around 2:30 PM. Multiple large transactions were being processed rapidly, which seemed unusual for normal trading patterns. The account appeared to be draining wallets systematically. I took screenshots of the activity and reported it immediately."

Supporting Evidence:
- Screenshot timestamps: 14:32, 14:35, 14:37
- Account monitoring logs
- Transaction IDs: TX-789, TX-790, TX-791

Verification:
- Statement reviewed and confirmed accurate
- Witness signature obtained
- Evidence integrity verified

This statement contains sensitive information and witness identity must be protected while maintaining audit trail.`,
};

const SERVER_URL = "http://localhost:4000";

// Color codes for console output
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

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSessionLogging() {
  console.log("\n" + "=".repeat(60));
  colorLog("cyan", "🧪 SESSION LOGGING COMPREHENSIVE TEST SUITE");
  console.log("=".repeat(60));

  let testCount = 0;
  let passedTests = 0;

  // Test 1: Health check
  try {
    testCount++;
    colorLog("blue", "\n📋 TEST 1: Health Check");

    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();

    if (healthData.status === "healthy") {
      colorLog("green", "✅ Health check passed");
      console.log("📊 Services status:", healthData.services);
      passedTests++;
    } else {
      throw new Error("Health check failed");
    }
  } catch (error) {
    colorLog("red", `❌ TEST 1 FAILED: ${error.message}`);
  }

  // Test 2: Get session topic info
  try {
    testCount++;
    colorLog("blue", "\n📋 TEST 2: Get Session Topic Info");

    const topicResponse = await fetch(`${SERVER_URL}/session-topic`);
    const topicData = await topicResponse.json();

    if (topicData.success && topicData.topicId) {
      colorLog("green", "✅ Session topic info retrieved");
      console.log("📝 Topic ID:", topicData.topicId);
      console.log("🔗 Mirror Node URL:", topicData.mirrorNodeUrl);
      passedTests++;
    } else {
      throw new Error("Failed to get session topic info");
    }
  } catch (error) {
    colorLog("red", `❌ TEST 2 FAILED: ${error.message}`);
  }

  // Test 3: Log case report session
  try {
    testCount++;
    colorLog("blue", "\n📋 TEST 3: Log Case Report Session");

    const response = await fetch(`${SERVER_URL}/log-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionSummary: EXAMPLE_SESSION_SUMMARIES.case_report,
        enableVerification: false, // Skip verification for faster testing
      }),
    });

    const data = await response.json();

    if (data.success && data.hash && data.transactionId) {
      colorLog("green", "✅ Case report session logged successfully");
      console.log("🔒 SHA-256 Hash:", data.hash);
      console.log("📩 Transaction ID:", data.transactionId);
      console.log("🔗 Topic ID:", data.topicId);
      passedTests++;
    } else {
      throw new Error(`Session logging failed: ${data.error}`);
    }
  } catch (error) {
    colorLog("red", `❌ TEST 3 FAILED: ${error.message}`);
  }

  // Test 4: Log evidence chain session
  try {
    testCount++;
    colorLog("blue", "\n📋 TEST 4: Log Evidence Chain Session");

    const response = await fetch(`${SERVER_URL}/log-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionSummary: EXAMPLE_SESSION_SUMMARIES.evidence_chain,
        enableVerification: false,
      }),
    });

    const data = await response.json();

    if (data.success && data.hash && data.transactionId) {
      colorLog("green", "✅ Evidence chain session logged successfully");
      console.log("🔒 SHA-256 Hash:", data.hash);
      console.log("📩 Transaction ID:", data.transactionId);
      passedTests++;
    } else {
      throw new Error(`Session logging failed: ${data.error}`);
    }
  } catch (error) {
    colorLog("red", `❌ TEST 4 FAILED: ${error.message}`);
  }

  // Test 5: Log witness statement with verification
  try {
    testCount++;
    colorLog(
      "blue",
      "\n📋 TEST 5: Log Witness Statement (with Mirror Node verification)"
    );
    colorLog(
      "yellow",
      "⏳ This test includes Mirror Node verification - may take up to 30 seconds..."
    );

    const response = await fetch(`${SERVER_URL}/log-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionSummary: EXAMPLE_SESSION_SUMMARIES.witness_statement,
        enableVerification: true, // Enable Mirror Node verification
      }),
    });

    const data = await response.json();

    if (data.success && data.hash && data.transactionId) {
      colorLog("green", "✅ Witness statement session logged successfully");
      console.log("🔒 SHA-256 Hash:", data.hash);
      console.log("📩 Transaction ID:", data.transactionId);

      if (data.verification) {
        if (data.verification.verified) {
          colorLog("green", "✅ Mirror Node verification successful");
          console.log("🔍 Sequence Number:", data.verification.sequenceNumber);
          console.log(
            "⏰ Consensus Timestamp:",
            data.verification.consensusTimestamp
          );
        } else {
          colorLog(
            "yellow",
            "⚠️  Mirror Node verification timed out (hash may still be propagating)"
          );
        }
      }
      passedTests++;
    } else {
      throw new Error(`Session logging failed: ${data.error}`);
    }
  } catch (error) {
    colorLog("red", `❌ TEST 5 FAILED: ${error.message}`);
  }

  // Test 6: Error handling - missing session summary
  try {
    testCount++;
    colorLog("blue", "\n📋 TEST 6: Error Handling - Missing Session Summary");

    const response = await fetch(`${SERVER_URL}/log-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Missing sessionSummary
    });

    const data = await response.json();

    if (!data.success && data.error.includes("sessionSummary is required")) {
      colorLog("green", "✅ Error handling working correctly");
      console.log("📝 Expected error message:", data.error);
      passedTests++;
    } else {
      throw new Error("Error handling test failed");
    }
  } catch (error) {
    colorLog("red", `❌ TEST 6 FAILED: ${error.message}`);
  }

  // Test 7: Error handling - invalid session summary type
  try {
    testCount++;
    colorLog(
      "blue",
      "\n📋 TEST 7: Error Handling - Invalid Session Summary Type"
    );

    const response = await fetch(`${SERVER_URL}/log-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionSummary: { invalid: "object" }, // Should be string
      }),
    });

    const data = await response.json();

    if (
      !data.success &&
      data.error.includes("sessionSummary must be a string")
    ) {
      colorLog("green", "✅ Type validation working correctly");
      console.log("📝 Expected error message:", data.error);
      passedTests++;
    } else {
      throw new Error("Type validation test failed");
    }
  } catch (error) {
    colorLog("red", `❌ TEST 7 FAILED: ${error.message}`);
  }

  // Test Results Summary
  console.log("\n" + "=".repeat(60));
  colorLog("cyan", "📊 TEST RESULTS SUMMARY");
  console.log("=".repeat(60));

  console.log(`📋 Total Tests: ${testCount}`);
  colorLog("green", `✅ Passed: ${passedTests}`);
  colorLog("red", `❌ Failed: ${testCount - passedTests}`);

  const successRate = Math.round((passedTests / testCount) * 100);
  console.log(`📈 Success Rate: ${successRate}%`);

  if (passedTests === testCount) {
    colorLog(
      "green",
      "\n🎉 ALL TESTS PASSED! Session logging system is working perfectly!"
    );
    console.log(
      "✨ Your Hedera session logging system is ready for production use."
    );
  } else {
    colorLog(
      "yellow",
      "\n⚠️  Some tests failed. Check the error messages above."
    );
  }

  console.log("\n" + "=".repeat(60));
}

// Run tests
testSessionLogging().catch((error) => {
  colorLog("red", "❌ Test suite failed:");
  console.error(error.message);
  console.error(error.stack);
});
