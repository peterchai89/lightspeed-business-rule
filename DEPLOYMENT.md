# 部署指南

本指南将帮助你将 Lightspeed Business Rule Handler 部署到 Glitch 平台。

## Glitch 部署步骤

### 1. 创建 Glitch 项目

1. 访问 [Glitch](https://glitch.com)
2. 点击 "New Project" → "Import from GitHub"
3. 或者直接创建新项目并上传文件

### 2. 上传项目文件

确保以下文件都已上传到 Glitch 项目：

- `server.js` - 主服务器文件
- `package.json` - 项目配置和依赖
- `README.md` - 项目文档
- `.gitignore` - Git 忽略文件
- `test.js` - 测试文件（可选）

### 3. 等待自动部署

Glitch 会自动：
- 安装 Node.js 依赖
- 启动服务器
- 分配一个公共 URL

### 4. 获取你的端点 URL

部署完成后，你会得到一个类似这样的 URL：
```
https://your-project-name.glitch.me
```

你的 Lightspeed 业务规则端点将是：
```
https://your-project-name.glitch.me/vend-business-rule
```

## 配置 Lightspeed

### 1. 获取 Lightspeed API 访问令牌

1. 登录你的 Lightspeed Retail (X-Series) 账户
2. 进入 API 设置
3. 生成访问令牌

### 2. 创建远程规则

使用以下 curl 命令创建远程规则：

```bash
curl -X POST "https://api.lightspeedapp.com/api/2.0/workflows/remote_rules" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-project-name.glitch.me/vend-business-rule"
  }'
```

响应示例：
```json
{
  "data": {
    "id": "238757382938758342",
    "url": "https://your-project-name.glitch.me/vend-business-rule",
    "created_at": "2022-02-28T14:22:13Z"
  }
}
```

### 3. 创建业务规则

使用远程规则 ID 创建业务规则：

```bash
curl -X POST "https://api.lightspeedapp.com/api/2.0/workflows/rules" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "sale.ready_for_payment",
    "remote_rule_id": "238757382938758342"
  }'
```

响应示例：
```json
{
  "data": {
    "id": "938484920947573",
    "event_type": "sale.ready_for_payment",
    "remote_rule_id": "238757382938758342",
    "created_at": "2022-02-28T14:23:26Z"
  }
}
```

## 测试部署

### 1. 健康检查

访问你的 Glitch URL 根路径：
```
https://your-project-name.glitch.me/
```

应该看到类似这样的响应：
```json
{
  "status": "OK",
  "message": "Lightspeed Business Rule Handler is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. 测试业务规则端点

使用 curl 或 Postman 测试：

```bash
curl -X POST "https://your-project-name.glitch.me/vend-business-rule" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "sale.ready_for_payment",
    "sale": {
      "total_price": "1500.00"
    }
  }'
```

### 3. 使用测试脚本

如果你上传了 `test.js` 文件，可以修改其中的 `BASE_URL` 来测试你的 Glitch 部署：

```javascript
const BASE_URL = 'https://your-project-name.glitch.me';
```

然后运行：
```bash
node test.js
```

## 监控和日志

### 1. 查看 Glitch 日志

在 Glitch 项目中：
1. 点击 "Logs" 标签
2. 查看实时日志输出
3. 监控错误和请求

### 2. 日志内容

服务会记录：
- 所有传入的请求
- 请求体内容
- 返回的动作
- 错误信息

## 故障排除

### 常见问题

1. **服务无法启动**
   - 检查 `package.json` 是否正确
   - 确保所有依赖都已安装
   - 查看 Glitch 日志中的错误信息

2. **端点返回 404**
   - 确认端点路径是 `/vend-business-rule`
   - 检查 Glitch URL 是否正确

3. **超时错误**
   - 确保业务逻辑在 2 秒内完成
   - 优化代码性能

4. **CORS 错误**
   - 服务已配置 CORS，应该能处理跨域请求
   - 如果仍有问题，检查请求头

### 调试技巧

1. **添加更多日志**
   在 `server.js` 中添加更多 `console.log` 语句

2. **测试简单响应**
   临时返回空动作数组来测试连接：
   ```javascript
   res.json({ actions: [] });
   ```

3. **检查 Glitch 状态**
   - 确保项目处于活跃状态
   - Glitch 会在不活跃时暂停项目

## 生产环境建议

### 1. 域名绑定

考虑绑定自定义域名：
1. 在 Glitch 项目设置中添加自定义域名
2. 更新 Lightspeed 配置中的 URL

### 2. 监控

设置监控来跟踪：
- 服务可用性
- 响应时间
- 错误率

### 3. 备份

定期备份你的业务逻辑代码

## 更新部署

### 1. 代码更新

在 Glitch 中：
1. 直接编辑文件
2. 保存后自动重新部署
3. 或者上传新文件

### 2. 依赖更新

修改 `package.json` 后，Glitch 会自动重新安装依赖

## 安全注意事项

1. **不要暴露敏感信息**
   - 不要在代码中硬编码 API 密钥
   - 使用环境变量存储敏感数据

2. **验证请求**
   - 在生产环境中添加请求验证
   - 考虑添加身份验证

3. **限制访问**
   - 只允许必要的 IP 地址访问
   - 监控异常访问模式

## 支持

如果遇到问题：
1. 查看 Glitch 日志
2. 检查 Lightspeed API 文档
3. 联系技术支持 