const config = JSON.parse(process.env.__CONFIGURATION);
console.log(config)

module.exports = {
	roots: ['<rootDir>/src'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	launch: {
		headless: config.head,
        slowMo: process.env.SLOWMO ? process.env.SLOWMO : 0,
		executablePath: config.chrome ? '/usr/bin/google-chrome-stable' : ''
	}
};
