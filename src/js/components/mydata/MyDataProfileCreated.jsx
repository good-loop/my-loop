import React from 'react';
import { Row, Col } from 'reactstrap';
import { getPersonSetting, getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import { MyDataCard, SkipNextBtn } from './MyDataCommonComponents';
import BSCarousel from '../../base/components/BSCarousel';
import { countryListAlpha2 } from '../../base/data/CountryRegion';
import CharityLogo from '../CharityLogo';

const MyDataProfileCreated = () => {

	let locationCountryCode = getPersonSetting({key:"location-country"});
	let locationCountry = countryListAlpha2[locationCountryCode];

	let ngo = getCharityObject();

	const slidesItems = [
		<>
			<Row>
				<p style={{fontSize:'.8rem'}}>Your Location</p>
				{locationCountry && <p>{locationCountry}</p>}
			</Row>
			<Row>
				<Col xs={6}>
					<p className='text-muted' style={{fontSize:'.8rem'}}>Default Privary</p>
				</Col>
				<Col xs={6} className='d-flex justify-content-between'>
					<img style={{height:'2rem'}} src="/img/mydata/padlock-opened.png" alt="" />
					<img style={{height:'2rem'}} src="/img/mydata/padlock-mid.png" alt="" />
					<img style={{height:'2rem'}} src="/img/mydata/padlock-locked.png" alt="" />
				</Col>
			</Row>
			<p className='speech-bubble'>
				What default privacy means and how it related to charity doncations
			</p>
			
		</>,
		<>
			{ngo && <CharityLogo charity={ngo} className="w-100"/>}
			<p>Donation Level Enabled</p>
		</>
	]

	const slides = slidesItems.map((content, i) => (
		<div key={i} className='profile-created-slides'>
			{content}
		</div>
	));

	return <>
	<div className='border border-dark'>
		<div className='p-2'>
			<p>For every piece of data you've shared with us, you can control how it's used.</p>
			<MyDataCard className='shadow bg-gl-light-pink'>
				<BSCarousel hasIndicators>
					{slides}
				</BSCarousel>
			</MyDataCard>
			<SkipNextBtn /> 
		</div>
	</div>
	</>;   

};

export default MyDataProfileCreated;
