import fetch from "node-fetch";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Gemini system prompt for Hedera integration
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

User: "Create a topic called Evidence Log"
Response: {"action":"create_topic","parameters":{"topicName":"Evidence Log"}}

User: "Send message 'Test data' to topic 0.0.999"
Response: {"action":"send_message","parameters":{"topicId":"0.0.999","message":"Test data"}}

For missing parameters, ask in plain text:
User: "Check my balance"
Response: Please provide the account ID you want to check (format: 0.0.xxxxx)

CRITICAL: Return pure JSON for Hedera actions, no extra text!`;

async function callGeminiAPI(userMessage) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: HEDERA_SYSTEM_PROMPT,
          },
        ],
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
        parts: [
          {
            text: userMessage,
          },
        ],
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

  try {
    console.log("🤖 Sending request to Gemini Flash 2.5...");
    console.log("📝 User message:", userMessage);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error("Invalid response structure from Gemini API");
    }

    const geminiResponse = data.candidates[0].content.parts[0].text;

    console.log("\n🚀 Raw Gemini Response:");
    console.log("=".repeat(50));
    console.log(geminiResponse);
    console.log("=".repeat(50));

    // Try to parse as JSON
    try {
      const parsedJSON = JSON.parse(geminiResponse);
      console.log("\n✅ Valid JSON detected!");
      console.log("📊 Parsed Structure:");
      console.log(JSON.stringify(parsedJSON, null, 2));

      // Validate Hedera action structure
      if (parsedJSON.action && parsedJSON.parameters) {
        console.log("\n🎯 Hedera Action Detected:");
        console.log(`   Action: ${parsedJSON.action}`);
        console.log(`   Parameters:`, parsedJSON.parameters);
      }
    } catch (jsonError) {
      console.log("\n💬 Plain text response (not a Hedera action)");
    }

    return geminiResponse;
  } catch (error) {
    console.error("❌ Error calling Gemini API:", error.message);
    throw error;
  }
}

async function testGeminiHederaIntegration() {
  console.log("🧪 Testing Gemini + Hedera Integration");
  console.log("=====================================\n");

  // Test cases
  const testCases = [
    {
      name: "Balance Check",
      input: "Check the balance of account 0.0.12345",
    },
    {
      name: "Transfer HBAR",
      input: "Send 10 HBAR from account 0.0.111 to account 0.0.222",
    },
    {
      name: "Create Topic",
      input: "Create a topic called Evidence Storage",
    },
    {
      name: "Send Message",
      input: "Send message 'Test evidence hash: abc123' to topic 0.0.999",
    },
    {
      name: "Missing Parameters",
      input: "Check my balance",
    },
    {
      name: "Normal Conversation",
      input: "What is Hedera Hashgraph?",
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    console.log(`\n${i + 1}. 🧪 Testing: ${testCase.name}`);
    console.log(`Input: "${testCase.input}"`);
    console.log("-".repeat(60));

    try {
      await callGeminiAPI(testCase.input);
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
    }

    console.log("\n");
  }

  console.log("🎉 Gemini + Hedera Integration Test Complete!");
}

// Run the test
if (process.env.GEMINI_API_KEY) {
  testGeminiHederaIntegration();
} else {
  console.error("❌ Please set GEMINI_API_KEY in your .env file");
  console.log(
    "💡 Get your API key from: https://makersuite.google.com/app/apikey"
  );
  console.log("💡 Add to .env: GEMINI_API_KEY=your_api_key_here");
}
