const path = require('path')

module.exports = {
    host: 'localhost',
    port: 8081,
    publicPath: '/',
    contentBase: path.join(__dirname, '../dist/browser'),
    overlay: true,
    proxy: {
        '/api': {
            target: 'http://localhost:26303',
            changeOrigin: true,
            secure: false
        },
    }
}