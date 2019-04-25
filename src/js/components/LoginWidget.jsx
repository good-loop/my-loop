import React from 'react';

import DataStore from '../base/plumbing/DataStore';
import LoginWidget, {EmailSignin, SocialSignin, VERB_PATH} from '../base/components/LoginWidget';
import ConsentWidget, {saveAllPerms} from './ConsentWidget';

const LoginWidgetGuts = ({services, verb, onLogin}) => {
	if (!verb) verb = DataStore.getValue(VERB_PATH) || 'login';
	return (
		<div className="login-guts container-fluid">
			<div className="login-divs row">
				<div className="login-email col-sm-6">
					<EmailSignin
						verb={verb}
						onLogin={onLogin}
						onRegister={saveAllPerms}
					/>
				</div>
				<div className="login-social col-sm-6">
					<SocialSignin verb={verb} services={services} />
				</div>
			</div>
			<div className='row'>
				{
					verb === 'register'
						? <ConsentWidget xids={DataStore.getValue(['data', 'Person', 'xids'])} />
						: <span className='pull-right'> Manage your data preferences <a href='/#account'> here </a> </span>
				}
			</div>

		</div>
	);
};

const MyLoopLoginWidget = props => <LoginWidget {...props} render={LoginWidgetGuts} />;

// Feel like there should be a better way of doing this
MyLoopLoginWidget.show = LoginWidget.show;
MyLoopLoginWidget.hide = LoginWidget.hide;
MyLoopLoginWidget.changeVerb = LoginWidget.changeVerb;
MyLoopLoginWidget.emailLogin = LoginWidget.emailLogin;

export default MyLoopLoginWidget;
