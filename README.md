# Lightspeed Retail (X-Series) Business Rule Handler

这是一个用于处理 Lightspeed Retail (X-Series) 业务规则的 Node.js 服务。它接收来自 Lightspeed 的事件数据，并根据业务逻辑返回相应的动作。

## 功能特性

- ✅ 支持所有 Lightspeed 业务规则事件类型
- ✅ 自动日志记录和错误处理
- ✅ 可扩展的业务逻辑处理
- ✅ 支持 Glitch 部署
- ✅ 健康检查端点
- ✅ CORS 支持

## 支持的事件类型

| 事件类型 | 描述 | 支持的动作 |
|---------|------|-----------|
| `sale.ready_for_payment` | 销售准备支付 | stop, confirm, require_custom_fields, set_custom_field, add_line_item, remove_line_item, suggest_products |
| `sale.line_items.added` | 添加商品到销售 | require_custom_fields, set_custom_field, add_line_item, remove_line_item, suggest_products, set_customer |
| `sale.line_items.updated` | 更新销售中的商品 | require_custom_fields, set_custom_field, add_line_item, remove_line_item, suggest_products, set_customer |
| `sale.line_items.deleted` | 从销售中删除商品 | require_custom_fields, set_custom_field, add_line_item, remove_line_item, suggest_products, set_customer |
| `sale.customer.changed` | 销售客户变更 | require_custom_fields, set_custom_field, add_line_item, remove_line_item, suggest_products |
| `sale.created` | 销售创建 | set_custom_field |
| `sale.updated` | 销售更新 | set_custom_field |

## 快速开始

### 1. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或者启动生产服务器
npm start
```

服务器将在 `http://localhost:3000` 启动。

### 2. Glitch 部署

1. 在 [Glitch](https://glitch.com) 创建新项目
2. 上传所有文件到 Glitch
3. Glitch 会自动安装依赖并启动服务器
4. 你的端点将是：`https://your-project-name.glitch.me/vend-business-rule`

### 3. 配置 Lightspeed

#### 创建远程规则

```bash
curl -X POST "https://api.lightspeedapp.com/api/2.0/workflows/remote_rules" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-project-name.glitch.me/vend-business-rule"
  }'
```

#### 创建规则

```bash
curl -X POST "https://api.lightspeedapp.com/api/2.0/workflows/rules" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "sale.ready_for_payment",
    "remote_rule_id": "YOUR_REMOTE_RULE_ID"
  }'
```

## API 端点

### 健康检查
```
GET /
```

### 业务规则处理
```
POST /vend-business-rule
```

## 业务逻辑示例

### 大额销售确认
当销售总额超过 $1000 时，显示确认对话框：

```javascript
if (totalPrice > 1000) {
  actions.push({
    type: 'confirm',
    title: '大额销售确认',
    message: `销售总额为 $${totalPrice.toFixed(2)}，确认继续吗？`,
    confirm_label: '确认',
    dismiss_label: '取消'
  });
}
```

### 商品推荐
当添加手机类商品时，推荐相关配件：

```javascript
const hasElectronics = line_items.some(item => 
  item.product && item.product.name && 
  item.product.name.toLowerCase().includes('phone')
);

if (hasElectronics) {
  actions.push({
    type: 'suggest_products',
    title: '推荐配件',
    message: '为您的手机推荐一些配件：',
    product_ids: ['accessory1', 'accessory2', 'accessory3']
  });
}
```

### 自定义字段设置
为销售设置自定义字段：

```javascript
actions.push({
  type: 'set_custom_field',
  entity: 'sale',
  custom_field_name: 'customer_type',
  custom_field_value: customer.account_type || 'regular'
});
```

## 响应格式

服务必须返回包含 `actions` 数组的 JSON 响应：

```json
{
  "actions": [
    {
      "type": "confirm",
      "title": "确认标题",
      "message": "确认消息",
      "confirm_label": "确认",
      "dismiss_label": "取消"
    }
  ]
}
```

## 支持的动作类型

### stop
阻止事件继续执行

```javascript
{
  "type": "stop",
  "title": "停止标题",
  "message": "停止消息",
  "dismiss_label": "确定"
}
```

### confirm
要求用户确认

```javascript
{
  "type": "confirm",
  "title": "确认标题",
  "message": "确认消息",
  "confirm_label": "继续",
  "dismiss_label": "取消"
}
```

### require_custom_fields
要求输入自定义字段

```javascript
{
  "type": "require_custom_fields",
  "title": "输入标题",
  "message": "请输入信息",
  "entity": "sale",
  "required_custom_fields": [
    {
      "name": "field_name",
      "label": "字段标签",
      "type": "text"
    }
  ]
}
```

### set_custom_field
设置自定义字段值

```javascript
{
  "type": "set_custom_field",
  "entity": "sale",
  "custom_field_name": "field_name",
  "custom_field_value": "field_value"
}
```

### add_line_item
添加商品到销售

```javascript
{
  "type": "add_line_item",
  "product_id": "product_id",
  "quantity": "1",
  "unit_price": "10.00"
}
```

### remove_line_item
从销售中移除商品

```javascript
{
  "type": "remove_line_item",
  "line_item_id": "line_item_id"
}
```

### suggest_products
推荐商品

```javascript
{
  "type": "suggest_products",
  "title": "推荐标题",
  "message": "推荐消息",
  "product_ids": ["product1", "product2"]
}
```

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器端口 | 3000 |

## 开发

### 项目结构

```
vend-business-rule/
├── server.js          # 主服务器文件
├── package.json       # 项目配置
├── README.md         # 文档
└── .gitignore        # Git 忽略文件
```

### 添加新的业务逻辑

1. 在 `server.js` 中找到对应的事件处理函数
2. 添加你的业务逻辑
3. 返回相应的动作数组

### 测试

你可以使用以下 curl 命令测试端点：

```bash
curl -X POST http://localhost:3000/vend-business-rule \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "sale.ready_for_payment",
    "sale": {
      "total_price": "1500.00"
    }
  }'
```

## 注意事项

1. **超时限制**：Lightspeed 有 2 秒的响应超时限制
2. **错误处理**：确保所有错误都被正确捕获和处理
3. **日志记录**：所有请求和响应都会被记录到控制台
4. **安全性**：在生产环境中，建议添加适当的身份验证和授权

## 故障排除

### 常见问题

1. **超时错误**：确保业务逻辑在 2 秒内完成
2. **CORS 错误**：服务已配置 CORS，应该能处理跨域请求
3. **JSON 解析错误**：确保请求体是有效的 JSON

### 调试

查看控制台日志以了解：
- 接收到的请求数据
- 返回的动作
- 任何错误信息

## 许可证

MIT License

## 支持

如有问题，请查看 [Lightspeed API 文档](https://x-series-api.lightspeedhq.com/docs/workflows_business_rules#remote-business-rule-api) 或联系开发团队。
