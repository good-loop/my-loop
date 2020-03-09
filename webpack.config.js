/*
	NB The webpack.config.js files in my-loop, adserver and wwappbase.js are identical but cannot be symlinked!
	If it's a symlink, NPM will resolve paths (including module names) relative to the symlink source - and
	complain that it can't find webpack, because it's not installed in /wwappbase.js/templates/node_modules
	Keep this copy in sync with the others - if the same file can't be used for all three, there should be a good reason.
 */
const webpack = require('webpack');
const path = require('path');


const baseConfig = {
	entry: ['@babel/polyfill', './src/js/app.jsx'],
	output: {
		path: path.resolve(__dirname, './web/build/js/'),
		// filename: is left undefined and filled in by makeConfig
	},
	devtool: 'source-map',
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		symlinks: false
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: [
						['@babel/preset-typescript', { targets: { ie: "11" }, loose: true }],
						'@babel/react'
					],
					plugins: [
						'@babel/plugin-transform-typescript',
						'babel-plugin-const-enum'
					]
				}
			},
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					presets: [
						['@babel/preset-env', { targets: { ie: "11" }, loose: true }]
					],
					plugins: [
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-transform-react-jsx',
						'transform-node-env-inline'
					]
				}
			}
		],
	},
};


/*
* Copy and fill out the baseConfig object with
* @param filename {!String} Set the bundle output.filename
* 
* ## process.env 
* process is always globally available to runtime code.
*/
const makeConfig = ({ filename, mode }) => {
	// config.mode can be "development" or "production" & dictates whether JS is minified
	const config = Object.assign({}, baseConfig, { mode });
	
	// What filename should we render to?
	config.output = Object.assign({}, config.output, { filename });

	/**
	 * process.env is available globally within bundle.js & allows us to hardcode different behaviour for dev & production builds
	 * NB Plain strings here will be output as token names and cause a compile error, so use JSON.stringify to turn eg "production" into "\"production\""
	 */
	config.plugins = [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(mode), // Used by bundle.js to conditionally set up logging & Redux dev tools
			}
		}),
	];
	return config;
};

const configs = [
	makeConfig({filename: 'bundle-debug.js', mode: 'development' }),
];

// Allow debug-only compilation for faster iteration in dev
if (process.env.NO_PROD !== 'true') {
	configs.push(makeConfig({filename: 'bundle.js', mode: 'production' }));
}

// Output bundle files for production and dev/debug
module.exports = configs;
