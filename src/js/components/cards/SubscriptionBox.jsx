import React from 'react';
import { Container, Button, Form, FormGroup, Label} from 'reactstrap';
import {space, stopEvent, yessy} from '../../base/utils/miscutils';

import DataStore from '../../base/plumbing/DataStore';
import PropControl from '../../base/components/PropControl';
import { doRegisterEmail } from '../../base/data/Person';


const ctaFormPath = ['misc', 'ctaForm'];

const doEmailSignUp = e => {
	stopEvent(e);
	const formData = DataStore.getValue(ctaFormPath);
	if ( ! formData || ! formData.email) return; // quiet fail NB: we didnt like the disabled look for a CTA
	formData.notify = 'daniel@good-loop.com'; // HACK
	doRegisterEmail(formData);
	DataStore.setValue(['misc', 'hasSubmittedEmail'], true);
};

/**
 * Displays email register form
 * @param {String} title header to give the box 
 */
const SubscriptionBox = ({className, title}) => {
	const hasSubmittedEmail = DataStore.getValue(['misc', 'hasSubmittedEmail']) === true;
	const thankYouMessage = <><h4>Thank you!</h4><p>We'll email you shortly :)</p></>;
	return (<div className={space("flex-column align-items-center justify-content-center subscription-box", className)}>
		{title ? <><h1>{title}</h1>
			<br/><br/></> : null}
		{hasSubmittedEmail ? thankYouMessage :
			<Container>
				<Form inline className="flex-row align-items-stretch justify-content-center m-auto" onSubmit={doEmailSignUp}>
					<FormGroup className="mb-2 mr-sm-2 mb-sm-0 outer-form-group flex-grow-1 m-0 pr-md-3">
						<PropControl
							className="email-join-input w-100 h-100"
							prop="email"
							path={ctaFormPath}
							placeholder="Type your email address"
						/>
					</FormGroup>
					<div className="mobile-break"/>
					<Button color="info" disabled={hasSubmittedEmail} className="flex-grow-0">
						Sign me up
					</Button>
				</Form>
			</Container>}
	</div>);
};

export default SubscriptionBox;
