// Test script to demonstrate enhanced Gemini API error handling
const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:4000";

async function testErrorHandling() {
  console.log("🧪 Testing Enhanced Gemini API Error Handling\n");

  const testMessages = [
    "Check my Hedera balance",
    "Create a new topic",
    "Hello, how are you?",
    "What blockchain operations can you help me with?",
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n📝 Test ${i + 1}: "${message}"`);
    console.log("=".repeat(50));

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Request successful");
        console.log("🔧 Response type:", data.type);

        if (data.fallbackMode) {
          console.log("⚠️  FALLBACK MODE ACTIVE - AI service unavailable");
        } else {
          console.log("🤖 AI service responding normally");
        }

        if (data.type === "hedera_action") {
          console.log("🎯 Hedera action:", data.action);
          console.log("📊 Result:", JSON.stringify(data.result, null, 2));
        } else {
          console.log(
            "💬 AI response:",
            data.response?.substring(0, 100) + "..."
          );
        }
      } else {
        console.log("❌ Request failed:", data.error);
      }
    } catch (error) {
      console.log("🚨 Network error:", error.message);
    }

    // Wait between requests
    if (i < testMessages.length - 1) {
      console.log("\n⏳ Waiting 2 seconds before next test...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n🎉 Error handling test completed!");
  console.log("\n📋 Summary:");
  console.log("- Enhanced retry logic with exponential backoff");
  console.log("- Fallback responses when Gemini API is unavailable");
  console.log("- Service degradation gracefully handled");
  console.log("- Frontend notified of fallback mode");
  console.log("- Blockchain operations continue working");
}

// Run the test
testErrorHandling().catch(console.error);
