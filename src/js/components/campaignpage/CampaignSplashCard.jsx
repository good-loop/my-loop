import React, { memo, useEffect, createRef } from 'react';
import _ from 'lodash';
import { Container } from 'reactstrap';
import ACard from '../cards/ACard';
import Counter from '../../base/components/Counter';
import GoodLoopAd from './GoodLoopAd';

const SplashCard = ({ branding, donationValue, adId, landing }) => {
	return (<ACard className="hero">
		<div className='flex-row flex-centre p-1'>
			<img className='hero-logo' src={branding.logo} alt='advertiser-logo' />
		</div>
		{ landing ? <div className="top-advert-player">
			<GoodLoopAd vertId={adId} size="landscape" nonce={`landscape${adId}`} production />
		</div> : '' }
		<div className='sub-header p-1'>
			<div>
				<span>Together our ads for good have raised</span>
			</div>
			{donationValue? <div className='header' style={{color: 'black'}}>&pound;<Counter sigFigs={4} value={donationValue} minimumFractionDigits={2} /></div> : 'money'}
		</div>
	</ACard>);
};

export default SplashCard;
