# Mirror Node Testing Script (PowerShell)
Write-Host "🌐 Testing Hedera Mirror Node Integration" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$BASE_URL = "http://localhost:4000/api/hedera"

try {
    # Step 1: Create a test topic
    Write-Host "`n1. 🏗️  Creating test topic..." -ForegroundColor Yellow
    $topicBody = @{ memo = "PowerShell Mirror Test" } | ConvertTo-Json
    $topic = Invoke-RestMethod -Uri "$BASE_URL/create-topic" -Method POST -Body $topicBody -ContentType "application/json"
    
    if ($topic.success) {
        $topicId = $topic.topicId
        Write-Host "✅ Topic created: $topicId" -ForegroundColor Green
        
        # Step 2: Start Mirror Node listener
        Write-Host "`n2. 🎧 Starting Mirror Node listener..." -ForegroundColor Yellow
        $listener = Invoke-RestMethod -Uri "$BASE_URL/listen/$topicId" -Method GET
        
        if ($listener.success) {
            Write-Host "✅ Listener started for topic: $($listener.listening)" -ForegroundColor Green
            
            # Step 3: Wait for listener to initialize
            Write-Host "`n3. ⏳ Waiting for listener initialization..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
            
            # Step 4: Send test messages
            Write-Host "`n4. 📤 Sending test messages..." -ForegroundColor Yellow
            
            $messages = @(
                "PowerShell Test Message #1",
                "Evidence hash: xyz789abc123",
                "Final test message from PowerShell"
            )
            
            foreach ($message in $messages) {
                Write-Host "   📝 Sending: $message" -ForegroundColor Cyan
                $messageBody = @{
                    topicId = $topicId
                    message = $message
                } | ConvertTo-Json
                
                $result = Invoke-RestMethod -Uri "$BASE_URL/send-message" -Method POST -Body $messageBody -ContentType "application/json"
                
                if ($result.success) {
                    Write-Host "   ✅ Message sent successfully" -ForegroundColor Green
                } else {
                    Write-Host "   ❌ Failed to send message: $($result.error)" -ForegroundColor Red
                }
                
                Start-Sleep -Seconds 2
            }
            
            # Step 5: Wait for messages to appear in Mirror Node
            Write-Host "`n5. ⏰ Waiting for Mirror Node updates..." -ForegroundColor Yellow
            Write-Host "   Watch server console for '🔎 MirrorNode update:' messages!" -ForegroundColor Cyan
            Start-Sleep -Seconds 10
            
            # Step 6: Check status
            Write-Host "`n6. 📊 Checking Mirror Node status..." -ForegroundColor Yellow
            $status = Invoke-RestMethod -Uri "$BASE_URL/mirror-status" -Method GET
            Write-Host "   Active listeners: $($status.status.activeListeners)" -ForegroundColor Cyan
            Write-Host "   Topics: $($status.status.topics -join ', ')" -ForegroundColor Cyan
            
            # Step 7: Stop listener
            Write-Host "`n7. 🛑 Stopping listener..." -ForegroundColor Yellow
            $stop = Invoke-RestMethod -Uri "$BASE_URL/stop-listening/$topicId" -Method POST
            
            if ($stop.success) {
                Write-Host "✅ Listener stopped" -ForegroundColor Green
            }
            
        } else {
            Write-Host "❌ Failed to start listener: $($listener.error)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to create topic: $($topic.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error during testing: $_" -ForegroundColor Red
}

Write-Host "`n🎉 Mirror Node Test Complete!" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host "💡 Key endpoints:" -ForegroundColor Cyan
Write-Host "   GET  /api/hedera/listen/{topicId}     - Start listening" -ForegroundColor Yellow
Write-Host "   POST /api/hedera/stop-listening/{topicId} - Stop listening" -ForegroundColor Yellow
Write-Host "   GET  /api/hedera/mirror-status        - Check status" -ForegroundColor Yellow