import React from 'react';
import Misc from '../../base/components/Misc';

const ImpactCard = ({children}) => (
	<div className='impact-card'>
		{children}
	</div>
);

/**
 * 
 * @param className use to set background colour/text colour 
 */
const ImpactHeader = ({className, render}) => (
	<div className={'impact-header pad1 ' + className}>
		<div className='triangle' />
		{render()}
	</div>
);

const ImpactHeaderText = ({amount, headerText, subheaderText, ...props}) => <ImpactHeader {...props} render={() => (
	<>
		<div className='header'>
			{headerText}
		</div>
		<div className='sub-header'>
			{subheaderText}
			<div>
				<Misc.Money amount={amount} />
			</div>
		</div>
	</>)} 
/>;

const ImpactHeaderNumber = ({headerText, subheaderText, logoSrc, ...props}) => <ImpactHeader {...props} render={() => (
	<>
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
	</>)} 
/>;

/** Generic div with image as background
 * @param render set to layer elements over background image
 */
const ImpactImage = ({className, imageSrc, render}) => (
	<>
		<div className={'img-block text-left pad1 ' + className} style={{backgroundImage: 'url(' + imageSrc + ')'}}>
			{render && render()}
		</div>
	</>
);

const ImpactImageText = ({className, ...props}) => <ImpactImage {...props} className={className + ' impact-image-text'} />;

const ImpactImageNumber = ({logoSrc, headerText, subheaderText, ...props}) => <ImpactImage {...props} render={() => (
	<div className='flex-column'>
		<img className='impact-logo' src={logoSrc} alt='vertiser-logo' />
		<div className='sub-header white'>
			{subheaderText}
		</div>
		<div className='header white'>
			{headerText}
		</div>
	</div>
)}
/>;

export {
	ImpactCard,

	ImpactHeader,
	ImpactHeaderText,
	ImpactHeaderNumber,

	ImpactImage,
	ImpactImageText,
	ImpactImageNumber
};
