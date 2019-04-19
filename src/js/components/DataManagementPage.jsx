import React from 'react';
import Login from 'you-again';

import DataStore from '../base/plumbing/DataStore';

import DigitalMirrorCard from './DigitalMirrorCard';
import ConsentWidget from './ConsentWidget';
import SocialMediaCard from './SocialMediaCard';
import LinkedProfilesCard from './LinkedProfilesCard';
import { LoginToSee } from './Bits';
import NavBar from './NavBar';
import Footer from './Footer';
import { withLogsIfVisible } from '../base/components/HigherOrderComponents';

let Page = () => {
	const xids = DataStore.getValue(['data', 'Person', 'xids']) || [];

	return (
		<div className='page text-center'>
			<NavBar />
			<div title="Your Digital Mirror" className='container-fluid'>
				<div className='row panel-title panel-heading sub-header pad1'> 
					Digital Mirror
				</div>
				<div className='row pad1'> 
					<DigitalMirrorCard xids={xids} className="digitalMirror" mixPanelTag='DigitalMirror' />
					<SocialMediaCard allIds={xids} className="socialConnect" />	
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
						<LoginToSee />
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
			<Footer className='background-gl-red' />
		</div>
	);
};

export default withLogsIfVisible(Page);
