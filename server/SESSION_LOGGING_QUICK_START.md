# 🚀 Quick Start - Hedera Session Logging

## ⚡ **One-Command Start**

```bash
cd server && npm run session-logging
```

## 🎯 **Test Police Case Report Example**

```bash
# In another terminal
npm run demo-case-report
```

## 📋 **Environment Check**

Make sure your `.env` has:

```env
HEDERA_OPERATOR_ID=0.0.6915283
HEDERA_OPERATOR_KEY=your_private_key_here
```

## 🧪 **Full Test Suite**

```bash
npm run test-session-logging
```

## 🌐 **API Quick Test**

```bash
# Health check
curl http://localhost:4000/health

# Log a session
curl -X POST http://localhost:4000/log-session \
  -H "Content-Type: application/json" \
  -d '{"sessionSummary": "Police Case Report #001: Investigation details..."}'

# Get topic info
curl http://localhost:4000/session-topic
```

## 💻 **Frontend Integration Example**

```javascript
// Log a session from your frontend
async function logCaseSession(caseReport) {
  const response = await fetch("http://localhost:4000/log-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionSummary: caseReport,
      enableVerification: true,
    }),
  });

  const result = await response.json();

  if (result.success) {
    console.log("✅ Case logged to blockchain!");
    console.log("🔒 Hash:", result.hash);
    console.log("📩 Transaction ID:", result.transactionId);

    // Save to your case management system
    await saveCaseAuditTrail({
      caseId: "CR-2025-001",
      hederaTransactionId: result.transactionId,
      sessionHash: result.hash,
    });
  }
}
```

## 🔒 **What This System Provides**

✅ **Privacy**: Full case data stays private (only hash on blockchain)  
✅ **Integrity**: SHA-256 hash detects any tampering  
✅ **Immutability**: Blockchain record cannot be altered  
✅ **Auditability**: Permanent audit trail for compliance  
✅ **Verification**: Independent hash verification possible

## 🎉 **Ready to Use!**

Your complete Hedera session logging system will:

1. ✅ Accept session summaries from your frontend
2. ✅ Compute SHA-256 hash for integrity verification
3. ✅ Log hash to Hedera Consensus Service
4. ✅ Provide blockchain transaction ID for reference
5. ✅ Enable Mirror Node verification
6. ✅ Maintain complete privacy (no sensitive data on blockchain)

**Start the server and test with:** `npm run demo-case-report` 🚀
