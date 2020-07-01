
import React from 'react';
import { space } from '../../base/utils/miscutils.ts';


const ACard = ({backgroundImage, backgroundColor, className, children, name}) => {
	// NB: use a background div, which needs position relative and zindexing -- so we can optionally hide it in css
	// NB: noting that the backgroundImage settings have to be done here ojn the element, which means they cant be overridden
	let style = {
		backgroundColor, 
		backgroundImage: backgroundImage? 'url(' + backgroundImage + ')' : null,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
		zIndex:1
	};
	// NB: the ACard classname is really just to help in debug -- best not to attach csss to it
	return (
		<div data-name={name} className={space('ACard w-100', className)} style={{position: 'relative'}}>
			<div className="bg" style={style} />
			{name? <a name={name} /> : null}
			<div className="container p-2" style={{zIndex:2, position: 'relative'}}>
				{children}
			</div>
		</div>
	);
};


export default ACard;
