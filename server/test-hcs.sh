#!/bin/bash

# Hedera Consensus Service Testing Script
# Make sure your server is running on port 4000

echo "🧪 Testing Hedera Consensus Service Integration"
echo "================================================"

BASE_URL="http://localhost:4000/api/hedera"

echo ""
echo "1. 📊 Checking Hedera service status..."
curl -s -X GET "$BASE_URL/status" | jq '.'

echo ""
echo "2. 🏗️  Creating a new HCS topic..."
TOPIC_RESPONSE=$(curl -s -X POST "$BASE_URL/create-topic" \
  -H "Content-Type: application/json" \
  -d '{"memo": "Test topic for evidence logging"}')

echo "$TOPIC_RESPONSE" | jq '.'

# Extract topic ID from response (assuming jq is available)
TOPIC_ID=$(echo "$TOPIC_RESPONSE" | jq -r '.topicId')

if [ "$TOPIC_ID" != "null" ] && [ "$TOPIC_ID" != "" ]; then
  echo ""
  echo "3. 📤 Sending message to topic: $TOPIC_ID"
  
  curl -s -X POST "$BASE_URL/send-message" \
    -H "Content-Type: application/json" \
    -d "{\"topicId\": \"$TOPIC_ID\", \"message\": \"Hello from HCS! Evidence hash: abc123\"}" | jq '.'
  
  echo ""
  echo "4. 📤 Sending another message..."
  
  curl -s -X POST "$BASE_URL/send-message" \
    -H "Content-Type: application/json" \
    -d "{\"topicId\": \"$TOPIC_ID\", \"message\": \"Second evidence entry: def456\"}" | jq '.'
    
else
  echo "❌ Failed to create topic. Check server logs."
fi

echo ""
echo "✅ HCS Testing Complete!"
echo "Check your server console for detailed logs."