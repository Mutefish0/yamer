import typescript from 'rollup-plugin-typescript'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
    input: 'src/main.ts',
    output: {
        file: 'dist/bundle.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        resolve(),
        commonjs()
    ],
    watch: {
        include: 'src/**'
    }
}