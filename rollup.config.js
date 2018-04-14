import typescript from 'rollup-plugin-typescript'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default [{
    input: 'src/browser/main.tsx',
    output: {
        file: 'dist/browser/bundle.js',
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
        include: 'src/browser/**'
    }
}, {
        input: 'src/platform/index.ts',
        output: {
            file: 'dist/platform/index.js',
            format: 'cjs',
            sourcemap: true
        },
        plugins: [
            typescript({
                typescript: require('typescript')
            }),
            resolve()
        ],
        watch: {
            include: 'src/platform/**'
        }
}]