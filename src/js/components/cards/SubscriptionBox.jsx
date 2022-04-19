import React from 'react';
import { Container, Button, Form, FormGroup } from 'reactstrap';
import { getBrowserVendor, space, stopEvent } from '../../base/utils/miscutils';

import DataStore from '../../base/plumbing/DataStore';
import PropControl from '../../base/components/PropControl';
import { doRegisterEmail, PURPOSES } from '../../base/data/Person';
import { setPersonSetting } from '../pages/TabsForGoodSettings';
import { getNavProps } from '../../base/components/NavBar';


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


export const SubscriptionForm = ({label="", product, purpose=PURPOSES.email_mailing_list, browser, buttonText="Sign me up", textCenter}) => {
	// NB: suppose we have a subscribe-to-mailing-list and a preregister form on the same page? Keep the data separate.
	// OTOH two subscribe-to-mailing-list forms are treated as overlapping
	// ??
	const ctaFormPath = ['misc', 'ctaForm', purpose];	
	DataStore.setValue(ctaFormPath.concat("purpose"), purpose);
	const formData = DataStore.getValue(ctaFormPath);
	formData.product = product; // optional extra info, will default to app = my.good-loop.com
	formData.browser = browser;
	// charity (NGO) or brand (Advertiser) specific?
	const nprops = getNavProps();
	if (nprops && nprops.brandType) {
		formData[nprops.brandType] = nprops.brandId;
	}
	// ...set their charity if they sign up?
	let charityId = null;
	if (product==="T4G" && nprops && nprops.brandType==='NGO') {
		charityId = nprops.brandId;
	}

	const doEmailSignUp = e => {
		stopEvent(e);		
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
	
	const formClass = textCenter ? "text-center mx-auto" : "";

	return (<Form className={formClass} onSubmit={doEmailSignUp}>
				<p className='white'><b>{label}</b></p>
				<input type="hidden" name="purpose" value={purpose} />
				<FormGroup className="mb-2 mb-sm-0 outer-form-group flex-grow-1 m-0 pr-md-3 text-left mx-auto">
					<PropControl
						className="newsletter-email"
						prop="email"
						label="YOUR EMAIL"
						path={ctaFormPath}
						placeholder="yourname@youremail.com"
					/>
				</FormGroup>
				{purpose!==PURPOSES.email_mailing_list 
					&& <PropControl className="text-left" type="checkbox" path={ctaFormPath} label="Subscribe to our good news mailing list and get feel-good news delivered to your inbox :)" prop="purpose2" value={PURPOSES.email_mailing_list} />
				}
				<Button onClick={doEmailSignUp} color="secondary" disabled={ ! formData.email || hasSubmittedEmail} className="flex-grow-0 email-submit mt-3">
					{buttonText}
				</Button>				
			</Form>);
};

export default SubscriptionBox;
