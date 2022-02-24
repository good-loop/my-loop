import React from 'react';
import { Row, Col, Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { EmailSignin, setShowLogin, VERB_PATH } from '../base/components/LoginWidget';
import DataStore from '../base/plumbing/DataStore';
import { isMobile } from '../base/utils/miscutils';
import { T4GSignUpLink } from './T4GSignUp';

export const MyLoginWidgetGuts = ({services, verb, onLogin, onRegister, canRegister}) => {
	if (!verb) verb = DataStore.getValue(VERB_PATH) || 'login';

	// let rowClass = isMobile == true ? "w-100" : 'w-50'
	return (
		<div className="login-guts container-fluid position-relative">
			<div className='d-flex flex-column justify-content-center align-items-center p-5'>
				<img src="/img/green/hummingbird.png" className='hummingbird login'/>
				<img src="/img/signup/hand-globe-coins.png" className='hand-globe d-none d-md-block'/>
				<img src="/img/gl-logo/TabsForGood/TabsForGood_Logo-01.png" className='login-logo'/>
				<p className='leader-text black login-subtitle my-4'>Sign in to see how your web browsing has transformed into charity donations</p>
				<Row className="login-row">
					<Col className="login-email pb-2">
						<EmailSignin
							verb={verb}
							onLogin={onLogin}
							onRegister={onRegister}
							canRegister={canRegister}
							className="myloop-email-login"
						/>
					</Col>
					{/* Removed for now - no design for social services
					yessy(services) && <Col className="login-social">
						<SocialSignin verb={verb} services={services} />
					</Col>
					*/}
				</Row>
				<T4GSignUpLink onClick={() => setShowLogin(false)} className="mt-5">Not got an account? Sign up and get Tabs-for-Good</T4GSignUpLink>
			</div>
		</div>
	);
};