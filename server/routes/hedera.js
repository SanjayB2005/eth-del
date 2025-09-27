import express from "express";
import hederaService from "../services/hederaService.js";
import mirrorNodeService from "../services/mirrorNodeService.js";

const router = express.Router();

// Get Hedera service status
router.get("/status", async (req, res) => {
  try {
    if (!hederaService.isInitialized()) {
      return res.status(503).json({
        error: "Hedera service not initialized",
        initialized: false,
      });
    }

    const operatorId = hederaService.getOperatorId();
    const balance = await hederaService.getAccountBalance();

    res.json({
      initialized: true,
      operatorAccount: operatorId.toString(),
      balance: balance,
      network: "testnet",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Hedera status error:", error);
    res.status(500).json({
      error: "Failed to get Hedera status",
      message: error.message,
    });
  }
});

// Get account balance
router.get("/balance/:accountId?", async (req, res) => {
  try {
    if (!hederaService.isInitialized()) {
      return res.status(503).json({
        error: "Hedera service not initialized",
      });
    }

    const accountId = req.params.accountId || null;
    const balance = await hederaService.getAccountBalance(accountId);

    res.json({
      success: true,
      data: balance,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Balance query error:", error);
    res.status(400).json({
      error: "Failed to get account balance",
      message: error.message,
    });
  }
});

// Hedera Consensus Service Routes

// Create a new HCS topic
router.post("/create-topic", async (req, res) => {
  try {
    if (!hederaService.isInitialized()) {
      return res.status(503).json({
        success: false,
        error: "Hedera service not initialized",
      });
    }

    const { memo } = req.body || {};
    const result = await hederaService.createTopic(memo);

    console.log(`🎯 Topic created successfully: ${result.topicId}`);

    res.json({
      success: true,
      topicId: result.topicId,
      transactionId: result.transactionId,
      memo: result.memo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Create topic error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Submit a message to HCS topic
router.post("/send-message", async (req, res) => {
  try {
    if (!hederaService.isInitialized()) {
      return res.status(503).json({
        success: false,
        error: "Hedera service not initialized",
      });
    }

    const { topicId, message } = req.body;

    // Validate required fields
    if (!topicId || !message) {
      return res.status(400).json({
        success: false,
        error: "Both topicId and message are required",
      });
    }

    const result = await hederaService.submitMessage(topicId, message);

    console.log(`📨 Message sent successfully to topic ${topicId}`);

    res.json({
      success: true,
      topicId: result.topicId,
      message: result.message,
      transactionId: result.transactionId,
      sequenceNumber: result.sequenceNumber,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Send message error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Mirror Node Routes

// Start listening to a topic via Mirror Node
router.get("/listen/:topicId", async (req, res) => {
  try {
    const { topicId } = req.params;

    console.log(`🎧 Received request to listen to topic: ${topicId}`);

    // Validate topic ID format
    if (!mirrorNodeService.isValidTopicId(topicId)) {
      console.log(`❌ Invalid topic ID format: ${topicId}`);
      return res.status(400).json({
        success: false,
        error: `Invalid topic ID format: ${topicId}. Expected format: 0.0.xxxxx`,
      });
    }

    // Start listening
    mirrorNodeService.startListening(topicId);

    console.log(`✅ Started Mirror Node listener for topic ${topicId}`);

    res.json({
      success: true,
      listening: topicId,
      message: `Started listening to topic ${topicId}`,
      pollInterval: "5000ms",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Mirror Node listen error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Stop listening to a topic
router.post("/stop-listening/:topicId", async (req, res) => {
  try {
    const { topicId } = req.params;

    console.log(`🛑 Received request to stop listening to topic: ${topicId}`);

    const stopped = mirrorNodeService.stopListening(topicId);

    if (stopped) {
      console.log(`✅ Stopped listening to topic ${topicId}`);
      res.json({
        success: true,
        message: `Stopped listening to topic ${topicId}`,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log(`⚠️  No active listener found for topic ${topicId}`);
      res.json({
        success: false,
        message: `No active listener found for topic ${topicId}`,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("❌ Stop listening error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Mirror Node listener status
router.get("/mirror-status", async (req, res) => {
  try {
    const status = mirrorNodeService.getListenerStatus();

    console.log(
      `📊 Mirror Node status requested - ${status.activeListeners} active listeners`
    );

    res.json({
      success: true,
      status: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Mirror status error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
