// Lightspeed Business Rule 配置文件
// 在这里自定义你的业务逻辑参数

module.exports = {
  // 销售相关配置
  sales: {
    // 大额销售阈值（美元）
    largeSaleThreshold: 1000,
    
    // 大额销售确认消息
    largeSaleMessage: '销售总额超过 $1000，确认继续吗？',
    
    // 大额销售确认按钮
    largeSaleConfirmLabel: '确认',
    largeSaleDismissLabel: '取消'
  },

  // 商品相关配置
  products: {
    // 需要推荐配件的商品关键词
    accessoryKeywords: ['phone', 'iphone', 'samsung', 'mobile'],
    
    // 推荐配件的产品ID（需要替换为实际的产品ID）
    accessoryProductIds: ['accessory1', 'accessory2', 'accessory3'],
    
    // 推荐配件的标题和消息
    accessoryTitle: '推荐配件',
    accessoryMessage: '为您的手机推荐一些配件：',
    
    // 大量商品阈值
    largeQuantityThreshold: 10,
    
    // 大量商品确认消息
    largeQuantityMessage: '商品数量较多，确认吗？',
    largeQuantityConfirmLabel: '确认',
    largeQuantityDismissLabel: '修改'
  },

  // 客户相关配置
  customers: {
    // 新客户欢迎消息
    newCustomerWelcomeMessage: '欢迎新客户！',
    
    // 新客户账户类型标识
    newCustomerAccountType: 'new'
  },

  // 自定义字段配置
  customFields: {
    // 销售自定义字段
    sale: {
      customerType: 'customer_type',
      welcomeMessage: 'welcome_message',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      removedItems: 'removed_items'
    },
    
    // 行项目自定义字段
    lineItem: {
      // 可以添加行项目相关的自定义字段
    }
  },

  // 日志配置
  logging: {
    // 是否启用详细日志
    verbose: true,
    
    // 是否记录请求体
    logRequestBody: true,
    
    // 是否记录响应
    logResponse: true
  },

  // 安全配置
  security: {
    // 是否启用请求验证（生产环境建议启用）
    enableRequestValidation: false,
    
    // 允许的请求来源（如果需要限制）
    allowedOrigins: ['*'],
    
    // 请求超时时间（毫秒）
    requestTimeout: 2000
  },

  // 业务规则配置
  businessRules: {
    // 是否启用大额销售确认
    enableLargeSaleConfirmation: true,
    
    // 是否启用商品推荐
    enableProductRecommendation: false,
    
    // 是否启用数量确认
    enableQuantityConfirmation: false,
    
    // 是否启用新客户欢迎
    enableNewCustomerWelcome: false,
    
    // 是否自动设置自定义字段
    enableAutoCustomFields: true
  }
}; 