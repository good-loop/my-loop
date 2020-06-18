import React, {useEffect, useRef} from 'react';
import Login from 'you-again';

import DataStore from '../../base/plumbing/DataStore';

import DigitalMirrorCard from '../cards/DigitalMirrorCard';
import ConsentWidget from '../ConsentWidget';
import SignUpConnectCard from '../cards/SignUpConnectCard';
import LinkedProfilesCard from '../cards/LinkedProfilesCard';
import NavBar from '../MyLoopNavBar';
import Footer from '../Footer';
import {getAllXIds} from '../../base/Profiler';
import Misc from '../../base/components/Misc';
import {Card as BSCard, CardHeader, CardBody} from 'reactstrap';

const Page = () => {
	const xids = DataStore.getValue(['data', 'Person', 'xids']) || [];

	// HACK (23/04/19): you_again does not call login.change() after user connects with Twitter
	// Means that xids were never being refreshed => user can never use the DigitalMirror
	// Think that taking a look at you_again is the proper long-term solution, but this will do for right now
	useEffect(() => {
		DataStore.setValue(['data', 'Person', 'xids'], getAllXIds());
	}, [Login && Login.aliases && Login.aliases.length]);

	return (
		<div className='page'>
			<NavBar logo='/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png' />
			<div className='container mt-5'>

				<BSCard>
					<CardHeader>Consent Controls</CardHeader>
					<CardBody>
						{Login.isLoggedIn()? <ConsentWidget xids={xids} /> : <Misc.LoginToSee /> }
					</CardBody>
				</BSCard>				

				<BSCard>
					<CardHeader>Digital Mirror</CardHeader>
					<CardBody>
						<DigitalMirrorCard xids={xids} className="digitalMirror" mixPanelTag='DigitalMirror' />
						<div className='flex-column'>
							<div>Connect your social media - you can use this to boost the donations you generate!</div>
							<SignUpConnectCard allIds={xids} className="socialConnect" />	
						</div>
					</CardBody>
				</BSCard>
			
				<BSCard>
					<CardHeader>Linked Profiles</CardHeader>
					<CardBody>
						<LinkedProfilesCard xids={xids} />
					</CardBody>
				</BSCard>
				
			</div>
			<Footer className='bg-gl-red' showSocialMediaLinks />
		</div>
	);
};

export default Page;
