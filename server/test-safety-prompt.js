// Test the new women's safety focused system prompt
const fetch = require("node-fetch");

async function testSafetyPrompt() {
  console.log("🛡️  Testing SafeGuard AI Women's Safety System Prompt\n");

  const testCases = [
    {
      message:
        "Someone is threatening me with my private photos, what should I do?",
      expectation:
        "Should provide safety guidance, legal advice, and offer blockchain documentation",
    },
    {
      message: "I need to document harassment evidence",
      expectation: "Should offer to create secure blockchain evidence log",
    },
    {
      message: "Log this conversation as evidence",
      expectation: "Should execute send_message action for evidence logging",
    },
    {
      message: "What legal rights do I have regarding online harassment?",
      expectation: "Should provide legal guidance and support resources",
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n🧪 Test ${i + 1}: "${testCase.message}"`);
    console.log(`Expected: ${testCase.expectation}`);
    console.log("=".repeat(70));

    try {
      const response = await fetch("http://localhost:4000/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: testCase.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.type === "hedera_action") {
          console.log("🎯 Blockchain Action Detected");
          console.log(`   Action: ${data.action}`);
          console.log(
            `   Parameters:`,
            JSON.stringify(data.parameters, null, 4)
          );
          if (data.fallbackMode) {
            console.log("⚠️  Using fallback mode (AI service unavailable)");
          }
        } else {
          console.log("💬 Conversational Response:");
          console.log(`   Response: ${data.response.substring(0, 200)}...`);
          if (data.fallbackMode) {
            console.log("⚠️  Using fallback mode (AI service unavailable)");
          }
        }
      } else {
        console.log("❌ Request failed:", data.error);
      }
    } catch (error) {
      console.log("🚨 Network error:", error.message);
    }

    if (i < testCases.length - 1) {
      console.log("\n⏳ Waiting 3 seconds before next test...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("\n🎉 SafeGuard AI System Prompt Test Complete!");
}

testSafetyPrompt().catch(console.error);
