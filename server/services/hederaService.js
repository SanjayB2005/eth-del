import {
  Client,
  AccountId,
  PrivateKey,
  AccountBalanceQuery,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

class HederaService {
  constructor() {
    this.client = null;
    this.operatorId = null;
    this.operatorKey = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log("🔧 Initializing Hedera service...");

      // Validate environment variables
      if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
        throw new Error("Missing Hedera credentials in environment variables");
      }

      // Parse operator credentials
      this.operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
      this.operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);

      // Create Hedera client for testnet
      this.client = Client.forTestnet();
      this.client.setOperator(this.operatorId, this.operatorKey);

      // Test the connection by querying account balance
      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(this.operatorId)
        .execute(this.client);

      console.log(
        `✅ Hedera client initialized for account: ${this.operatorId}`
      );
      console.log(`📊 Account balance: ${accountBalance.hbars.toString()}`);

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Hedera service:", error.message);
      this.initialized = false;
      throw error;
    }
  }

  isInitialized() {
    return this.initialized;
  }

  getClient() {
    if (!this.initialized) {
      throw new Error("Hedera service not initialized");
    }
    return this.client;
  }

  getOperatorId() {
    if (!this.initialized) {
      throw new Error("Hedera service not initialized");
    }
    return this.operatorId;
  }

  async getAccountBalance(accountId = null) {
    if (!this.initialized) {
      throw new Error("Hedera service not initialized");
    }

    try {
      const targetAccountId = accountId || this.operatorId;
      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(targetAccountId)
        .execute(this.client);

      return {
        accountId: targetAccountId.toString(),
        hbars: accountBalance.hbars.toString(),
        tokens: accountBalance.tokens ? accountBalance.tokens : {},
      };
    } catch (error) {
      console.error("Failed to get account balance:", error.message);
      throw error;
    }
  }

  // Hedera Consensus Service Methods
  async createTopic(topicMemo = "") {
    if (!this.initialized) {
      throw new Error("Hedera service not initialized");
    }

    try {
      console.log("🏗️  Creating new HCS topic...");

      // Create the topic
      const transaction = new TopicCreateTransaction();

      if (topicMemo) {
        transaction.setTopicMemo(topicMemo);
      }

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const topicId = receipt.topicId;

      console.log(`✅ Topic created successfully: ${topicId}`);

      return {
        topicId: topicId.toString(),
        transactionId: txResponse.transactionId.toString(),
        memo: topicMemo,
      };
    } catch (error) {
      console.error("❌ Failed to create topic:", error.message);
      throw error;
    }
  }

  async submitMessage(topicId, message) {
    if (!this.initialized) {
      throw new Error("Hedera service not initialized");
    }

    try {
      console.log(`📤 Submitting message to topic ${topicId}...`);

      // Submit message to topic
      const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      console.log(`📩 Message sent to topic ${topicId}: ${message}`);

      return {
        topicId: topicId.toString(),
        message: message,
        transactionId: txResponse.transactionId.toString(),
        sequenceNumber: receipt.topicSequenceNumber
          ? receipt.topicSequenceNumber.toString()
          : null,
      };
    } catch (error) {
      console.error(
        `❌ Failed to submit message to topic ${topicId}:`,
        error.message
      );
      throw error;
    }
  }

  async cleanup() {
    if (this.client) {
      this.client.close();
      console.log("🔒 Hedera client connection closed");
    }
  }
}

// Export singleton instance
const hederaService = new HederaService();
export default hederaService;
