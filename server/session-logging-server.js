import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import hederaService from "./services/hederaService.js";
import sessionLoggingService from "./services/sessionLoggingService.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increase limit for session summaries

// Initialize services on startup
let servicesInitialized = false;

async function initializeServices() {
  if (servicesInitialized) return;

  try {
    console.log("🚀 Initializing Hedera + Session Logging Services...\n");

    // Initialize Hedera service
    await hederaService.initialize();

    // Initialize session logging service (creates topic if needed)
    await sessionLoggingService.initialize();

    servicesInitialized = true;
    console.log("✅ All services initialized successfully!\n");
  } catch (error) {
    console.error("❌ Service initialization failed:", error.message);
    throw error;
  }
}

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    if (!servicesInitialized) {
      await initializeServices();
    }

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        hedera: hederaService.isInitialized(),
        sessionLogging: sessionLoggingService.getLoggingTopicId() !== null,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Session logging endpoint
app.post("/log-session", async (req, res) => {
  try {
    console.log("\n📝 === SESSION LOGGING REQUEST ===");

    // Ensure services are initialized
    if (!servicesInitialized) {
      await initializeServices();
    }

    const { sessionSummary, enableVerification = false } = req.body;

    // Validate input
    if (!sessionSummary) {
      return res.status(400).json({
        success: false,
        error: "sessionSummary is required",
        timestamp: new Date().toISOString(),
      });
    }

    if (typeof sessionSummary !== "string") {
      return res.status(400).json({
        success: false,
        error: "sessionSummary must be a string",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("📝 Session summary received:");
    console.log("📄 Length:", sessionSummary.length, "characters");
    console.log(
      "📄 Preview:",
      sessionSummary.substring(0, 100) +
        (sessionSummary.length > 100 ? "..." : "")
    );

    // Log session hash to Hedera Consensus Service
    const loggingResult = await sessionLoggingService.logSessionHash(
      sessionSummary
    );

    console.log("✅ Session hash logged to Hedera successfully!");
    console.log("🔒 SHA-256 hash:", loggingResult.hash);
    console.log("📩 Logged to Hedera topic:", loggingResult.topicId);
    console.log("📩 Transaction ID:", loggingResult.transactionId);

    let verificationResult = null;

    // Optional Mirror Node verification
    if (enableVerification) {
      console.log("🔍 Starting Mirror Node verification...");
      verificationResult = await sessionLoggingService.verifyHashOnMirrorNode(
        loggingResult.hash,
        6,
        5000
      );
    }

    // Prepare response
    const response = {
      success: true,
      transactionId: loggingResult.transactionId,
      hash: loggingResult.hash,
      topicId: loggingResult.topicId,
      timestamp: loggingResult.timestamp,
      ...(verificationResult && { verification: verificationResult }),
    };

    console.log("✅ Session logging completed successfully!\n");

    res.json(response);
  } catch (error) {
    console.error("❌ Session logging failed:", error.message);
    console.error("❌ Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Get session logging topic info
app.get("/session-topic", async (req, res) => {
  try {
    if (!servicesInitialized) {
      await initializeServices();
    }

    const topicId = sessionLoggingService.getLoggingTopicId();

    res.json({
      success: true,
      topicId: topicId,
      mirrorNodeUrl: `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// SafeGuard AI system prompt for women's safety and privacy
const HEDERA_SYSTEM_PROMPT = `You are a **trusted AI assistant for women's safety and privacy**, integrated with a Hedera-based backend for logging sessions and executing blockchain actions. Your main purpose is to **provide actionable guidance, legal advice, and emotional support** to users while maintaining privacy. 

CORE MISSION: Help women navigate threats, harassment, legal issues, and safety concerns with empathy and practical solutions.

RULES:
1. Always prioritize **user safety and privacy**. Never suggest sharing sensitive data on-chain or with untrusted parties.  
2. You can respond in **natural language**, giving step-by-step guidance on:
   - Handling threats, blackmail, or harassment
   - Contacting nearby NGOs or trusts
   - Filing police reports
   - Safe digital practices
   - Legal rights and protections
   - Emergency protocols

3. Only generate **JSON actions** when the user requests **blockchain operations** (e.g., check_balance, create_topic, send_message). The JSON must strictly follow this format:
{
"action": "<action_name>",
"parameters": { ... }
}

4. Do not output Hedera explanations unless the user asks explicitly.
5. Respond **empathetically** and clearly. Avoid generic blockchain lectures.
6. Provide links or contact info for local NGOs / authorities if applicable.
7. Always confirm actions that are logged to Hedera by referencing the transaction hash.

SUPPORTED BLOCKCHAIN ACTIONS:
- check_balance: { "accountId": "0.0.xxxxx" }
- create_topic: { "topicName": "Topic Name" }  
- send_message: { "topicId": "0.0.xxxxx", "message": "Your message text" }
- transfer_hbar: { "fromAccountId": "0.0.xxxxx", "toAccountId": "0.0.yyyyy", "amount": "10.5" }

EXAMPLE INTERACTIONS:

User: "Someone is threatening me with my private photos, what should I do?"  
Response: "I'm so sorry you're experiencing this. This is called image-based abuse and it's illegal in many jurisdictions. Here's what you can do immediately:

**Immediate Steps:**
1. **Do NOT respond** to the threats - this often escalates the situation
2. **Screenshot everything** as evidence (but store securely)
3. **Report to authorities** - this is a criminal offense
4. **Block the person** on all platforms

**Legal Protection:**
- File a police report for harassment/blackmail
- Contact a local women's rights organization for legal support
- Consider getting a restraining order

**Secure Documentation:**
I can help you create a secure, timestamped record of this incident on the blockchain for legal evidence. This creates an immutable record without exposing your private information.

Would you like me to help you document this incident securely, or would you prefer information about local support services?"

User: "Create a secure record of my harassment case"
Response: {"action":"create_topic","parameters":{"topicName":"Harassment_Case_Evidence_Log"}}

User: "Log this conversation as evidence"
Response: {"action":"send_message","parameters":{"topicId":"0.0.6916365","message":"Harassment case session logged - cryptographic hash of conversation for legal verification"}}

REMEMBER: Always respond with compassion, provide actionable advice, and only use blockchain features when specifically requested for evidence/logging purposes.`;

// Enhanced Gemini API call function with retry logic and fallbacks
async function callGeminiAPI(message, retryCount = 0) {
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [1000, 3000, 5000]; // Progressive backoff: 1s, 3s, 5s

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    console.log(
      `🤖 Attempting Gemini API call (attempt ${retryCount + 1}/${
        MAX_RETRIES + 1
      })`
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: HEDERA_SYSTEM_PROMPT },
                { text: `User message: ${message}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      const error = new Error(
        `Gemini API error (${response.status}): ${errorData}`
      );

      // Check if error is retryable
      if (
        response.status >= 500 ||
        response.status === 429 ||
        response.status === 503
      ) {
        if (retryCount < MAX_RETRIES) {
          console.log(
            `⏳ Retrying in ${RETRY_DELAYS[retryCount]}ms due to ${response.status} error...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAYS[retryCount])
          );
          return await callGeminiAPI(message, retryCount + 1);
        }
      }
      throw error;
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    console.log("✅ Gemini API call successful");
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error(
      `❌ Gemini API error (attempt ${retryCount + 1}):`,
      error.message
    );

    // Handle timeout errors
    if (error.name === "AbortError") {
      if (retryCount < MAX_RETRIES) {
        console.log(
          `⏳ Retrying in ${RETRY_DELAYS[retryCount]}ms due to timeout...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAYS[retryCount])
        );
        return await callGeminiAPI(message, retryCount + 1);
      }
      throw new Error("Gemini API timeout after multiple attempts");
    }

    // Handle network errors and 503 service unavailable
    if (
      error.message.includes("503") ||
      error.message.includes("UNAVAILABLE") ||
      error.message.includes("fetch")
    ) {
      if (retryCount < MAX_RETRIES) {
        console.log(
          `⏳ Retrying in ${RETRY_DELAYS[retryCount]}ms due to service unavailability...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAYS[retryCount])
        );
        return await callGeminiAPI(message, retryCount + 1);
      }
    }

    // If all retries failed, return fallback response
    if (retryCount >= MAX_RETRIES) {
      console.log("🔄 All retries exhausted, using fallback response");
      return getFallbackResponse(message);
    }

    throw error;
  }
}

// Fallback response when Gemini API is unavailable
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Check if it's a Hedera-specific request
  // Check for safety-related keywords and provide appropriate fallback actions
  if (
    lowerMessage.includes("harassment") ||
    lowerMessage.includes("threat") ||
    lowerMessage.includes("evidence") ||
    lowerMessage.includes("log")
  ) {
    return JSON.stringify({
      action: "create_topic",
      parameters: { topicName: "Safety_Evidence_Log" },
      reason: "User needs to document safety incident",
    });
  }

  if (
    lowerMessage.includes("record") ||
    lowerMessage.includes("document") ||
    lowerMessage.includes("session")
  ) {
    return JSON.stringify({
      action: "send_message",
      parameters: {
        topicId: "0.0.6916365",
        message:
          "Safety incident session logged - secure evidence documentation",
      },
      reason: "User requested session documentation",
    });
  }

  if (lowerMessage.includes("balance") || lowerMessage.includes("account")) {
    return JSON.stringify({
      action: "check_balance",
      parameters: { accountId: "0.0.6915283" },
      reason: "User requested balance check",
    });
  }

  if (lowerMessage.includes("topic") && lowerMessage.includes("create")) {
    return JSON.stringify({
      action: "create_topic",
      parameters: { topicName: "Support_Topic" },
      reason: "User requested topic creation",
    });
  }

  // Default conversational fallback with safety focus
  const safetyFallbackResponses = [
    "I'm experiencing temporary connectivity issues, but your safety is still my priority. While I reconnect to my full AI capabilities, I want you to know that:\n\n• Your privacy is protected - nothing sensitive is shared\n• Emergency services are always available (call your local emergency number)\n• This platform's security features continue working\n• All conversations are still being securely logged for your protection\n\nIf you're in immediate danger, please contact emergency services. Otherwise, I'll be back to full capacity shortly.",

    "My AI service is temporarily unavailable, but your SafeGuard platform remains fully secure. Important reminders while I recover:\n\n• Your data is cryptographically protected\n• Evidence logging continues working\n• Never share sensitive information with untrusted parties\n• Keep screenshots of any threats as evidence\n\nFor immediate safety concerns, contact local authorities. I'll be back online soon to provide full support.",

    "I'm having connectivity issues but want to ensure you're supported. While my AI reasoning is recovering:\n\n• Emergency contacts remain the same\n• Your secure documentation features are still active  \n• Never respond directly to threats or harassment\n• Trust your instincts about your safety\n\nIf this is urgent, please reach out to local support services. I'll return to full capacity shortly to help with your specific situation.",
  ];

  return safetyFallbackResponses[
    Math.floor(Math.random() * safetyFallbackResponses.length)
  ];
}

// Execute Hedera action
async function executeHederaAction(action, parameters) {
  console.log("🎯 Executing Hedera action:", action);
  console.log("📋 Parameters:", parameters);

  switch (action) {
    case "check_balance":
      const balance = await hederaService.getAccountBalance(
        parameters.accountId
      );
      console.log("✅ Balance retrieved:", balance);
      return balance;

    case "create_topic":
      const topic = await hederaService.createTopic(parameters.topicName);
      console.log("✅ Topic created:", topic);
      return topic;

    case "send_message":
      const message = await hederaService.submitMessage(
        parameters.topicId,
        parameters.message
      );
      console.log("✅ Message sent:", message);
      return message;

    case "transfer_hbar":
      // Placeholder - implement HBAR transfer logic
      console.log("⚠️  HBAR transfer not yet implemented");
      return {
        status: "not_implemented",
        message: "HBAR transfer functionality coming soon",
      };

    default:
      throw new Error(`Unsupported action: ${action}`);
  }
}

// Main chatbot endpoint
app.post("/chatbot", async (req, res) => {
  try {
    console.log("\n💬 === CHATBOT REQUEST ===");

    // Ensure services are initialized
    if (!servicesInitialized) {
      await initializeServices();
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    console.log("💬 User message:", message);

    // Send message to Gemini with enhanced error handling
    console.log("🤖 Sending to Gemini Flash 2.5...");
    let geminiResponse;
    let isApiError = false;

    try {
      geminiResponse = await callGeminiAPI(message);
      console.log("🤖 Gemini response:", geminiResponse);
    } catch (error) {
      console.error("🚨 Gemini API completely failed:", error.message);
      isApiError = true;

      // Use fallback response if all retries failed
      if (
        error.message.includes("503") ||
        error.message.includes("UNAVAILABLE") ||
        error.message.includes("timeout") ||
        error.message.includes("fetch")
      ) {
        geminiResponse = getFallbackResponse(message);
        console.log("🔄 Using fallback response:", geminiResponse);
      } else {
        throw error; // Re-throw non-service errors
      }
    }

    // Try to parse as JSON (Hedera action)
    let parsedAction;
    try {
      parsedAction = JSON.parse(geminiResponse);
      if (parsedAction.action && parsedAction.parameters) {
        console.log("🎯 Hedera action detected:", parsedAction.action);

        // Execute Hedera action
        const result = await executeHederaAction(
          parsedAction.action,
          parsedAction.parameters
        );

        console.log("✅ Hedera action completed successfully");

        return res.json({
          success: true,
          type: "hedera_action",
          action: parsedAction.action,
          result: result,
          fallbackMode: isApiError,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      // Not JSON - treat as conversation
      console.log("💭 Conversation response detected");
    }

    // Return conversation response
    console.log("✅ Conversation response sent");

    res.json({
      success: true,
      type: "conversation",
      response: geminiResponse,
      fallbackMode: isApiError,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Chatbot error:", error.message);
    console.error("❌ Stack trace:", error.stack);

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  console.error("❌ Stack trace:", err.stack);

  res.status(500).json({
    success: false,
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Gracefully shutting down server...");

  if (hederaService.isInitialized()) {
    console.log("🔧 Closing Hedera client...");
    // Add any cleanup if needed
  }

  console.log("✅ Server shutdown complete");
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log("🌟 ================================");
  console.log("🚀 Hedera + Session Logging Server");
  console.log("🌟 ================================");
  console.log(`🌐 Server running on port: ${PORT}`);
  console.log("📝 Session Logging: ENABLED");
  console.log("🤖 Chatbot: ENABLED");
  console.log("🔗 Hedera SDK: ENABLED");
  console.log("🌟 ================================\n");

  try {
    await initializeServices();
    console.log("🎉 All services ready! Send requests to:");
    console.log(`   POST http://localhost:${PORT}/log-session`);
    console.log(`   POST http://localhost:${PORT}/chatbot`);
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log(`   GET  http://localhost:${PORT}/session-topic\n`);
  } catch (error) {
    console.error("❌ Failed to initialize services on startup");
    console.error("❌ Services will be initialized on first request");
  }
});

export default app;
