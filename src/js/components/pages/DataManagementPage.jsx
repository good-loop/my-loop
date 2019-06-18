import React, {useEffect, useRef} from 'react';
import Login from 'you-again';

import DataStore from '../../base/plumbing/DataStore';

import DigitalMirrorCard from '../cards/DigitalMirrorCard';
import ConsentWidget from '../ConsentWidget';
import SocialMediaCard from '../cards/SocialMediaCard';
import LinkedProfilesCard from '../cards/LinkedProfilesCard';
import NavBar from '../NavBar';
import Footer from '../Footer';
import { useLogsIfVisible } from '../../base/components/CustomHooks';
import {getAllXIds} from '../../base/Profiler';
import Misc from '../../base/components/Misc';

const Page = () => {
	const xids = DataStore.getValue(['data', 'Person', 'xids']) || [];

	// HACK (23/04/19): you_again does not call login.change() after user connects with Twitter
	// Means that xids were never being refreshed => user can never use the DigitalMirror
	// Think that taking a look at you_again is the proper long-term solution, but this will do for right now
	useEffect(() => {
		DataStore.setValue(['data', 'Person', 'xids'], getAllXIds());
	}, [Login && Login.aliases && Login.aliases.length]);

	let doesIfVisibleRef = useRef();
	useLogsIfVisible(doesIfVisibleRef, 'ShareAnAdVisible');

	return (
		<div className='page DataPage text-center' ref={doesIfVisibleRef}>
			<NavBar logo='/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png' />
			<div title="Your Digital Mirror" className='container-fluid'>
				<div className='row panel-title panel-heading sub-header pad1'> 
					Digital Mirror
				</div>
				<div className='row pad1'> 
					<DigitalMirrorCard xids={xids} className="digitalMirror" mixPanelTag='DigitalMirror' />
					<div className='flex-column'>
						<div>Connect your social media - you can use this to boost the donations you generate!</div>
						<SocialMediaCard allIds={xids} className="socialConnect" />	
					</div>
				</div>
			</div>

			<div title="Consent Controls" className="consentControls container-fluid">
				<div className='row panel-title panel-heading sub-header pad1'> 
					Consent Controls
				</div>
				<div className='row pad1'> 
					{Login.isLoggedIn() ? (
						<ConsentWidget xids={xids} />
					) : (
						<Misc.LoginToSee />
					)}
				</div>
			</div>
			<div title='Linked Profiles' className="linkedProfiles container-fluid">
				<div className='row panel-title panel-heading sub-header pad1'> 
					Linked Profiles
				</div>
				<div className='row pad1'> 
					<LinkedProfilesCard xids={xids} />
				</div>
			</div>
			<Footer className='bg-gl-red' />
		</div>
	);
};

export default Page;
