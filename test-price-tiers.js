const axios = require('axios');

// 测试配置
const GLITCH_URL = 'https://ptc-lightspeed.glitch.me';
const ENDPOINT = '/vend-business-rule';

console.log('🧪 价格区间确认消息测试');
console.log('=' .repeat(50));
console.log(`📡 测试端点: ${GLITCH_URL}${ENDPOINT}`);
console.log('');

// 测试不同价格区间的数据
const priceTestCases = [
  {
    name: '价格 < $120 (应该显示 $20 优惠)',
    totalPrice: '99.99',
    expectedMessage: 'Spend $120, instantly save $20'
  },
  {
    name: '价格 = $120 (应该显示 $50 优惠)',
    totalPrice: '120.00',
    expectedMessage: 'Spend $200, instantly save $50'
  },
  {
    name: '价格 $120-200 (应该显示 $50 优惠)',
    totalPrice: '150.00',
    expectedMessage: 'Spend $200, instantly save $50'
  },
  {
    name: '价格 = $200 (应该显示 $100 优惠)',
    totalPrice: '200.00',
    expectedMessage: 'Spend $300, instantly save $100'
  },
  {
    name: '价格 $200-300 (应该显示 $100 优惠)',
    totalPrice: '250.00',
    expectedMessage: 'Spend $300, instantly save $100'
  },
  {
    name: '价格 >= $300 (不应该显示任何确认)',
    totalPrice: '350.00',
    expectedMessage: '无确认消息'
  }
];

// 测试函数
async function testPriceTier(testCase) {
  try {
    console.log(`🧪 测试: ${testCase.name}`);
    console.log(`💰 价格: $${testCase.totalPrice}`);
    
    const eventData = {
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
              name: 'Test Product',
              custom_fields: []
            },
            quantity: '1',
            price: testCase.totalPrice,
            price_total: testCase.totalPrice,
            tax_total: '0.00',
            custom_fields: []
          }
        ],
        note: '',
        total_price: testCase.totalPrice,
        price_total: testCase.totalPrice, // 添加 price_total 字段
        total_tax: '0.00',
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
    };
    
    const response = await axios.post(`${GLITCH_URL}${ENDPOINT}`, eventData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Price-Tier-Test-Client/1.0'
      },
      timeout: 5000
    });
    
    console.log('✅ 请求成功!');
    console.log('📥 响应数据:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // 分析响应
    const actions = response.data.actions || [];
    const confirmActions = actions.filter(action => action.type === 'confirm');
    
    if (confirmActions.length > 0) {
      const confirmAction = confirmActions[0];
      console.log('🎯 确认消息:');
      console.log(`  标题: ${confirmAction.title}`);
      console.log(`  消息: ${confirmAction.message}`);
      console.log(`  确认按钮: ${confirmAction.confirm_label}`);
      console.log(`  取消按钮: ${confirmAction.dismiss_label}`);
      
      // 验证消息内容
      if (confirmAction.message.includes(testCase.expectedMessage.split(' – ')[0])) {
        console.log('✅ 消息内容正确!');
      } else {
        console.log('❌ 消息内容不符合预期');
      }
    } else {
      console.log('ℹ️  没有确认消息');
      if (testCase.expectedMessage === '无确认消息') {
        console.log('✅ 符合预期（价格 >= $300 不显示确认）');
      } else {
        console.log('❌ 应该显示确认消息');
      }
    }
    
    console.log('');
    return { success: true, actions };
    
  } catch (error) {
    console.error('❌ 测试失败!');
    console.error(`💬 错误信息: ${error.message}`);
    console.log('');
    return { success: false, error: error.message };
  }
}

// 运行所有测试
async function runPriceTierTests() {
  console.log('🚀 开始价格区间测试');
  console.log('=' .repeat(50));
  
  const results = [];
  
  for (const testCase of priceTestCases) {
    const result = await testPriceTier(testCase);
    results.push({ ...testCase, ...result });
    
    // 等待一秒再测试下一个
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 测试总结
  console.log('📊 测试总结');
  console.log('=' .repeat(30));
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log(`✅ 成功测试: ${successfulTests.length}/${results.length}`);
  console.log(`❌ 失败测试: ${failedTests.length}/${results.length}`);
  
  if (failedTests.length > 0) {
    console.log('\n❌ 失败的测试:');
    failedTests.forEach(test => {
      console.log(`  - ${test.name}: ${test.error}`);
    });
  }
  
  console.log('\n🎉 价格区间测试完成！');
}

// 如果直接运行此文件
if (require.main === module) {
  runPriceTierTests().catch(console.error);
}

module.exports = {
  testPriceTier,
  runPriceTierTests,
  priceTestCases
}; 