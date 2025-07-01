#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Lightspeed Business Rule Handler 启动器');
console.log('=' .repeat(50));

// 检查必要的文件是否存在
const requiredFiles = ['server.js', 'package.json', 'config.js'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error('❌ 缺少必要文件:', missingFiles.join(', '));
  console.log('请确保所有文件都在当前目录中');
  process.exit(1);
}

// 检查 node_modules 是否存在
if (!fs.existsSync('node_modules')) {
  console.log('📦 安装依赖...');
  const install = spawn('npm', ['install'], { stdio: 'inherit' });
  
  install.on('close', (code) => {
    if (code === 0) {
      console.log('✅ 依赖安装完成');
      startServer();
    } else {
      console.error('❌ 依赖安装失败');
      process.exit(1);
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log('🔧 启动服务器...');
  
  const server = spawn('node', ['server.js'], { stdio: 'inherit' });
  
  server.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ 服务器异常退出，退出码: ${code}`);
    }
  });
  
  // 处理进程信号
  process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    server.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 正在关闭服务器...');
    server.kill('SIGTERM');
    process.exit(0);
  });
  
  console.log('✅ 服务器已启动');
  console.log('📡 端点: http://localhost:3000/vend-business-rule');
  console.log('🔍 健康检查: http://localhost:3000/');
  console.log('🧪 运行测试: node test.js');
  console.log('🛑 按 Ctrl+C 停止服务器');
} 