# Hedera Consensus Service Testing Script (PowerShell)
# Make sure your server is running on port 4000

Write-Host "🧪 Testing Hedera Consensus Service Integration" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

$BASE_URL = "http://localhost:4000/api/hedera"

Write-Host ""
Write-Host "1. 📊 Checking Hedera service status..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "$BASE_URL/status" -Method GET
    $statusResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Failed to get status: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. 🏗️  Creating a new HCS topic..." -ForegroundColor Yellow
try {
    $topicBody = @{
        memo = "Test topic for evidence logging"
    } | ConvertTo-Json

    $topicResponse = Invoke-RestMethod -Uri "$BASE_URL/create-topic" -Method POST -Body $topicBody -ContentType "application/json"
    $topicResponse | ConvertTo-Json -Depth 3
    
    $topicId = $topicResponse.topicId
    
    if ($topicId) {
        Write-Host ""
        Write-Host "3. 📤 Sending message to topic: $topicId" -ForegroundColor Yellow
        
        $messageBody1 = @{
            topicId = $topicId
            message = "Hello from HCS! Evidence hash: abc123"
        } | ConvertTo-Json
        
        $messageResponse1 = Invoke-RestMethod -Uri "$BASE_URL/send-message" -Method POST -Body $messageBody1 -ContentType "application/json"
        $messageResponse1 | ConvertTo-Json -Depth 3
        
        Write-Host ""
        Write-Host "4. 📤 Sending another message..." -ForegroundColor Yellow
        
        $messageBody2 = @{
            topicId = $topicId
            message = "Second evidence entry: def456"
        } | ConvertTo-Json
        
        $messageResponse2 = Invoke-RestMethod -Uri "$BASE_URL/send-message" -Method POST -Body $messageBody2 -ContentType "application/json"
        $messageResponse2 | ConvertTo-Json -Depth 3
        
    } else {
        Write-Host "❌ Failed to create topic. Check server logs." -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error during testing: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ HCS Testing Complete!" -ForegroundColor Green
Write-Host "Check your server console for detailed logs." -ForegroundColor Cyan