import fetch from "node-fetch";

const BASE_URL = "http://localhost:4000/api/hedera";

async function testHCS() {
  console.log("🧪 Testing Hedera Consensus Service Integration");
  console.log("================================================\n");

  try {
    // 1. Check service status
    console.log("1. 📊 Checking Hedera service status...");
    const statusResponse = await fetch(`${BASE_URL}/status`);
    const statusData = await statusResponse.json();
    console.log("✅ Status:", JSON.stringify(statusData, null, 2));

    if (!statusData.initialized) {
      console.log("❌ Hedera service not initialized. Check your credentials.");
      return;
    }

    // 2. Create a new topic
    console.log("\n2. 🏗️  Creating a new HCS topic...");
    const topicResponse = await fetch(`${BASE_URL}/create-topic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memo: "Test topic for evidence logging",
      }),
    });

    const topicData = await topicResponse.json();
    console.log("📋 Topic Response:", JSON.stringify(topicData, null, 2));

    if (!topicData.success || !topicData.topicId) {
      console.log("❌ Failed to create topic:", topicData.error);
      return;
    }

    const topicId = topicData.topicId;
    console.log(`✅ Topic created successfully: ${topicId}`);

    // 3. Send first message
    console.log(`\n3. 📤 Sending first message to topic: ${topicId}`);
    const message1Response = await fetch(`${BASE_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topicId: topicId,
        message: "Hello from HCS! Evidence hash: abc123",
      }),
    });

    const message1Data = await message1Response.json();
    console.log(
      "📨 Message 1 Response:",
      JSON.stringify(message1Data, null, 2)
    );

    // 4. Send second message
    console.log("\n4. 📤 Sending second message...");
    const message2Response = await fetch(`${BASE_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topicId: topicId,
        message: "Second evidence entry: def456",
      }),
    });

    const message2Data = await message2Response.json();
    console.log(
      "📨 Message 2 Response:",
      JSON.stringify(message2Data, null, 2)
    );

    // 5. Test error handling with invalid topic
    console.log("\n5. 🧪 Testing error handling with invalid topic...");
    const errorResponse = await fetch(`${BASE_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topicId: "0.0.999999999",
        message: "This should fail",
      }),
    });

    const errorData = await errorResponse.json();
    console.log(
      "❌ Expected Error Response:",
      JSON.stringify(errorData, null, 2)
    );

    console.log("\n✅ HCS Testing Complete!");
    console.log("🔍 Check your server console for detailed logs.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n🔧 Make sure your server is running on port 4000");
  }
}

// Run the test
testHCS();
