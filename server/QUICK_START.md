# 🚀 Quick Setup Guide - Hedera Chatbot

## ⚡ One-Command Start

```bash
cd server && npm run chatbot
```

## 🎯 Test Your Example

```bash
# In another terminal
node demo-chatbot-example.js
```

## 📋 Environment Check

Make sure your `.env` has:

```env
HEDERA_ACCOUNT_ID=0.0.6915283
HEDERA_PRIVATE_KEY=your_private_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🧪 Full Test Suite

```bash
npm run test-chatbot
```

## 🌐 API Endpoints

- **Health Check**: `GET http://localhost:4000/health`
- **Chatbot**: `POST http://localhost:4000/chatbot`

## 💻 Example Frontend Code

```javascript
// Send message to chatbot
const response = await fetch("http://localhost:4000/chatbot", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Create a new topic called 'CaseReports'",
  }),
});

const result = await response.json();

if (result.type === "hedera_action") {
  console.log("Hedera action executed:", result.result);
} else if (result.type === "conversation") {
  console.log("AI response:", result.response);
}
```

## 🎉 You're Ready!

Your complete Hedera + Gemini chatbot backend is ready to use! The system will:

1. ✅ Receive messages from your frontend
2. ✅ Process them through Gemini AI
3. ✅ Execute Hedera blockchain actions
4. ✅ Return structured responses
5. ✅ Log everything clearly in console

**Start the server and try: "Create a new topic called 'CaseReports'"** 🚀
