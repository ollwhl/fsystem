const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // 后端应用的地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '' // 重写请求路径，去掉 /api 前缀
        }
      }
    }
  }
});

