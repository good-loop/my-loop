import React, { useState, useEffect } from 'react';
import { useTransition, animated, config } from 'react-spring';

const bgImages = [
	{ id: 0, url: '/img/wateraid-bg.jpg' },
	{ id: 1, url: '/img/woodland-trust-bg.jpg' },
	{ id: 2, url: '/img/wwf-bg.jpg' }
];

const LandingSection = () => {
	const [index, setIndex] = useState(0);
	const transitions = useTransition(bgImages[index], item => item.id, {
		from : { opacity: 0 },
		enter: { opacity: 1 },
		leave: { opacity: 0 },
		config: { ...config.molasses, duration: 1000 },
	});

	// eslint-disable-next-line no-void
	useEffect(() => void setInterval(() => setIndex(state => (state + 1) % 3), 5000), []);
	return transitions.map(({ item, props, key }) => (
		<animated.div
			key={key}
			// className="background-image"
			src={ item.url }
			style={{...props}}
		>
			<img className="background-image" src={item.url} alt="background" />
		</animated.div>
	));
};

export default LandingSection;
