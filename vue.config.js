const { defineConfig } = require('@vue/cli-service')

const targetUrl = process.env.VUE_APP_API_BASE_URL
console.log("ENV ::: " + process.env.VUE_APP_ENV)
console.log("targetUrl ::: " + process.env.VUE_APP_API_BASE_URL)

module.exports = defineConfig({
  transpileDependencies: true,

  // REST API
  devServer: {
      proxy: {
        '/api': {
            target: targetUrl,
            changeOrigin: true,
            // pathRewrite: { '^/api': '' }
        }
      }
  }

})
