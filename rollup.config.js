import typescript from 'rollup-plugin-typescript';

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
        })
    ],
    watch: {
        include: 'src/**'
    }
}