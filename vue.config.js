const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',//服务器配置需要
  devServer: {
    proxy: {

      '/api': {
        target: 'http://157.7.205.120:8081', // 后端应用的地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '' // 重写请求路径，去掉 /api 前缀
        }
      }
    }
  }
});

