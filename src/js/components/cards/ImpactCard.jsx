import React from 'react';
import Misc from '../../base/components/Misc';
import {RoundLogo} from '../Image';

const ImpactCard = ({children, className}) => (
	<div className={'impact-card ' + className}>
		{children}
	</div>
);

const ImpactHeaderText = ({amount, className, headerText, subheaderText}) => (
	<>
		<div className={'pad1 row ' + className}>	
			<div className='header impact-header col-md-6 col-sm-12'>
				{headerText}
			</div>
			<div className='sub-header impact-sub-header col-md-6 col-sm-12'>
				{subheaderText} 
				<Misc.Money amount={amount} />
			</div>
		</div>
	</>
);

const ImpactHeaderNumber = ({className, headerText, subheaderText, logoSrc}) => (
	<>
		<div className={'pad1 ' + className}>	
			<div className='header impact-header'>
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
	</>
);

/** Generic div with image as background
 * @param render set to layer elements over background image
 * Width auto to allow for bootstrap col
 */
const ImpactImage = ({className, imageSrc, children}) => (
	<>
		<div className={'img-block-basic text-left ' + className} style={{backgroundImage: 'url(' + imageSrc + ')'}}>
			{children}
		</div>
	</>
);

const ImpactImageText = (props) => <ImpactImage {...props} />;

const ImpactImageNumber = ({alt, className, logoSrc, headerText, subheaderText, ...props}) => (
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
			<div className='header white'>
				{headerText}
			</div>
		</div>
	</ImpactImage>
);

export {
	ImpactCard,

	ImpactHeaderText,
	ImpactHeaderNumber,

	ImpactImage,
	ImpactImageText,
	ImpactImageNumber
};
