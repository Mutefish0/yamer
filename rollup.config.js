const rollupPluginTypescriptPathMapping = require('rollup-plugin-typescript-path-mapping')

module.exports = {
    input: 'dist/main.js',
    output: {
        file: 'dist/bundle.js',
        format: 'iife'
    },
    plugins: [rollupPluginTypescriptPathMapping({ tsconfig: true })]
}