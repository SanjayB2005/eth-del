#!/usr/bin/env node

// Demo script to show how to get Piece CID and Deal ID
console.log('🧪 How to Get Piece CID and Deal ID from Filecoin Storage API\n');

console.log('📋 Complete Process:');
console.log('');

console.log('1️⃣ Upload file to Pinata (through your app):');
console.log('   → Get Pinata CID (e.g., QmYourPinataCidHere)');
console.log('');

console.log('2️⃣ Use Filecoin Storage API:');
console.log('   curl -X POST http://localhost:3002/api/metamask/pay-for-storage \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
console.log('     -d \'{"pinataCid": "QmYourPinataCidHere"}\'');
console.log('');

console.log('3️⃣ API Response (what you\'ll get):');
console.log('{');
console.log('  "message": "tFIL storage payment completed successfully",');
console.log('  "paymentMethod": "tFIL",');
console.log('  "walletInfo": {');
console.log('    "fil": {');
console.log('      "fil": "200.0",');
console.log('      "walletAddress": "0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89"');
console.log('    }');
console.log('  },');
console.log('  "setupResult": {');
console.log('    "setup": "tfil_balance_check",');
console.log('    "balance": "200.0",');
console.log('    "message": "tFIL balance sufficient for storage operations"');
console.log('  },');
console.log('  "uploadResult": {');
console.log('    "pieceCid": "baga6ea4seaqlkg6mss5qs56jqtajg5ycrhpkj2b66...",');
console.log('    "dealId": "123456",');
console.log('    "provider": "f01234",');
console.log('    "timestamp": "2025-09-27T23:30:00.000Z",');
console.log('    "fileSize": 1024,');
console.log('    "simulated": false');
console.log('  }');
console.log('}');
console.log('');

console.log('🎯 Key Values You\'ll Extract:');
console.log('   • pieceCid: "baga..." ← This is your Piece CID');
console.log('   • dealId: "123456" ← This is your Deal ID');
console.log('   • provider: "f01234" ← Storage provider');
console.log('   • simulated: false ← Confirms it\'s real storage');
console.log('');

console.log('4️⃣ Verify on Filecoin Explorer:');
console.log('   • Deal ID: https://calibration.filfox.info/en/deal/123456');
console.log('   • Piece CID: Search on Filfox for "baga..."');
console.log('');

console.log('🔧 Getting JWT Token:');
console.log('   1. Login through your app');
console.log('   2. Get JWT token from auth response');
console.log('   3. Use token in Authorization header');
console.log('');

console.log('📱 Alternative: Use your app\'s UI');
console.log('   1. Upload file through your application');
console.log('   2. Click "Migrate to Filecoin" button');
console.log('   3. View Piece CID and Deal ID in response');
console.log('');

console.log('🚀 Ready to test? Your server is running at:');
console.log('   http://localhost:3002');
