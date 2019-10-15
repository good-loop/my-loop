
import React from 'react';
import { join } from 'wwutils';

const ACard = ({backgroundImage, backgroundColor, className, children, name}) => {
	let style ={
		backgroundColor, 
		backgroundImage: backgroundImage? 'url(' + backgroundImage + ')' : null,
		backgroundSize: 'cover'
	};
	return (
		<div className={join('w-100',className)} style={style} >
			{name? <a name={name} /> : null}
			<div className='container p-2'>
				{children}
			</div>
		</div>
	);
};
export default ACard;
