import fetch from "node-fetch";

// Test the exact example you provided
async function demonstrateExample() {
  console.log("🎯 Demonstrating Complete Chatbot Flow");
  console.log("======================================");

  const testMessage = "Create a new topic called 'CaseReports'";

  console.log("📝 Test Message:", testMessage);
  console.log("");
  console.log("🔄 Expected Flow:");
  console.log("1. User sends message to /chatbot endpoint");
  console.log("2. Backend sends to Gemini Flash 2.5");
  console.log("3. Gemini returns JSON with Hedera action");
  console.log("4. Backend executes Hedera SDK operation");
  console.log("5. Backend returns result to frontend");
  console.log("");

  try {
    console.log("📡 Making request to chatbot...");
    const response = await fetch("http://localhost:4000/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: testMessage }),
    });

    const data = await response.json();

    console.log("✅ Response received:");
    console.log(JSON.stringify(data, null, 2));

    console.log("");
    console.log("🎉 Complete! Check server console for detailed logs.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("");
    console.log("💡 Make sure server is running with: npm run chatbot");
  }
}

console.log("Expected Server Console Output:");
console.log("==============================");
console.log("💬 User message: Create a new topic called 'CaseReports'");
console.log("🤖 Sending to Gemini Flash 2.5...");
console.log(
  '🤖 Gemini response: {"action":"create_topic","parameters":{"topicName":"CaseReports"}}'
);
console.log("🎯 Hedera action detected: create_topic");
console.log("🎯 Executing Hedera action: create_topic");
console.log('📋 Parameters: { topicName: "CaseReports" }');
console.log("✅ Topic created: 0.0.6915768 with memo: CaseReports");
console.log("✅ Hedera action completed successfully");
console.log("");

demonstrateExample();
