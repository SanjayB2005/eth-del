import {
  Client,
  AccountId,
  PrivateKey,
  AccountBalanceQuery,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testHederaConnection() {
  console.log("🧪 Testing Hedera connection...");

  try {
    // Check if environment variables are set
    if (!process.env.HEDERA_OPERATOR_ID || !process.env.HEDERA_OPERATOR_KEY) {
      console.log("❌ Hedera credentials not found in .env file");
      console.log(
        "📝 Please set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in your .env file"
      );
      console.log("");
      console.log("Example:");
      console.log("HEDERA_OPERATOR_ID=0.0.123456");
      console.log("HEDERA_OPERATOR_KEY=302e020100300506032b657004220420...");
      process.exit(1);
    }

    console.log(`📋 Operator ID: ${process.env.HEDERA_OPERATOR_ID}`);
    console.log(
      `🔑 Private Key: ${process.env.HEDERA_OPERATOR_KEY.substring(0, 20)}...`
    );

    // Parse operator credentials
    const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);

    // Create Hedera client for testnet
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    console.log("🌐 Connected to Hedera Testnet");

    // Test the connection by querying account balance
    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    console.log(`✅ Successfully connected to Hedera!`);
    console.log(`📊 Account Balance: ${accountBalance.hbars.toString()}`);

    // Close the connection
    client.close();
    console.log("🔒 Connection closed");
  } catch (error) {
    console.error("❌ Hedera connection failed:", error.message);
    console.log("");
    console.log("🔧 Troubleshooting steps:");
    console.log(
      "1. Check if your Hedera account ID is correct (format: 0.0.123456)"
    );
    console.log(
      "2. Check if your private key is correct (starts with 302e...)"
    );
    console.log("3. Make sure your account has some HBAR for gas fees");
    console.log("4. Verify you're using testnet credentials");
    process.exit(1);
  }
}

// Run the test
testHederaConnection();
