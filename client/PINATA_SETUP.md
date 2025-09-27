# Pinata IPFS Setup Instructions

## 1. Create a Pinata Account
1. Go to https://pinata.cloud/
2. Sign up for a free account
3. Verify your email address

## 2. Generate API Keys
1. Login to your Pinata dashboard
2. Go to "API Keys" section
3. Click "New Key"
4. Select permissions:
   - ✅ pinFileToIPFS
   - ✅ pinJSONToIPFS  
   - ✅ unpin
   - ✅ userPinnedDataTotal
5. Give it a name like "Evidence Upload App"
6. Click "Create Key"
7. **IMPORTANT**: Copy the JWT token immediately (it won't be shown again)

## 3. Configure Environment Variables
1. Create a `.env.local` file in the client directory
2. Add your Pinata credentials:

```bash
NEXT_PUBLIC_PINATA_JWT=your_jwt_token_here
```

**Note**: Only the JWT token is needed for this implementation.

## 4. Test the Integration
1. Start the development server: `npm run dev`
2. Navigate to `/storage`
3. Try uploading a file (screenshot, audio, or document)
4. Check your Pinata dashboard to see the uploaded files

## 5. Free Tier Limits
- **1GB** of storage
- **1000** requests per month
- **10GB** of bandwidth per month

This is perfect for testing and initial evidence collection.

## 6. Supported File Types
- **Screenshots**: .jpg, .jpeg, .png, .gif, .webp
- **Audio**: .mp3, .wav, .m4a, .aac, .ogg  
- **Video**: .mp4, .avi, .mov
- **Documents**: .pdf, .txt, .doc, .docx
- **Chat Data**: .json files

## 7. Security Features
- All files are stored on IPFS (decentralized)
- Files are pinned to ensure availability
- Each file gets a unique IPFS hash
- Files can be accessed via Pinata gateway
- Local evidence persistence using browser localStorage

## 8. How It Works
1. **Upload**: Files are uploaded to Pinata's IPFS service
2. **Store**: IPFS hash is returned and stored locally
3. **Access**: Files can be viewed via IPFS gateway links
4. **Consent**: Only selected evidence is shared when filing reports

## 9. Production Considerations
- Use environment variables for API keys (never commit them)
- Consider upgrading Pinata plan for larger storage needs
- Implement proper error handling for network failures
- Add file encryption before upload for enhanced privacy
- Use a backend service to handle sensitive operations