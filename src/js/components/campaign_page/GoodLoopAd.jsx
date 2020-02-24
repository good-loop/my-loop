import React, { memo, createRef, useEffect } from 'react';

const GoodLoopAd = memo(({ vertId, size, nonce, production, social, glParams = { 'gl.play': 'onclick' } }) => {
	let prefix = '';
	if (window.location.hostname.match(/^local/)) prefix = 'local';
	if (window.location.hostname.match(/^test/)) prefix = 'test';
	if (production) prefix = '';

	const glUnitUrl = new URL(`https://${prefix}as.good-loop.com/unit.js`);
	// const fullUnitUrl = glUnitUrl + (vertId ? `?gl.vert=${vertId}&gl.debug=true` : '' );
	if (vertId) glUnitUrl.searchParams.set('gl.vert', vertId);
	Object.entries(glParams).forEach(([key, value]) => {
		glUnitUrl.searchParams.set(key, value);
	});

	let adContainer = createRef();
	let script;

	const createScript = () => {
		script = document.createElement('script');
		script.setAttribute('src', glUnitUrl);
		script.setAttribute('key', `${nonce}-script`);
		return script;
	};

	useEffect(() => {
		adContainer.current.append(createScript());
	}, [nonce]);

	return (
		<div className={`ad-sizer ${size} ${social ? 'slide-in' : ''}`} ref={adContainer} >
			<div className="aspectifier" />
			<div className="goodloopad" data-format={size} data-mobile-format={size} key={nonce + '-container'} />
		</div>
	);
});

export default GoodLoopAd;
