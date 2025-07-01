const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (config.logging.logRequestBody && req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// 健康检查端点
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Lightspeed Business Rule Handler is running',
    timestamp: new Date().toISOString()
  });
});

// Lightspeed 业务规则处理端点
app.post('/vend-business-rule', (req, res) => {
  try {
    const eventData = req.body;
    console.log('Received Lightspeed event:', eventData.event_type);
    
    // 根据事件类型处理不同的业务逻辑
    const actions = handleBusinessRule(eventData);
    
    if (config.logging.logResponse) {
      console.log('Returning actions:', actions);
    }
    res.json({ actions });
    
  } catch (error) {
    console.error('Error processing business rule:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 业务规则处理函数
function handleBusinessRule(eventData) {
  const { event_type, sale, customer, line_items, user } = eventData;
  
  // 默认返回空动作数组
  let actions = [];
  
  switch (event_type) {
    case 'sale.ready_for_payment':
      actions = handleSaleReadyForPayment(eventData);
      break;
      
    case 'sale.line_items.added':
      actions = handleLineItemsAdded(eventData);
      break;
      
    case 'sale.line_items.updated':
      actions = handleLineItemsUpdated(eventData);
      break;
      
    case 'sale.line_items.deleted':
      actions = handleLineItemsDeleted(eventData);
      break;
      
    case 'sale.customer.changed':
      actions = handleCustomerChanged(eventData);
      break;
      
    case 'sale.created':
      actions = handleSaleCreated(eventData);
      break;
      
    case 'sale.updated':
      actions = handleSaleUpdated(eventData);
      break;
      
    default:
      console.log(`Unhandled event type: ${event_type}`);
      actions = [];
  }
  
  return actions;
}

// 处理销售准备支付事件
function handleSaleReadyForPayment(eventData) {
  const { sale, customer } = eventData;
  const actions = [];
  
  // 根据销售总额返回不同的确认消息
  if (config.businessRules.enableLargeSaleConfirmation) {
    // 尝试获取价格，优先使用 total_price，如果没有则使用 price_total
    const totalPrice = parseFloat(sale.total_price || sale.price_total || 0);
    
    console.log(`💰 销售总额: $${totalPrice}`);
    
    // 价格小于109.09
    if (totalPrice < 109.09) {
      actions.push({
        type: 'confirm',
        title: '🎉Tax Time - Spend $120 get $20 back',
        message: 'Buy more, save more - excludes devices and repairs',
        confirm_label: 'Done',
        dismiss_label: 'Cancel'
      });
    }
    // 价格在109.09-181.81之间
    else if (totalPrice >= 109.09 && totalPrice < 181.81) {
      actions.push({
        type: 'confirm',
        title: '💸Tax Time - Spend $200 get $50 back',
        message: 'Buy more, save more - excludes devices and repairs',
        confirm_label: 'Done',
        dismiss_label: 'Cancel'
      });
    }
    // 价格在181.81-272.72之间
    else if (totalPrice >= 181.81 && totalPrice < 272.72) {
      actions.push({
        type: 'confirm',
        title: '⏳Tax Time - Spend $300 get $100 back',
        message: 'Buy more, save more - excludes devices and repairs',
        confirm_label: 'Done',
        dismiss_label: 'Cancel'
      });
    }
  }
  
  // 如果有客户，设置自定义字段
  if (config.businessRules.enableAutoCustomFields && customer) {
    actions.push({
      type: 'set_custom_field',
      entity: 'sale',
      custom_field_name: config.customFields.sale.customerType,
      custom_field_value: customer.account_type || 'regular'
    });
  }
  
  return actions;
}

// 处理添加商品事件
function handleLineItemsAdded(eventData) {
  const { line_items } = eventData;
  const actions = [];
  
  // 检查是否有特定商品，如果有则建议相关商品
  if (config.businessRules.enableProductRecommendation) {
    const hasElectronics = line_items.some(item => 
      item.product && item.product.name && 
      config.products.accessoryKeywords.some(keyword => 
        item.product.name.toLowerCase().includes(keyword)
      )
    );
    
    if (hasElectronics) {
      actions.push({
        type: 'suggest_products',
        title: config.products.accessoryTitle,
        message: config.products.accessoryMessage,
        product_ids: config.products.accessoryProductIds
      });
    }
  }
  
  return actions;
}

// 处理更新商品事件
function handleLineItemsUpdated(eventData) {
  const { line_items } = eventData;
  const actions = [];
  
  // 检查数量变化，如果数量增加很多则要求确认
  if (config.businessRules.enableQuantityConfirmation) {
    line_items.forEach(item => {
      const quantity = parseInt(item.quantity || 1);
      if (quantity > config.products.largeQuantityThreshold) {
        actions.push({
          type: 'confirm',
          title: '数量确认',
          message: `${item.product?.name || 'Unknown'} ${config.products.largeQuantityMessage}`,
          confirm_label: config.products.largeQuantityConfirmLabel,
          dismiss_label: config.products.largeQuantityDismissLabel
        });
      }
    });
  }
  
  return actions;
}

// 处理删除商品事件
function handleLineItemsDeleted(eventData) {
  const { removed_line_item_ids } = eventData;
  const actions = [];
  
  // 记录删除的商品
  if (config.businessRules.enableAutoCustomFields && removed_line_item_ids && removed_line_item_ids.length > 0) {
    actions.push({
      type: 'set_custom_field',
      entity: 'sale',
      custom_field_name: config.customFields.sale.removedItems,
      custom_field_value: removed_line_item_ids.join(',')
    });
  }
  
  return actions;
}

// 处理客户变更事件
function handleCustomerChanged(eventData) {
  const { customer } = eventData;
  const actions = [];
  
  // 为新客户设置欢迎信息
  if (config.businessRules.enableNewCustomerWelcome && customer && customer.account_type === config.customers.newCustomerAccountType) {
    actions.push({
      type: 'set_custom_field',
      entity: 'sale',
      custom_field_name: config.customFields.sale.welcomeMessage,
      custom_field_value: config.customers.newCustomerWelcomeMessage
    });
  }
  
  return actions;
}

// 处理销售创建事件
function handleSaleCreated(eventData) {
  const { sale } = eventData;
  const actions = [];
  
  // 为新销售设置创建时间
  if (config.businessRules.enableAutoCustomFields) {
    actions.push({
      type: 'set_custom_field',
      entity: 'sale',
      custom_field_name: config.customFields.sale.createdAt,
      custom_field_value: new Date().toISOString()
    });
  }
  
  return actions;
}

// 处理销售更新事件
function handleSaleUpdated(eventData) {
  const { sale } = eventData;
  const actions = [];
  
  // 记录最后更新时间
  if (config.businessRules.enableAutoCustomFields) {
    actions.push({
      type: 'set_custom_field',
      entity: 'sale',
      custom_field_name: config.customFields.sale.updatedAt,
      custom_field_value: new Date().toISOString()
    });
  }
  
  return actions;
}

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Endpoint not found'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Lightspeed Business Rule Handler running on port ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/vend-business-rule`);
  console.log(`🔍 Health check: http://localhost:${PORT}/`);
});

module.exports = app; 