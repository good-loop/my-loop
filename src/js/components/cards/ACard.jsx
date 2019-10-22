
import React from 'react';
import { join } from 'wwutils';

const ACard = ({backgroundImage, backgroundColor, className, children, name}) => {
	let style ={
		backgroundColor, 
		backgroundImage: backgroundImage? 'url(' + backgroundImage + ')' : null,
		backgroundSize: 'cover'
	};
	// NB: the ACard classname is really just to help in debug -- best not to attach csss to it
	return (
		<div data-name={name} className={join('ACard w-100',className)} style={style}>
			{name? <a name={name} /> : null}
			<div className='container p-2'>
				{children}
			</div>
		</div>
	);
};
export default ACard;
