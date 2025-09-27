# Test HCS endpoints manually using PowerShell
Write-Host "🧪 Testing HCS endpoints manually..." -ForegroundColor Green

# Start server in background
Write-Host "Starting server in background..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -WorkingDirectory (Get-Location)

# Wait for server to start
Start-Sleep -Seconds 5

try {
    # Test 1: Check status
    Write-Host "`n1. 📊 Testing Hedera status endpoint..." -ForegroundColor Yellow
    $status = Invoke-RestMethod -Uri "http://localhost:4000/api/hedera/status" -Method GET
    Write-Host "✅ Status OK - Account: $($status.operatorAccount)" -ForegroundColor Green

    # Test 2: Create topic
    Write-Host "`n2. 🏗️  Testing create topic endpoint..." -ForegroundColor Yellow
    $topicBody = @{ memo = "PowerShell Test Topic" } | ConvertTo-Json
    $topicResult = Invoke-RestMethod -Uri "http://localhost:4000/api/hedera/create-topic" -Method POST -Body $topicBody -ContentType "application/json"
    
    if ($topicResult.success) {
        Write-Host "✅ Topic created: $($topicResult.topicId)" -ForegroundColor Green
        
        # Test 3: Send message
        Write-Host "`n3. 📤 Testing send message endpoint..." -ForegroundColor Yellow
        $messageBody = @{
            topicId = $topicResult.topicId
            message = "Hello from PowerShell test!"
        } | ConvertTo-Json
        
        $messageResult = Invoke-RestMethod -Uri "http://localhost:4000/api/hedera/send-message" -Method POST -Body $messageBody -ContentType "application/json"
        
        if ($messageResult.success) {
            Write-Host "✅ Message sent successfully!" -ForegroundColor Green
            Write-Host "   Topic: $($messageResult.topicId)" -ForegroundColor Cyan
            Write-Host "   Message: $($messageResult.message)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Failed to send message: $($messageResult.error)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to create topic: $($topicResult.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error during testing: $_" -ForegroundColor Red
}

Write-Host "`n✅ Manual testing complete!" -ForegroundColor Green