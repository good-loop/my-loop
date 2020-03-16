import React, { useState, useEffect } from 'react';
import { useTransition, animated, config } from 'react-spring';

const bgImages = [
	{ id: 0, url: '/img/wateraid-bg.jpg' },
	{ id: 1, url: '/img/woodland-trust-bg.jpg' },
	{ id: 2, url: '/img/wwf-bg.jpg' }
];

const bgLogos = [
	'/img/wateraid-logo.jpg',
	'/img/woodland-trust-logo.jpg',
	'/img/wwf-logo.jpg'
];

const LandingSection = () => {
	const [index, setIndex] = useState(0);
	const transitions = useTransition({ bg: bgImages[index], icon: bgLogos[index] }, item => item.bg.id, {
		from : { opacity: 0 },
		enter: { opacity: 1 },
		leave: { opacity: 0 },
		config: { ...config.molasses, duration: 1000 },
	});

	// eslint-disable-next-line no-void
	useEffect(() => void setInterval(() => setIndex(state => (state + 1) % 3), 7000), []);
	return transitions.map(({ item, props, key }) => (
		<animated.div
			key={key}
			// className="background-image"
			// src={ item.url }
			style={{...props}}
		>
			<img className="background-image" src={item.bg.url} alt="background" />
			<img className="background-logo" src={item.icon} alt="charity logo" />
		</animated.div>
	));
};

export default LandingSection;
