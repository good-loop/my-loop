
// Which base URL should we visit to run tests in each context?
const targetServers = {
	local: 'http://localmy.good-loop.com',
	test: 'https://testmy.good-loop.com',
	prod: 'https://my.good-loop.com'
};

module.exports = {
	targetServers,
};
