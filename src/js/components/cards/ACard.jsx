
import React from 'react';

const ACard = ({backgroundImage, backgroundColor, children}) => {
	let style ={
		backgroundColor, 
		backgroundImage: backgroundImage? 'url(' + backgroundImage + ')' : null,
		backgroundSize: 'cover'
	};
	return (
		<div className='w-100' style={style} >
			<div className='container-fluid'>
				{children}
			</div>
		</div>
	);
};
export default ACard;
