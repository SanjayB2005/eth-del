# 🛡️ SafeGuard AI: Women's Safety & Privacy Platform

## 🎯 Mission Statement

SafeGuard AI is a **confidential AI assistant** specifically designed for women's safety, providing:

- **Legal guidance** on harassment, threats, and abuse
- **Emergency protocols** and safety planning
- **Secure evidence documentation** using blockchain technology
- **Privacy-first approach** with tamper-proof audit trails

## 🔒 Core Privacy Principles

### 1. **Privacy by Design**

- Full conversations remain local and encrypted
- Only cryptographic hashes stored on blockchain
- No personal information exposed on distributed ledger
- User identity completely protected

### 2. **Secure Evidence Collection**

- SHA-256 hashing creates tamper-proof records
- Blockchain timestamps provide legal validity
- Evidence integrity verifiable without revealing content
- Suitable for legal proceedings and court submissions

### 3. **Confidential Support**

- AI trained specifically in women's safety protocols
- Understands legal frameworks for harassment/abuse
- Provides step-by-step guidance for reporting
- Never judges or dismisses concerns

## 🤖 AI Capabilities

### **Safety Guidance**

```
User: "Someone is threatening me with private photos"
AI: Provides comprehensive response covering:
- Immediate safety steps (don't respond, document)
- Legal options (harassment laws, restraining orders)
- Evidence collection (secure screenshots)
- Support resources (NGOs, legal aid)
- Blockchain documentation offer
```

### **Evidence Documentation**

```
User: "Document this harassment case"
AI: Creates blockchain evidence log:
- Secure topic creation for case documentation
- Tamper-proof session logging
- Legal-grade timestamps
- Privacy-protected audit trail
```

### **Legal Information**

```
User: "What are my legal rights regarding cyberstalking?"
AI: Provides jurisdiction-specific guidance:
- Relevant laws and protections
- Reporting procedures
- Evidence requirements
- Legal support resources
```

## ⛓️ Blockchain Integration

### **Hedera Hashgraph Security**

- **Account**: 0.0.6915283 (999.26+ ℏ balance)
- **Session Logging**: Automatic SHA-256 hashing to HCS
- **Evidence Topics**: Secure, immutable case documentation
- **Mirror Node Verification**: Real-time transaction confirmation

### **Supported Blockchain Actions**

- `check_balance`: Verify platform account status
- `create_topic`: Create evidence documentation logs
- `send_message`: Log session summaries securely
- `transfer_hbar`: Platform maintenance (admin only)

## 🔧 Technical Architecture

### **Frontend** (`http://localhost:3000`)

- **Landing Page**: Professional women's safety platform intro
- **Chatbot Interface**: (`/chatbot`) - Secure AI interaction
- **Real-time Updates**: Live transaction status and confirmations
- **Fallback Notifications**: Clear indication when AI service degraded

### **Backend** (`http://localhost:4000`)

- **Enhanced Error Handling**: 3-retry logic with exponential backoff
- **Intelligent Fallbacks**: Context-aware responses during AI outages
- **Session Logging Service**: Automatic blockchain evidence creation
- **Health Monitoring**: Service status and blockchain connectivity

### **Error Resilience**

```javascript
// Automatic retry sequence for 503 errors:
Attempt 1 → Fail → Wait 1s → Retry
Attempt 2 → Fail → Wait 3s → Retry
Attempt 3 → Fail → Wait 5s → Retry
Final → Switch to intelligent fallback responses
```

## 📋 Usage Examples

### **Immediate Safety Scenario**

```
User: "My ex is stalking me online and threatening me"

AI Response:
"I'm so sorry you're dealing with this. Online stalking is a serious crime. Here's what to do immediately:

**Urgent Steps:**
1. Do NOT engage with the stalker - block on all platforms
2. Screenshot all evidence (threats, messages, profiles)
3. Contact police - file a harassment/stalking report
4. Consider a restraining order

**Legal Protection:**
- Most states have cyberstalking laws with serious penalties
- Document everything with dates/times
- Save evidence in multiple secure locations

**Secure Documentation:**
I can help you create a tamper-proof record of this incident using blockchain technology for legal purposes.

Would you like me to start secure evidence logging, or do you need emergency contact information?"
```

### **Evidence Documentation**

```
User: "Create a secure record of my harassment case"

AI Action: {"action":"create_topic","parameters":{"topicName":"Harassment_Case_Evidence_Log"}}

Result: ✅ Topic 0.0.6916366 created - Secure evidence logging active
```

## 🌍 Support Resources

### **Emergency Contacts**

- **US**: National Domestic Violence Hotline: 1-800-799-7233
- **US**: RAINN Sexual Assault Hotline: 1-800-656-4673
- **International**: Local emergency services (911, 999, etc.)

### **Legal Support**

- Local women's rights organizations
- Legal aid societies
- Pro bono attorney networks
- University legal clinics

### **Digital Safety**

- Electronic Frontier Foundation (EFF)
- Cyber Civil Rights Initiative
- National Network to End Domestic Violence (NNEDV) Safety Net

## 🔬 Testing & Validation

### **Error Handling Test**

```bash
cd server
node test-safety-prompt.js
```

### **Integration Test**

```bash
cd server
node test-frontend-integration.js
```

### **Security Validation**

- All conversations encrypted in transit
- Blockchain transactions verified on Mirror Node
- Session hashes irreversible and tamper-evident
- Zero personal data exposure on public ledger

## 📈 Platform Status

### **Current Deployment**

- ✅ Backend Server: Port 4000 (Hedera + AI integrated)
- ✅ Frontend Server: Port 3000 (Next.js with Tailwind CSS)
- ✅ Error Handling: 503 resilience with intelligent fallbacks
- ✅ Evidence Logging: SHA-256 + Hedera HCS operational
- ✅ AI System: Women's safety specialized prompt active

### **Service Health**

- Hedera Balance: 999.26+ ℏ (operational)
- Session Logging: Topic 0.0.6916365 (active)
- Mirror Node: Real-time verification enabled
- Gemini AI: Enhanced retry logic with safety-focused fallbacks

---

## 🚨 Important Notice

**This platform is designed for documentation and guidance purposes. In case of immediate physical danger, always contact local emergency services first.**

**SafeGuard AI provides legal information, not legal advice. For specific legal matters, consult with a qualified attorney in your jurisdiction.**

---

_SafeGuard AI - Empowering women through secure technology and compassionate support_
