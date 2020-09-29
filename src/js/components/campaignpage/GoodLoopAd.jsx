
import React, { memo, useEffect, createRef } from 'react';
import _ from 'lodash';
import { Container } from 'reactstrap';
import ACard from '../cards/ACard';
import Counter from '../../base/components/Counter';
import ServerIO from '../../plumbing/ServerIO';

// FIXME how does this relate to GoodLoopUnit.jsx?? or DemoPlayer.jsx GoodLoopAd
// Why memo??
const GoodLoopAd = memo(({ vertId, size, nonce, social, glParams = { 'gl.play': 'onclick' } }) => {
	// let prefix = '';
	// if (window.location.hostname.match(/^local/)) prefix = 'local';
	// if (window.location.hostname.match(/^test/)) prefix = 'test';
	// if (production) prefix = '';
	const glUnitUrl = new URL(ServerIO.AS_ENDPOINT+'/unit.js');
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
		<div className={`ad-sizer ${size} ${social ? 'slide-in' : ''} position-relative`} style={{zIndex:99}} ref={adContainer} >
			<div className="aspectifier" />
			<div className="goodloopad" data-format={size} data-mobile-format={size} key={nonce + '-container'} />
		</div>
	);
});

export default GoodLoopAd;
