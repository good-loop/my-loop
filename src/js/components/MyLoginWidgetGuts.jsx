import React from 'react';
import { EmailSignin } from '../base/components/LoginWidget';

export const MyLoginWidgetGuts = ({services, verb, onLogin, onRegister, noRegister}) => {
	if (!verb) verb = DataStore.getValue(VERB_PATH) || 'login';
	return (
		<div className="login-guts container-fluid">
			<div className='d-flex flex-column justify-content-center align-items-center'>
				<img src="/img/gl-logo/TabsForGood/TabsForGood_Logo-01.png" className='login-logo'/>
				<h4 className='black login-subtitle'>Sign in to see how your web browsing has transformed into charity donations</h4>
				<Row>
					<Col className="login-email pb-2">
						<EmailSignin
							verb={verb}
							onLogin={onLogin}
							onRegister={onRegister}
							noRegister={noRegister}
						/>
					</Col>
					{/* Removed for now - no design for social services
					yessy(services) && <Col className="login-social">
						<SocialSignin verb={verb} services={services} />
					</Col>
					*/}
				</Row>
			</div>
		</div>
	);
};