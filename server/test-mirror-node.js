import fetch from "node-fetch";

const BASE_URL = "http://localhost:4000/api/hedera";

async function testMirrorNodeIntegration() {
  console.log("🌐 Testing Hedera Mirror Node Integration");
  console.log("==========================================\n");

  try {
    let topicId = null;

    // Step 1: Check service status
    console.log("1. 📊 Checking Hedera service status...");
    const statusResponse = await fetch(`${BASE_URL}/status`);
    const statusData = await statusResponse.json();

    if (!statusData.initialized) {
      console.log("❌ Hedera service not initialized. Check your credentials.");
      return;
    }
    console.log("✅ Hedera service is running");
    console.log(`   Account: ${statusData.operatorAccount}`);

    // Step 2: Create a new topic for testing
    console.log("\n2. 🏗️  Creating a new HCS topic for Mirror Node testing...");
    const topicResponse = await fetch(`${BASE_URL}/create-topic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memo: "Mirror Node Test Topic" }),
    });

    const topicData = await topicResponse.json();
    if (!topicData.success) {
      console.log("❌ Failed to create topic:", topicData.error);
      return;
    }

    topicId = topicData.topicId;
    console.log("✅ Topic created:", topicId);

    // Step 3: Start Mirror Node listener
    console.log(`\n3. 🎧 Starting Mirror Node listener for topic: ${topicId}`);
    const listenResponse = await fetch(`${BASE_URL}/listen/${topicId}`);
    const listenData = await listenResponse.json();

    if (!listenData.success) {
      console.log("❌ Failed to start listener:", listenData.error);
      return;
    }
    console.log("✅ Mirror Node listener started");
    console.log(`   Polling every: ${listenData.pollInterval}`);

    // Step 4: Wait a moment for listener to initialize
    console.log("\n4. ⏳ Waiting for listener to initialize...");
    await sleep(3000);

    // Step 5: Send test messages
    console.log("\n5. 📤 Sending test messages to the topic...");

    const messages = [
      "Mirror Node Test Message #1",
      "Evidence hash: abc123def456",
      "Mirror Node Test Message #3 with longer content",
    ];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      console.log(`   📝 Sending message ${i + 1}: "${message}"`);

      const messageResponse = await fetch(`${BASE_URL}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, message }),
      });

      const messageData = await messageResponse.json();
      if (messageData.success) {
        console.log(
          `   ✅ Message ${
            i + 1
          } sent - Transaction: ${messageData.transactionId.substring(
            0,
            25
          )}...`
        );
      } else {
        console.log(
          `   ❌ Failed to send message ${i + 1}:`,
          messageData.error
        );
      }

      // Wait between messages to see them individually
      await sleep(2000);
    }

    // Step 6: Wait for messages to propagate and be detected
    console.log("\n6. ⏰ Waiting for messages to propagate to Mirror Node...");
    console.log(
      "   (Messages typically appear in Mirror Node within 1-2 seconds)"
    );
    console.log("   Watch the server console for Mirror Node updates!");
    await sleep(10000);

    // Step 7: Check listener status
    console.log("\n7. 📊 Checking Mirror Node listener status...");
    const statusMirrorResponse = await fetch(`${BASE_URL}/mirror-status`);
    const statusMirrorData = await statusMirrorResponse.json();

    console.log("✅ Mirror Node Status:");
    console.log(
      `   Active listeners: ${statusMirrorData.status.activeListeners}`
    );
    console.log(
      `   Listening to topics: ${statusMirrorData.status.topics.join(", ")}`
    );

    // Step 8: Test invalid topic ID
    console.log("\n8. 🧪 Testing error handling with invalid topic ID...");
    const invalidResponse = await fetch(`${BASE_URL}/listen/invalid-topic-id`);
    const invalidData = await invalidResponse.json();

    if (!invalidData.success) {
      console.log("✅ Invalid topic ID properly rejected:", invalidData.error);
    }

    // Step 9: Stop the listener
    console.log(`\n9. 🛑 Stopping Mirror Node listener for topic: ${topicId}`);
    const stopResponse = await fetch(`${BASE_URL}/stop-listening/${topicId}`, {
      method: "POST",
    });
    const stopData = await stopResponse.json();

    if (stopData.success) {
      console.log("✅ Listener stopped successfully");
    } else {
      console.log("⚠️  Stop result:", stopData.message);
    }

    console.log("\n🎉 Mirror Node Integration Test Complete!");
    console.log("=========================================");
    console.log("💡 Tips:");
    console.log(
      '   - Check server console for "🔎 MirrorNode update:" messages'
    );
    console.log("   - Mirror Node messages appear with ~1-2 second delay");
    console.log("   - Listener polls every 5 seconds for new messages");
    console.log("   - Use /api/hedera/mirror-status to check active listeners");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n🔧 Make sure:");
    console.log("   - Server is running on port 4000");
    console.log("   - Hedera credentials are configured");
    console.log("   - Internet connection is available for Mirror Node API");
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run the test
testMirrorNodeIntegration();
