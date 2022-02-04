import React from 'react';
import { Container, Button, Form, FormGroup } from 'reactstrap';
import { space, stopEvent } from '../../base/utils/miscutils';

import DataStore from '../../base/plumbing/DataStore';
import PropControl from '../../base/components/PropControl';
import { doRegisterEmail, PURPOSES } from '../../base/data/Person';
import { setPersonSetting } from '../pages/TabsForGoodSettings';


/**
 * Displays email register form
 * @param {String} title header to give the box
 */
const SubscriptionBox = ({title="Support the causes you care about, and see the lives you're helping to improve", className}) => {	
	return (<div id="subscription-box" className={space("flex-column align-items-center justify-content-center subscription-box", className)}>
		<Container className="text-center">
			{title && <><h1>{title}</h1>
			<p className='mb-4'>A short monthly email with easy ways to support your charity, updates on our impact as a community, and other news from Good-Loop.</p>
			</>}
		</Container>
		<SubscriptionForm />
	</div>);
};


export const SubscriptionForm = ({label="", purpose=PURPOSES.email_mailing_list, charityId}) => {
	// NB: suppose we have a subscribe-to-mailing-list and a preregister form on the same page? Keep the data separate.
	// OTOH two subscribe-to-mailing-list forms are treated as overlapping
	// ??
	const ctaFormPath = ['misc', 'ctaForm', purpose];

	DataStore.setValue(ctaFormPath.concat("purpose"), purpose);

	const doEmailSignUp = e => {
		stopEvent(e);
		const formData = DataStore.getValue(ctaFormPath);
		if ( ! formData || ! formData.email) return; // quiet fail NB: we didnt like the disabled look for a CTA
		doRegisterEmail(formData);
		if (charityId) {
			setPersonSetting("charity", charityId);
		}
		DataStore.setValue(ctaFormPath.concat("hasSubmittedEmail"), true);
	};

	const hasSubmittedEmail = DataStore.getValue(ctaFormPath.concat("hasSubmittedEmail")) === true;
	if (hasSubmittedEmail) {
		return <><h4>Thank you!</h4><p>We'll email you shortly :)</p></>;
	}		
	
	return (<Form inline className="flex-row align-items-stretch justify-content-center m-auto" onSubmit={doEmailSignUp}>				
				<FormGroup className="mb-2 mr-sm-2 mb-sm-0 outer-form-group flex-grow-1 m-0 pr-md-3">
					<PropControl
						label={label}
						className="w-100 h-100"
						prop="email"
						path={ctaFormPath}
						placeholder="yourname@youremail.com"
					/>
				</FormGroup>
				{purpose!==PURPOSES.email_mailing_list 
					&& <PropControl type="checkbox" path={ctaFormPath} label="Subscribe to our good news mailing list :)" prop="purpose2" value={PURPOSES.email_mailing_list} />}
				<Button color="secondary" disabled={hasSubmittedEmail} className="flex-grow-0">
					Sign me up
				</Button>				
			</Form>);
};

export default SubscriptionBox;
