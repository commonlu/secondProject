const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0', // 允许通过公网IP访问
    port: 8081, // 端口号，可以根据需要修改
    open: true // 启动后自动打开浏览器
  }
})
