
import React from 'react';

const ACard = ({backgroundImage, backgroundColor, children, name}) => {
	let style ={
		backgroundColor, 
		backgroundImage: backgroundImage? 'url(' + backgroundImage + ')' : null,
		backgroundSize: 'cover'
	};
	return (
		<div className='w-100' style={style} >
			{name? <a name={name} /> : null}
			<div className='container p-1'>
				{children}
			</div>
		</div>
	);
};
export default ACard;
