// Simple standalone Gemini + Hedera test (no dependencies needed except node-fetch)
// Run with: node gemini-hedera-simple.js

import fetch from "node-fetch";

// Your Gemini API key - get from https://makersuite.google.com/app/apikey
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // Replace with your actual API key

// Perfect system prompt for Hedera integration
const HEDERA_SYSTEM_PROMPT = `You are a Hedera Hashgraph assistant. You help users interact with the Hedera network.

IMPORTANT INSTRUCTIONS:
1. For normal conversation, respond with plain text
2. For Hedera actions, respond ONLY with valid JSON in the exact format specified below
3. Never add explanatory text before or after the JSON for Hedera actions
4. If parameters are missing, ask the user to provide them in plain text

SUPPORTED HEDERA ACTIONS:
- Check account balance: "check_balance"
- Transfer HBAR: "transfer_hbar" 
- Create HCS topic: "create_topic"
- Send HCS message: "send_message"

REQUIRED JSON FORMAT for Hedera actions:
{
  "action": "action_name",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}

ACTION PARAMETERS:
- check_balance: { "accountId": "0.0.xxxxx" }
- transfer_hbar: { "fromAccountId": "0.0.xxxxx", "toAccountId": "0.0.yyyyy", "amount": "10.5" }
- create_topic: { "topicName": "Topic Name" }
- send_message: { "topicId": "0.0.xxxxx", "message": "Your message text" }

EXAMPLES:
User: "Check balance of 0.0.12345"
Response: {"action":"check_balance","parameters":{"accountId":"0.0.12345"}}

User: "Send 5 HBAR from 0.0.111 to 0.0.222"
Response: {"action":"transfer_hbar","parameters":{"fromAccountId":"0.0.111","toAccountId":"0.0.222","amount":"5"}}

CRITICAL: Return pure JSON for Hedera actions, no extra text!`;

async function testGemini() {
  const testMessage = "Check the balance of account 0.0.12345";

  console.log("🤖 Testing Gemini Flash 2.5 with Hedera Integration");
  console.log("====================================================");
  console.log("📝 Test Input:", testMessage);
  console.log("");

  if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    console.log(
      "❌ Please replace YOUR_GEMINI_API_KEY_HERE with your actual API key"
    );
    console.log("💡 Get it from: https://makersuite.google.com/app/apikey");
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [
        {
          parts: [{ text: HEDERA_SYSTEM_PROMPT }],
          role: "user",
        },
        {
          parts: [
            {
              text: "I understand. I will respond with plain text for normal conversation and pure JSON for Hedera actions.",
            },
          ],
          role: "model",
        },
        {
          parts: [{ text: testMessage }],
          role: "user",
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const geminiOutput = data.candidates[0].content.parts[0].text;

    console.log("🚀 Raw Gemini Output:");
    console.log("=".repeat(50));
    console.log(geminiOutput);
    console.log("=".repeat(50));

    // Parse as JSON
    try {
      const parsed = JSON.parse(geminiOutput);
      console.log("\n✅ SUCCESS! Valid JSON detected");
      console.log("📊 Parsed Structure:");
      console.log(JSON.stringify(parsed, null, 2));

      console.log("\n🎯 Expected Output:");
      console.log(
        JSON.stringify(
          {
            action: "check_balance",
            parameters: {
              accountId: "0.0.12345",
            },
          },
          null,
          2
        )
      );

      // Validate structure
      if (
        parsed.action === "check_balance" &&
        parsed.parameters.accountId === "0.0.12345"
      ) {
        console.log("\n🎉 PERFECT! Output matches expected format exactly!");
      } else {
        console.log(
          "\n⚠️  Output is valid JSON but doesn't match expected structure"
        );
      }
    } catch (e) {
      console.log("\n❌ Output is not valid JSON");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testGemini();
