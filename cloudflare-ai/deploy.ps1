# Cloudflare Workers 快速部署脚本
# 请在PowerShell中逐步执行以下命令

Write-Host "=== Cloudflare Workers 部署流程 ===" -ForegroundColor Green

# Step 1: 登录Cloudflare (浏览器会打开授权页面)
Write-Host "`n[1/5] 登录Cloudflare..." -ForegroundColor Yellow
Write-Host "执行: wrangler login" -ForegroundColor Cyan
Write-Host "提示: 浏览器会打开授权页面,请点击'Authorize'按钮" -ForegroundColor Gray
# wrangler login

# Step 2: 创建KV命名空间
Write-Host "`n[2/5] 创建KV存储..." -ForegroundColor Yellow
Write-Host "执行: wrangler kv:namespace create `"AI_STATUS`"" -ForegroundColor Cyan
# wrangler kv:namespace create "AI_STATUS"

# 预期输出:
# ✨ Success! Created KV namespace "AI_STATUS"
# [[kv_namespaces]]
# binding = "AI_STATUS"
# id = "abc123def456..." <-- 复制这个ID

Write-Host "`n⚠️ 重要: 复制上面输出的KV Namespace ID" -ForegroundColor Red
Write-Host "然后手动编辑 wrangler.toml,替换 'YOUR_KV_NAMESPACE_ID' 为实际ID" -ForegroundColor Gray

# Step 3: 更新wrangler.toml
Write-Host "`n[3/5] 更新配置文件..." -ForegroundColor Yellow
Write-Host "手动操作: 编辑 wrangler.toml,替换KV ID" -ForegroundColor Cyan

# Step 4: 部署Workers
Write-Host "`n[4/5] 部署到Cloudflare..." -ForegroundColor Yellow
Write-Host "执行: wrangler deploy" -ForegroundColor Cyan
# wrangler deploy

# 预期输出:
# ✨ Deployed to https://gomoku-ai-matcher.你的账号.workers.dev

Write-Host "`n⚠️ 重要: 复制上面输出的Workers URL" -ForegroundColor Red

# Step 5: 更新客户端代码
Write-Host "`n[5/5] 更新客户端配置..." -ForegroundColor Yellow
$workerUrl = Read-Host "请粘贴Workers URL (例如: https://gomoku-ai-matcher.xxx.workers.dev)"

if ($workerUrl) {
    $matchmakingFile = "..\js\utils\RobustMatchmaking.js"
    
    if (Test-Path $matchmakingFile) {
        (Get-Content $matchmakingFile) -replace 
            'https://gomoku-ai-matcher\.你的账号\.workers\.dev/match', 
            "$workerUrl/match" |
        Set-Content $matchmakingFile
        
        Write-Host "✅ 已更新 RobustMatchmaking.js 中的Workers URL" -ForegroundColor Green
    } else {
        Write-Host "❌ 找不到 RobustMatchmaking.js 文件" -ForegroundColor Red
    }
}

Write-Host "`n=== 部署完成! ===" -ForegroundColor Green
Write-Host "下一步: 打开游戏,点击'快速匹配',10秒后测试AI匹配" -ForegroundColor Yellow
