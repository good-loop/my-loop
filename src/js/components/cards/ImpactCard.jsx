import React from 'react';
import {RoundLogo} from '../Image';
import Counter from '../../base/components/Counter';

const ImpactCard = ({children, className}) => (
	<div className={'impact-card ' + className}>
		{children}
	</div>
);

// How does this differ from ImpactImageNumber?? Should they be merged??
const ImpactHeaderNumber = ({className, amount, headerText, subheaderText, logoSrc}) => (
	<div className={'pad1 ' + className}>	
		<div className='header impact-header'>
			<Counter value={amount} /> 
			{headerText}
		</div>
		<div className='sub-header impact-sub-header'>
			{subheaderText}
			<div className='flex-row flex-wrap'>
				{ logoSrc 
					&& <>
						<span>Made possible by adverts from:</span>
						<img className='impact-logo' src={logoSrc} alt='vertiser-logo' />
					</>
				}
			</div>
		</div>
	</div>
);
//
/** Generic div with image as background
 * @param render set to layer elements over background image
 * Width auto to allow for bootstrap col
 */
const ImpactImage = ({className, imageSrc, children}) => (
	<div className={'img-block-basic text-left ' + className} style={{backgroundImage: 'url(' + imageSrc + ')'}}>
		{children}
	</div>
);

const ImpactImageText = (props) => <ImpactImage {...props} />;

// How does this differ from ImpactImageNumber?? Should they be merged??
const ImpactImageNumber = ({alt, className, logoSrc, amount, headerText, subheaderText, ...props}) => (
	<ImpactImage className={className + ' img-block '} {...props}>
		<div className='flex-column'>
			{logoSrc 
				&& (
					<RoundLogo url={logoSrc} alt={alt || 'advertiser-logo'} /> 
				)
			}
			<div className='sub-header white'>
				{subheaderText}
			</div>
			<div className='header white margin0'>
				<Counter value={amount} />
				{headerText}
			</div>
		</div>
	</ImpactImage>
);

export {
	ImpactCard,

	ImpactHeaderNumber,

	ImpactImage,
	ImpactImageText,
	ImpactImageNumber
};
export default ImpactCard;
