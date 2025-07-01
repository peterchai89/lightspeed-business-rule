const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/vend-business-rule';

// 测试数据
const testEvents = {
  saleReadyForPayment: {
    event_type: 'sale.ready_for_payment',
    retailer_id: '00000000-0001-0001-0001-000000000001',
    retailer: {
      id: '00000000-0001-0001-0001-000000000001',
      domain_prefix: 'company'
    },
    sale: {
      id: '0f6799a5-3a64-b647-11ed-a739c219e537',
      status: 'OPEN',
      outlet_id: '0242ac12-0002-11e9-e8c4-659494e196e4',
      register_id: '0242ac12-0002-11e9-e8c4-659494e17cef',
      line_items: [
        {
          id: 'cc0e2f8f-3c14-974a-11ea-6896792dfeae',
          product: {
            id: '0242ac11-0002-11ea-f7e1-629be820260d',
            name: 'iPhone 13',
            custom_fields: []
          },
          quantity: '1',
          note: 'Line Item Note',
          price: '999.99',
          price_total: '999.99',
          tax_total: '50.00',
          custom_fields: []
        }
      ],
      note: '',
      total_price: '1049.99',
      total_tax: '50.00',
      custom_fields: []
    },
    user: {
      id: '08002782-0c90-11e6-e3ed-117ec127b1cb',
      username: 'Admin',
      account_type: 'admin'
    },
    customer: {
      id: 'customer123',
      account_type: 'regular'
    }
  },

  lineItemsAdded: {
    event_type: 'sale.line_items.added',
    retailer_id: '00000000-0001-0001-0001-000000000001',
    retailer: {
      id: '00000000-0001-0001-0001-000000000001',
      domain_prefix: 'company'
    },
    sale: {
      id: '0f6799a5-3a64-b647-11ed-a739c219e537',
      status: 'OPEN',
      total_price: '99.99',
      total_tax: '5.00',
      custom_fields: []
    },
    user: {
      id: '08002782-0c90-11e6-e3ed-117ec127b1cb',
      username: 'Admin',
      account_type: 'admin'
    },
    line_items: [
      {
        id: 'cc0e2f8f-3c14-974a-11ea-6896792dfeae',
        product: {
          id: '0242ac11-0002-11ea-f7e1-629be820260d',
          name: 'iPhone 13 Pro',
          custom_fields: []
        },
        quantity: '1',
        price: '99.99',
        price_total: '99.99',
        tax_total: '5.00',
        custom_fields: []
      }
    ]
  },

  lineItemsUpdated: {
    event_type: 'sale.line_items.updated',
    retailer_id: '00000000-0001-0001-0001-000000000001',
    retailer: {
      id: '00000000-0001-0001-0001-000000000001',
      domain_prefix: 'company'
    },
    sale: {
      id: '0f6799a5-3a64-b647-11ed-a739c219e537',
      status: 'OPEN',
      total_price: '199.98',
      total_tax: '10.00',
      custom_fields: []
    },
    user: {
      id: '08002782-0c90-11e6-e3ed-117ec127b1cb',
      username: 'Admin',
      account_type: 'admin'
    },
    line_items: [
      {
        id: 'cc0e2f8f-3c14-974a-11ea-6896792dfeae',
        product: {
          id: '0242ac11-0002-11ea-f7e1-629be820260d',
          name: 'iPhone 13 Pro',
          custom_fields: []
        },
        quantity: '15', // 大量商品
        price: '99.99',
        price_total: '1499.85',
        tax_total: '75.00',
        custom_fields: []
      }
    ]
  },

  customerChanged: {
    event_type: 'sale.customer.changed',
    retailer_id: '00000000-0001-0001-0001-000000000001',
    retailer: {
      id: '00000000-0001-0001-0001-000000000001',
      domain_prefix: 'company'
    },
    sale: {
      id: '0f6799a5-3a64-b647-11ed-a739c219e537',
      status: 'OPEN',
      total_price: '99.99',
      total_tax: '5.00',
      custom_fields: []
    },
    user: {
      id: '08002782-0c90-11e6-e3ed-117ec127b1cb',
      username: 'Admin',
      account_type: 'admin'
    },
    customer: {
      id: 'customer456',
      account_type: 'new' // 新客户
    }
  },

  saleCreated: {
    event_type: 'sale.created',
    retailer_id: '00000000-0001-0001-0001-000000000001',
    retailer: {
      id: '00000000-0001-0001-0001-000000000001',
      domain_prefix: 'company'
    },
    sale: {
      id: '0f6799a5-3a64-b647-11ed-a739c219e537',
      status: 'OPEN',
      total_price: '0.00',
      total_tax: '0.00',
      custom_fields: []
    },
    user: {
      id: '08002782-0c90-11e6-e3ed-117ec127b1cb',
      username: 'Admin',
      account_type: 'admin'
    }
  }
};

// 测试函数
async function testEndpoint(eventName, eventData) {
  try {
    console.log(`\n🧪 测试事件: ${eventName}`);
    console.log('📤 发送数据:', JSON.stringify(eventData, null, 2));
    
    const response = await axios.post(`${BASE_URL}${ENDPOINT}`, eventData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ 响应状态:', response.status);
    console.log('📥 响应数据:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    return null;
  }
}

// 健康检查
async function healthCheck() {
  try {
    console.log('🏥 健康检查...');
    const response = await axios.get(BASE_URL);
    console.log('✅ 服务正常运行:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 服务不可用:', error.message);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始测试 Lightspeed Business Rule Handler');
  console.log('=' .repeat(50));
  
  // 健康检查
  const isHealthy = await healthCheck();
  if (!isHealthy) {
    console.log('❌ 服务不可用，请先启动服务器');
    return;
  }
  
  // 测试各种事件
  const tests = [
    ['sale.ready_for_payment (大额销售)', testEvents.saleReadyForPayment],
    ['sale.line_items.added (添加手机)', testEvents.lineItemsAdded],
    ['sale.line_items.updated (大量商品)', testEvents.lineItemsUpdated],
    ['sale.customer.changed (新客户)', testEvents.customerChanged],
    ['sale.created (新销售)', testEvents.saleCreated]
  ];
  
  for (const [name, data] of tests) {
    await testEndpoint(name, data);
    // 等待一秒再测试下一个
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 所有测试完成！');
}

// 如果直接运行此文件
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testEndpoint,
  healthCheck,
  runAllTests,
  testEvents
}; 