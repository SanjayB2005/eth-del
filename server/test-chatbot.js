import fetch from "node-fetch";

const BASE_URL = "http://localhost:4000";

async function testChatbot(message, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`💬 Input: "${message}"`);
  console.log("-".repeat(60));

  try {
    const response = await fetch(`${BASE_URL}/chatbot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    console.log("📡 Response Status:", response.status);
    console.log("📋 Response Data:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

async function runChatbotTests() {
  console.log("🤖 Chatbot Backend Integration Test Suite");
  console.log("=========================================");

  // Check if server is running
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();

    console.log("\n📊 Server Health Check:");
    console.log(`   Status: ${healthData.status}`);
    console.log(`   Hedera: ${healthData.hedera ? "✅" : "❌"}`);
    console.log(`   Gemini: ${healthData.gemini ? "✅" : "❌"}`);

    if (!healthData.hedera || !healthData.gemini) {
      console.log(
        "\n❌ Server not properly configured. Please check your .env file."
      );
      return;
    }
  } catch (error) {
    console.log(
      "\n❌ Server not running. Please start with: node chatbot-server.js"
    );
    return;
  }

  // Test Cases
  const testCases = [
    {
      message: "Create a new topic called 'CaseReports'",
      description: "Topic Creation (Expected Hedera Action)",
    },
    {
      message: "Check the balance of account 0.0.6915283",
      description: "Balance Check (Expected Hedera Action)",
    },
    {
      message: "Send message 'New evidence submitted' to topic 0.0.123456",
      description: "Send Message (Expected Hedera Action)",
    },
    {
      message: "What is Hedera Hashgraph?",
      description: "General Question (Expected Conversation)",
    },
    {
      message: "Create a topic",
      description: "Missing Parameters (Should ask for topic name)",
    },
    {
      message: "Hello, how are you?",
      description: "Casual Conversation (Expected Plain Text)",
    },
  ];

  // Run tests sequentially to avoid overwhelming the APIs
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    await testChatbot(testCase.message, testCase.description);

    // Wait between tests
    if (i < testCases.length - 1) {
      console.log("\n⏳ Waiting 2 seconds before next test...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n🎉 Chatbot Test Suite Complete!");
  console.log("================================");
  console.log("💡 Expected Console Output (from server):");
  console.log("   💬 User message: Create a new topic called CaseReports");
  console.log("   🤖 Sending to Gemini Flash 2.5...");
  console.log(
    '   🤖 Gemini response: {"action":"create_topic","parameters":{"topicName":"CaseReports"}}'
  );
  console.log("   🎯 Hedera action detected: create_topic");
  console.log("   🎯 Executing Hedera action: create_topic");
  console.log('   📋 Parameters: { topicName: "CaseReports" }');
  console.log("   ✅ Topic created: 0.0.123456 with memo: CaseReports");
  console.log("   ✅ Hedera action completed successfully");
}

// Run the tests
runChatbotTests();
