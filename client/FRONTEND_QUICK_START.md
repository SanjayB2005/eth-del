# 🚀 SafeGuard AI Frontend - Quick Start Guide

## ⚡ **One-Command Setup**

### **1. Start Backend Server**

```bash
cd server && npm run session-logging
```

### **2. Start Frontend Development**

```bash
cd client && npm run dev
```

### **3. Open Browser**

```
http://localhost:3000
```

## 🎯 **Test the Complete Flow**

### **Example Test Sequence:**

1. ✅ Click **"Start Session"**
2. ✅ Type: `"Create a new topic called CaseReports"`
3. ✅ Watch AI execute Hedera action
4. ✅ See transaction appear in sidebar log
5. ✅ Click **"End & Log Session"**
6. ✅ Session hash stored on blockchain
7. ✅ Transaction ID displayed for audit

## 🧪 **Test Backend Integration**

```bash
# Test complete frontend-backend flow
cd server && npm run test-frontend
```

## 📱 **Access Points**

- **Main Platform**: `http://localhost:3000` (pages/index.tsx)
- **App Router Version**: `http://localhost:3000/safeguard`
- **Backend Health**: `http://localhost:4000/health`

## 🎨 **What You'll See**

### **🏠 Header**

- SafeGuard AI branding
- Connection status indicator
- Start/End session buttons

### **💬 Main Chat Area**

- Clean message bubbles (user vs AI)
- Example command buttons
- Real-time typing indicators
- Auto-scroll to latest messages

### **📊 Sidebar Dashboard**

- Live Hedera transaction log
- Session information panel
- Blockchain security notice

## 🔧 **Environment Setup**

Make sure your backend `.env` has:

```env
HEDERA_OPERATOR_ID=0.0.6915283
HEDERA_OPERATOR_KEY=your_private_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

## 💡 **Example Commands to Try**

- `"Create a new topic called CaseReports"`
- `"Check balance of 0.0.6915283"`
- `"What is Hedera Hashgraph?"`
- `"Send message 'Evidence logged' to topic 0.0.123456"`

## 🔍 **Troubleshooting**

### **Frontend Won't Load:**

- Check port 3000 is available
- Run `npm install` in client directory
- Verify React/Next.js dependencies

### **Backend Connection Failed:**

- Ensure backend server is running on port 4000
- Check CORS settings
- Verify API endpoints are accessible

### **Hedera Actions Fail:**

- Verify environment variables in server/.env
- Check Hedera account balance
- Ensure network connectivity

## 🎉 **You're Ready!**

Your **SafeGuard AI platform** combines:

✅ **Professional Frontend** - Clean, trustworthy design  
✅ **AI Integration** - Gemini Flash 2.5 chatbot  
✅ **Blockchain Security** - Hedera session logging  
✅ **Real-time Updates** - Live transaction tracking  
✅ **Mobile Support** - Responsive design

**Perfect for judges, law enforcement, and users who need trusted, auditable AI assistance!** 🌟

**Start with:** `npm run session-logging` (backend) + `npm run dev` (frontend) 🚀
