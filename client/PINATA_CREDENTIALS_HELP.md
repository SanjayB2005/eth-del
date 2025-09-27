# Pinata Setup Instructions

## Getting Your Pinata Credentials

### Method 1: Using JWT (Recommended)
1. Go to [Pinata Dashboard](https://app.pinata.cloud/)
2. Log in to your account
3. Navigate to "API Keys" in the sidebar
4. Click "New Key" 
5. Give it a name (e.g., "eth-del-app")
6. Select permissions:
   - ✅ Pin to IPFS
   - ✅ Unpin from IPFS  
   - ✅ Pin List
7. Copy the JWT token (it should be a very long string, around 200+ characters)

### Method 2: Using API Keys (Alternative)
1. In the same API Keys section
2. Create a new key with the same permissions
3. Copy both the API Key and Secret Key

## Current Status
Your JWT token appears to be truncated. A complete JWT should look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwaW5hdGEiLCJpc3MiOiJwaW5hdGEiLCJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjkwNTU1NTU1LCJleHAiOjE2OTA1NTU1NTUsIm5iZiI6MTY5MDU1NTU1NSwiZXhwIjoxNjkwNTU1NTU1fQ.very_long_signature_string_here
```

Your current JWT ends abruptly, which is causing the 401 errors.

## Testing
Visit http://localhost:3000/test-pinata to test your credentials.

## Gateway URL
Your custom gateway is: coral-hollow-amphibian-910.mypinata.cloud