# Cloudflare Workers 部署步骤(手动)

## 前提条件

✅ Wrangler CLI已安装(版本: 4.56.0)  
✅ AI配置已内联到`matchmaking-worker.js`

---

## 步骤1: 登录Cloudflare

```powershell
wrangler login
```

**预期结果**:
- 浏览器自动打开授权页面
- 点击"Authorize"按钮
- 终端显示: `Successfully logged in.`

---

## 步骤2: 创建KV命名空间

```powershell
wrangler kv:namespace create "AI_STATUS"
```

**预期输出**:
```
✨ Success! Created KV namespace "AI_STATUS"
[[kv_namespaces]]
binding = "AI_STATUS"
id = "abc123def456ghi789"    <-- 复制这个ID
```

**复制KV Namespace ID**,然后编辑`wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "AI_STATUS"
id = "你的实际KV_ID"  # 替换这里
```

---

## 步骤3: 部署Workers

```powershell
wrangler deploy
```

**预期输出**:
```
✨ Deployed to https://gomoku-ai-matcher.你的账号.workers.dev
```

**复制Workers URL**(例如: `https://gomoku-ai-matcher.suyao1992.workers.dev`)

---

## 步骤4: 更新客户端配置

编辑`js/utils/RobustMatchmaking.js`的第731行:

**查找**:
```javascript
const AI_MATCHER_URL = 'https://gomoku-ai-matcher.你的账号.workers.dev/match';
```

**替换为**:
```javascript
const AI_MATCHER_URL = 'https://gomoku-ai-matcher.suyao1992.workers.dev/match';
//                      ^^^替换为你的实际Workers URL
```

---

## 步骤5: 测试AI匹配

1. 打开游戏:`index.html`
2. 点击"快速匹配"
3. 等待10秒
4. **预期结果**: 匹配到AI对手(如"棋道新星")

查看浏览器控制台,应该看到:
```
[RobustMatch] 10s timeout, summoning AI opponent...
[RobustMatch] 🤖 AI opponent assigned: 棋道新星
[AIAdapter] Initializing AI player: 棋道新星
```

---

## 故障排查

### ❌ `wrangler login`无响应

**解决**: 手动访问浏览器中的OAuth链接

### ❌ `wrangler deploy`失败

**检查**:
1. `wrangler.toml`中的KV ID是否正确
2. 是否在`cloudflare-ai`目录下执行

### ❌ AI不落子

**检查**:
1. 浏览器控制台是否有`[AIAdapter]`日志
2. Workers URL是否正确(无CORS错误)
3. `ai-player-adapter.js`是否在`index.html`中引入

---

## 验证部署

访问Workers管理端点:

```bash
curl https://gomoku-ai-matcher.你的账号.workers.dev/admin/status
```

**预期返回**:
```json
{
  "totalAIs": 20,
  "onlineAIs": 20,
  "inGameAIs": 0
}
```

---

## 下一步

部署完成后:
- ✅ 测试真人vs AI匹配
- ✅ 观察Firebase写入次数(Dashboard)
- ✅ 查看Cloudflare Workers用量(Metrics)
- ⚠️ 如需AI自动对局,等待30分钟Cron触发

**完成!** 🎉
