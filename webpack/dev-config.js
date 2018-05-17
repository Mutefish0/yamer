const path = require('path')

module.exports = {
    host: 'localhost',
    port: 8081,
    publicPath: 'http://localhost:8081/',  // 这里一定要用绝对URL，不然url-loader有BUG
    contentBase: path.join(__dirname, '../dist/browser'),
    hotOnly: true,
    overlay: true,
    proxy: {
        '/api': {
            target: 'http://localhost:26303',
            changeOrigin: true,
            secure: false
        },
    }
}