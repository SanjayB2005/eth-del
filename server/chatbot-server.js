import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import hederaService from "./services/hederaService.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini system prompt for Hedera integration
const HEDERA_SYSTEM_PROMPT = `You are SafeGuard AI, a **trusted, empathetic AI assistant for women’s safety and privacy**. Your goal is to guide users who are experiencing threats, blackmail, or harassment, while keeping their information safe and private. You have access to a Hedera backend to log session summaries or execute predefined actions, but your main focus is **helping users take actionable steps for their safety**.

Rules:

1. **Empathetic guidance first:** Always respond in a supportive, clear, and human-friendly way.
2. **Safety and privacy:** Never ask for unnecessary personal information. Do not suggest sharing sensitive content with untrusted parties.
3. **Hedera actions only when needed:** Only generate JSON commands for the backend if the user wants to log a session or perform blockchain operations.
4. **JSON format for Hedera operations:**

{
"action": "<action_name>",
"parameters": { ... }
}

Allowed actions:
- create_topic: create a Hedera topic for session logs
- send_message: send session summary hash to Hedera topic
- check_balance: optional Hedera query
- log_session: save hashed summary to blockchain

5. **Practical advice:** Give step-by-step instructions for:
   - Handling blackmail or threats
   - Uploading evidence to government hash database
   - Contacting local trusts or NGOs
   - Filing reports or involving someone else to act on their behalf
6. **Do not explain blockchain unnecessarily:** Only provide Hedera/technical info when asked explicitly.
7. **Friendly, concise language:** Avoid long, formal, technical descriptions unless necessary.

Example interactions:

User: Someone is threatening me with my private photo, what should I do?  
AI: I'm sorry you're experiencing this. First, do not respond to the threats. You can securely upload the photo to the government hash database to track it anonymously. I also recommend contacting the nearby trust, 'SafeGuard Trust,' who can act on your behalf. Would you like me to start this process for you?

User: Log this session.  
AI: 
{
"action": "send_message",
"parameters": { "topic": "CaseReports", "message": "<session_summary_hash>" }
}

User: Check balance of my Hedera account  
AI: 

{
"action": "check_balance",
"parameters": { "accountId": "0.0.123456" }
}

User: hello  
AI: Hello! I’m SafeGuard AI. You can tell me if you are facing any threats, or I can help you log a session safely to Hedera.

Important Notes:
- Always maintain **trust and empathy** in every reply.  
- Always clarify the next actionable step to the user.  
- Only output JSON when performing a Hedera operation requested by the user.  
- Keep replies concise, safe, and actionable.
`;

// Call Gemini API
async function callGeminiAPI(userMessage) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

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
        parts: [{ text: userMessage }],
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error("Invalid response structure from Gemini API");
  }

  return data.candidates[0].content.parts[0].text;
}

// Execute Hedera actions
async function executeHederaAction(actionData) {
  const { action, parameters } = actionData;

  console.log(`🎯 Executing Hedera action: ${action}`);
  console.log(`📋 Parameters:`, parameters);

  switch (action) {
    case "check_balance":
      const balance = await hederaService.getAccountBalance(
        parameters.accountId
      );
      console.log(
        `✅ Balance retrieved: ${balance.hbars} for account ${balance.accountId}`
      );
      return {
        success: true,
        action: "check_balance",
        result: {
          accountId: balance.accountId,
          balance: balance.hbars,
          tokens: balance.tokens,
        },
      };

    case "transfer_hbar":
      // Note: This would require additional implementation in hederaService
      // For now, return a placeholder response
      console.log(
        `💸 HBAR Transfer: ${parameters.amount} HBAR from ${parameters.fromAccountId} to ${parameters.toAccountId}`
      );
      return {
        success: false,
        action: "transfer_hbar",
        error: "HBAR transfer functionality not yet implemented in this demo",
      };

    case "create_topic":
      const topicResult = await hederaService.createTopic(parameters.topicName);
      console.log(
        `✅ Topic created: ${topicResult.topicId} with memo: ${topicResult.memo}`
      );
      return {
        success: true,
        action: "create_topic",
        result: {
          topicId: topicResult.topicId,
          topicName: parameters.topicName,
          transactionId: topicResult.transactionId,
        },
      };

    case "send_message":
      const messageResult = await hederaService.submitMessage(
        parameters.topicId,
        parameters.message
      );
      console.log(
        `✅ Message sent to topic ${messageResult.topicId}: "${messageResult.message}"`
      );
      return {
        success: true,
        action: "send_message",
        result: {
          topicId: messageResult.topicId,
          message: messageResult.message,
          transactionId: messageResult.transactionId,
          sequenceNumber: messageResult.sequenceNumber,
        },
      };

    default:
      throw new Error(`Unsupported action: ${action}`);
  }
}

// Main chatbot endpoint
app.post("/chatbot", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    console.log("💬 User message:", message);

    // Step 1: Send to Gemini
    console.log("🤖 Sending to Gemini Flash 2.5...");
    const geminiResponse = await callGeminiAPI(message);
    console.log("🤖 Gemini response:", geminiResponse);

    // Step 2: Try to parse as JSON (Hedera action)
    try {
      const actionData = JSON.parse(geminiResponse);

      if (actionData.action && actionData.parameters) {
        console.log("🎯 Hedera action detected:", actionData.action);

        // Step 3: Execute Hedera action
        try {
          const result = await executeHederaAction(actionData);
          console.log("✅ Hedera action completed successfully");

          return res.json({
            success: true,
            type: "hedera_action",
            action: actionData.action,
            result: result.result,
            timestamp: new Date().toISOString(),
          });
        } catch (hederaError) {
          console.log("❌ Hedera execution error:", hederaError.message);

          return res.json({
            success: false,
            type: "hedera_error",
            action: actionData.action,
            error: hederaError.message,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        // Invalid JSON structure - treat as conversation
        console.log("💬 Invalid action structure, treating as conversation");
        return res.json({
          success: true,
          type: "conversation",
          response: geminiResponse,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (jsonError) {
      // Not JSON - normal conversation
      console.log("💬 Plain text response (conversation mode)");

      return res.json({
        success: true,
        type: "conversation",
        response: geminiResponse,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.log("❌ Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    hedera: hederaService.isInitialized(),
    gemini: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Start server
async function startServer() {
  try {
    // Initialize Hedera service
    await hederaService.initialize();
    console.log("✅ Hedera service initialized");

    app.listen(PORT, () => {
      console.log(`🚀 Chatbot server running on port ${PORT}`);
      console.log(`💬 Chatbot endpoint: http://localhost:${PORT}/chatbot`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log("");
      console.log("🧪 Test with:");
      console.log(
        `curl -X POST http://localhost:${PORT}/chatbot -H "Content-Type: application/json" -d '{"message": "Create a new topic called CaseReports"}'`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await hederaService.cleanup();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await hederaService.cleanup();
  process.exit(0);
});

startServer();
