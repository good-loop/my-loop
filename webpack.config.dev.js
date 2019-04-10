var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: ['@babel/polyfill', './src/js/app.jsx'],
	output: { path: __dirname, filename: './web/build/js/bundle.js' },
	watch: true,
	devtool: 'source-map',
	resolve: {
		extensions: ['.js', '.jsx'],
		symlinks: false
	},
	module: {
		rules: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['@babel/preset-env', { targets: { ie: "11" }, loose: true }],
					plugins: [
						"transform-node-env-inline", 
						'@babel/plugin-transform-react-jsx',
						"@babel/plugin-proposal-class-properties"
					]
				}
			}
		]
	},
};
