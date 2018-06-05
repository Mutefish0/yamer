const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const webpack = require('webpack')

module.exports = {
	entry: path.join(__dirname, '../src/backend/index.ts'),
	target: 'node',
	output: {
		path: path.join(__dirname, '../dist/backend'),
		filename: 'index.js'
	},
	resolve: {
		extensions: [ '.ts', '.js' ],
		plugins: [new TsconfigPathsPlugin({ configFile: path.join(__dirname, '../tsconfig.json')}) ]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: {
					configFile: path.join(__dirname, '../tsconfig.backend.json')
				}
			}
		]
	},
	externals: {
		level: 'require("level")'
	}
}

