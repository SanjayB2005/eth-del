import fetch from "node-fetch";

async function testEndpoints() {
  const baseUrl = "http://localhost:4000";
  const endpoints = ["/api/health", "/api/hedera/status", "/api/hedera/demo"];

  console.log("🧪 Testing Hedera integration endpoints...\n");

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint}`);
      const response = await fetch(`${baseUrl}${endpoint}`);
      const data = await response.json();
      console.log(`✅ Status: ${response.status}`);
      console.log("📄 Response:", JSON.stringify(data, null, 2));
      console.log("─".repeat(50));
    } catch (error) {
      console.log(`❌ Error testing ${endpoint}:`, error.message);
    }
  }
}

testEndpoints();
