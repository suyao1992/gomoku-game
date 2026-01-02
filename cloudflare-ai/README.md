# Cloudflare Workers 部署指南

## 前置条件

1. 注册Cloudflare账号: https://dash.cloudflare.com/sign-up
2. 安装Wrangler CLI工具

```bash
npm install -g wrangler
# 或使用
yarn global add wrangler
```

## 部署步骤

### 1. 登录Cloudflare

```bash
wrangler login
```

这会打开浏览器,授权Wrangler访问你的Cloudflare账号。

### 2. 创建KV命名空间

KV用于存储AI状态:

```bash
# 进入cloudflare-ai目录
cd cloudflare-ai

# 创建生产环境KV
wrangler kv:namespace create "AI_STATUS"

# 创建开发环境KV(可选)
wrangler kv:namespace create "AI_STATUS" --preview
```

命令会输出KV Namespace ID,类似:

```
✨ Success! Created KV namespace "AI_STATUS"
Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "AI_STATUS"
id = "abc123def456ghi789"
```

### 3. 更新wrangler.toml

编辑`wrangler.toml`,将上一步的ID替换到配置中:

```toml
[[kv_namespaces]]
binding = "AI_STATUS"
id = "abc123def456ghi789"  # 替换为你的ID
```

### 4. 修改JSON导入

由于Cloudflare Workers不支持直接`import`JSON文件,需要修改`matchmaking-worker.js`:

**方法A**: 将配置内联到代码中

```javascript
// 在 matchmaking-worker.js 顶部
const config = {
  "aiPlayers": [ /* 从ai-bot-config.json复制 */ ]
};
```

**方法B**: 上传到KV存储

```bash
# 上传AI配置到KV
wrangler kv:key put --binding=AI_STATUS "ai-pool-config" "$(cat ai-bot-config.json)"
```

然后在代码中读取:

```javascript
const configRaw = await env.AI_STATUS.get('ai-pool-config');
const config = JSON.parse(configRaw);
```

### 5. 部署Workers

```bash
# 部署到生产环境
wrangler deploy

# 或部署到开发环境
wrangler deploy --env dev
```

成功后会输出Workers URL,例如:

```
✨ Deployed to https://gomoku-ai-matcher.你的账号.workers.dev
```

### 6. 配置Cron触发器

Cron会自动从`wrangler.toml`中读取配置。验证Cron是否生效:

```bash
wrangler tail
```

然后等待30分钟,观察日志输出。

### 7. 测试Workers

```bash
# 测试匹配接口
curl -X POST https://gomoku-ai-matcher.你的账号.workers.dev/match \
  -H "Content-Type: application/json" \
  -d '{"playerId":"test123","playerElo":1300}'

# 测试管理员接口
curl https://gomoku-ai-matcher.你的账号.workers.dev/admin/status
```

## 更新客户端配置

部署完成后,需要在游戏客户端配置Workers URL。

编辑`js/utils/RobustMatchmaking.js`,修改Workers端点:

```javascript
const AI_MATCHER_URL = 'https://gomoku-ai-matcher.你的账号.workers.dev';
```

## 常见问题

### Q: 部署失败提示"Module not found"

A: 检查`matchmaking-worker.js`中的`import`语句,确保使用内联配置或KV存储。

### Q: Cron没有执行

A: 
1. 检查`wrangler.toml`中的cron配置格式
2. 确认Workers已部署成功
3. 使用`wrangler tail`查看日志

### Q: CORS错误

A: Workers代码已包含CORS头,检查浏览器控制台是否有其他错误。

## 成本监控

在Cloudflare Dashboard中查看用量:

1. 进入Workers & Pages
2. 点击你的Worker
3. 查看Metrics标签页

**免费额度**:
- 100,000 请求/天
- Durable Objects: 30个实例 + 400,000 GB-秒/月

## 本地开发

```bash
# 启动本地开发服务器
wrangler dev

# Workers会运行在 http://localhost:8787
```

## 回滚部署

```bash
# 查看部署历史
wrangler deployments list

# 回滚到指定版本
wrangler rollback [deployment-id]
```

## 下一步

完成Workers部署后,继续:

1. 修改客户端匹配系统(`RobustMatchmaking.js`)
2. 在`index.html`中引入`ai-player-adapter.js`
3. 测试真人vs AI对局
