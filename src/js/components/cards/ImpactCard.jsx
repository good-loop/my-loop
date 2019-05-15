import React from 'react';
import Misc from '../../base/components/Misc';

const ImpactCard = ({children}) => (
	<div className='impact-card'>
		{children}
	</div>
);

const ImpactHeaderText = ({amount, className, headerText, subheaderText}) => (
	<>
		<div className='triangle-gl-red' />
		<div className={'impact-header pad1 ' + className}>	
			<div className='header'>
				{headerText}
			</div>
			<div className='sub-header'>
				{subheaderText}
				<div>
					<Misc.Money amount={amount} />
				</div>
			</div>
		</div>
	</>
);

const ImpactHeaderNumber = ({className, headerText, subheaderText, logoSrc}) => (
	<>
		<div className='triangle-gl-blue' />
		<div className={'impact-header pad1 ' + className}>	
			<div className='header'>
				{headerText}
			</div>
			<div className='sub-header'>
				{subheaderText}
				<div className='flex-row'>
					<span>Made possible by adverts from:</span>
					<img className='impact-logo' src={logoSrc} alt='vertiser-logo' />
				</div>
			</div>
		</div>
	</>
);

/** Generic div with image as background
 * @param render set to layer elements over background image
 */
const ImpactImage = ({className, imageSrc, children}) => (
	<>
		<div className={'img-block text-left pad1 ' + className} style={{backgroundImage: 'url(' + imageSrc + ')'}}>
			{children}
		</div>
	</>
);

const ImpactImageText = ({className, ...props}) => <ImpactImage {...props} className={className + ' impact-image-text'} />;

const ImpactImageNumber = ({logoSrc, headerText, subheaderText, ...props}) => (
	<ImpactImage {...props}>
		<div className='flex-column'>
			<img className='impact-logo' src={logoSrc} alt='vertiser-logo' />
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
