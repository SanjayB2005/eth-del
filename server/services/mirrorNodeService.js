import fetch from "node-fetch";

class MirrorNodeService {
  constructor() {
    this.baseUrl = "https://testnet.mirrornode.hedera.com/api/v1";
    this.activeListeners = new Map(); // Store active polling intervals
    this.lastProcessedTimestamp = new Map(); // Track last processed message per topic
  }

  /**
   * Start listening to messages for a specific topic
   * @param {string} topicId - The Hedera topic ID to listen to
   * @param {number} pollInterval - Polling interval in milliseconds (default: 5000)
   */
  startListening(topicId, pollInterval = 5000) {
    try {
      console.log(`🎧 Starting Mirror Node listener for topic ${topicId}...`);

      // Stop existing listener if any
      this.stopListening(topicId);

      // Initialize last processed timestamp for this topic
      if (!this.lastProcessedTimestamp.has(topicId)) {
        this.lastProcessedTimestamp.set(topicId, null);
      }

      // Start polling
      const intervalId = setInterval(async () => {
        try {
          await this.pollTopicMessages(topicId);
        } catch (error) {
          console.error(`❌ Error polling topic ${topicId}:`, error.message);
        }
      }, pollInterval);

      // Store the interval ID
      this.activeListeners.set(topicId, intervalId);

      console.log(
        `✅ Mirror Node listener started for topic ${topicId} (polling every ${pollInterval}ms)`
      );

      // Do an initial poll
      this.pollTopicMessages(topicId).catch((error) => {
        console.error(
          `❌ Initial poll error for topic ${topicId}:`,
          error.message
        );
      });

      return true;
    } catch (error) {
      console.error(
        `❌ Failed to start listener for topic ${topicId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Stop listening to messages for a specific topic
   * @param {string} topicId - The topic ID to stop listening to
   */
  stopListening(topicId) {
    const intervalId = this.activeListeners.get(topicId);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeListeners.delete(topicId);
      console.log(`🛑 Stopped listening to topic ${topicId}`);
      return true;
    }
    return false;
  }

  /**
   * Stop all active listeners
   */
  stopAllListeners() {
    console.log(`🛑 Stopping all Mirror Node listeners...`);
    for (const [topicId, intervalId] of this.activeListeners) {
      clearInterval(intervalId);
      console.log(`🛑 Stopped listener for topic ${topicId}`);
    }
    this.activeListeners.clear();
    this.lastProcessedTimestamp.clear();
    console.log(`✅ All Mirror Node listeners stopped`);
  }

  /**
   * Poll messages for a specific topic
   * @param {string} topicId - The topic ID to poll
   */
  async pollTopicMessages(topicId) {
    try {
      // Build the API URL
      let apiUrl = `${this.baseUrl}/topics/${topicId}/messages?limit=10&order=asc`;

      // Add timestamp filter if we have processed messages before
      const lastTimestamp = this.lastProcessedTimestamp.get(topicId);
      if (lastTimestamp) {
        apiUrl += `&timestamp=gt:${lastTimestamp}`;
      }

      // Make API request
      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Topic ${topicId} not found or has no messages`);
        }
        throw new Error(
          `Mirror Node API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        console.log(
          `📡 Found ${data.messages.length} new message(s) for topic ${topicId}`
        );

        // Process each message
        for (const message of data.messages) {
          this.processMessage(topicId, message);
          // Update last processed timestamp
          this.lastProcessedTimestamp.set(topicId, message.consensus_timestamp);
        }
      }
    } catch (error) {
      // Only log non-404 errors to avoid spam
      if (!error.message.includes("not found")) {
        console.error(`❌ Error polling topic ${topicId}:`, error.message);
      }
      throw error;
    }
  }

  /**
   * Process a single message from Mirror Node
   * @param {string} topicId - The topic ID
   * @param {object} message - The message object from Mirror Node API
   */
  processMessage(topicId, message) {
    try {
      // Decode the message content from base64
      const messageContent = message.message
        ? Buffer.from(message.message, "base64").toString("utf-8")
        : "[Empty message]";

      // Log the message in the requested format
      console.log(
        `🔎 MirrorNode update: ${messageContent} (topic: ${topicId})`
      );

      // Additional detailed logging
      console.log(`   📅 Timestamp: ${message.consensus_timestamp}`);
      console.log(`   🔢 Sequence: ${message.sequence_number}`);
      console.log(`   👤 Payer: ${message.payer_account_id}`);
    } catch (error) {
      console.error(`❌ Error processing message:`, error.message);
    }
  }

  /**
   * Get status of all active listeners
   */
  getListenerStatus() {
    const status = {
      activeListeners: this.activeListeners.size,
      topics: Array.from(this.activeListeners.keys()),
      lastProcessed: Object.fromEntries(this.lastProcessedTimestamp),
    };
    return status;
  }

  /**
   * Check if a topic ID is valid format
   * @param {string} topicId - Topic ID to validate
   */
  isValidTopicId(topicId) {
    // Hedera topic ID format: 0.0.xxxx
    const topicIdRegex = /^0\.0\.\d+$/;
    return topicIdRegex.test(topicId);
  }
}

// Export singleton instance
const mirrorNodeService = new MirrorNodeService();
export default mirrorNodeService;
