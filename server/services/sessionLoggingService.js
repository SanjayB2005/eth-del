import crypto from "crypto";
import hederaService from "./hederaService.js";

class SessionLoggingService {
  constructor() {
    this.loggingTopicId = null;
    this.mirrorNodeBaseUrl = "https://testnet.mirrornode.hedera.com";
  }

  /**
   * Initialize the session logging service
   * Creates a logging topic if not provided
   */
  async initialize(topicId = null) {
    try {
      console.log("🔧 Initializing Session Logging Service...");

      if (topicId) {
        this.loggingTopicId = topicId;
        console.log(`📝 Using existing topic for session logging: ${topicId}`);
      } else {
        // Create a dedicated topic for session logging
        const topicResult = await hederaService.createTopic("SessionAuditLogs");
        this.loggingTopicId = topicResult.topicId;
        console.log(
          `📝 Created new session logging topic: ${this.loggingTopicId}`
        );
      }

      return {
        success: true,
        loggingTopicId: this.loggingTopicId,
      };
    } catch (error) {
      console.error(
        "❌ Failed to initialize session logging service:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Compute SHA-256 hash of session summary
   */
  computeHash(sessionSummary) {
    const hash = crypto
      .createHash("sha256")
      .update(sessionSummary)
      .digest("hex");
    console.log("🔒 SHA-256 hash computed:", hash);
    return hash;
  }

  /**
   * Log session hash to Hedera Consensus Service
   */
  async logSessionHash(sessionSummary) {
    try {
      if (!this.loggingTopicId) {
        throw new Error(
          "Session logging service not initialized. Call initialize() first."
        );
      }

      console.log("📝 Session summary received for logging");
      console.log("📄 Summary length:", sessionSummary.length, "characters");

      // Compute SHA-256 hash
      const sessionHash = this.computeHash(sessionSummary);

      // Create audit log message with metadata
      const auditLogMessage = JSON.stringify({
        type: "session_audit",
        hash: sessionHash,
        timestamp: new Date().toISOString(),
        summaryLength: sessionSummary.length,
        version: "1.0",
      });

      console.log("📊 Audit log message prepared:", auditLogMessage);

      // Submit hash to Hedera Consensus Service
      console.log(
        "📩 Submitting audit log to Hedera topic:",
        this.loggingTopicId
      );
      const result = await hederaService.submitMessage(
        this.loggingTopicId,
        auditLogMessage
      );

      console.log("✅ Session hash logged successfully!");
      console.log("📩 Transaction ID:", result.transactionId);
      console.log("🔗 Topic ID:", this.loggingTopicId);
      console.log("🔒 Hash on blockchain:", sessionHash);

      return {
        success: true,
        transactionId: result.transactionId,
        hash: sessionHash,
        topicId: this.loggingTopicId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Failed to log session hash:", error.message);
      throw error;
    }
  }

  /**
   * Verify hash exists on Mirror Node (optional polling)
   */
  async verifyHashOnMirrorNode(hash, maxAttempts = 10, intervalMs = 5000) {
    try {
      console.log("🔍 Starting Mirror Node verification for hash:", hash);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`🔍 Verification attempt ${attempt}/${maxAttempts}...`);

        try {
          const url = `${this.mirrorNodeBaseUrl}/api/v1/topics/${this.loggingTopicId}/messages?limit=50`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Mirror Node API error: ${response.status}`);
          }

          const data = await response.json();

          // Search for our hash in recent messages
          const messages = data.messages || [];
          const foundMessage = messages.find((msg) => {
            try {
              const decodedMessage = Buffer.from(
                msg.message,
                "base64"
              ).toString("utf-8");
              const parsed = JSON.parse(decodedMessage);
              return parsed.hash === hash;
            } catch (e) {
              return false;
            }
          });

          if (foundMessage) {
            console.log("✅ Hash verified on Mirror Node!");
            console.log("🔗 Sequence number:", foundMessage.sequence_number);
            console.log(
              "⏰ Consensus timestamp:",
              foundMessage.consensus_timestamp
            );

            return {
              verified: true,
              sequenceNumber: foundMessage.sequence_number,
              consensusTimestamp: foundMessage.consensus_timestamp,
              attempt: attempt,
            };
          }

          if (attempt < maxAttempts) {
            console.log(
              `⏳ Hash not found yet, waiting ${
                intervalMs / 1000
              }s before next attempt...`
            );
            await new Promise((resolve) => setTimeout(resolve, intervalMs));
          }
        } catch (error) {
          console.error(
            `❌ Mirror Node verification attempt ${attempt} failed:`,
            error.message
          );
          if (attempt === maxAttempts) {
            throw error;
          }
        }
      }

      console.log("⚠️  Hash verification timed out - may still be propagating");
      return {
        verified: false,
        message:
          "Verification timed out - hash may still be propagating to Mirror Node",
      };
    } catch (error) {
      console.error("❌ Mirror Node verification failed:", error.message);
      return {
        verified: false,
        error: error.message,
      };
    }
  }

  /**
   * Get logging topic ID
   */
  getLoggingTopicId() {
    return this.loggingTopicId;
  }

  /**
   * Set custom logging topic ID
   */
  setLoggingTopicId(topicId) {
    this.loggingTopicId = topicId;
    console.log("📝 Session logging topic updated:", topicId);
  }
}

// Export singleton instance
const sessionLoggingService = new SessionLoggingService();
export default sessionLoggingService;
