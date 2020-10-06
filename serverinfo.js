const express = require('express');
const app = express();
const port = 3000;
const appInfo = require('./GLAppInfo.json');

app.get('/', (req, res) => {
    // yanked from CBase.js
    // Host and protocol
    let serverInfo = {};
    serverInfo.type = ''; // production
    const host = req.get('host');
	if (host.startsWith('test')) serverInfo.type = 'test';
	else if (host.startsWith('local')) serverInfo.type = 'local';
	// local servers dont have https
	serverInfo.https = (serverInfo.type === 'local') ? 'http' : 'https';
	const prod = serverInfo.type !== 'local' && serverInfo.type !== 'test';
    serverInfo.isProduction = prod;
    
    // App info (yanked from C.js)
    serverInfo.app = appInfo;

	res.json(serverInfo);
});

app.listen(port, () => {
	console.log(`Server info being served on port ${port}`);
});
