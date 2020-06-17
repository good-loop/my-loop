import PortalSelectors from './PortalSelectors';
import AdServerSelectors from './AdServerSelectors';
import SoGiveSelectors from './SoGiveSelectors';
import MyLoopSelectors from './MyLoopSelectors';
import DemoPageSelectors from './DemoPageSelectors';

// Selectors that are used across all platfroms are written directly in SelectorsMaster
const CommonSelectors = {
	logIn: '.login-link',
	logInEmail: '#loginByEmail input[name="email"]',
	logInPassword: '#loginByEmail input[name="password"]',
	Save: '.SavePublishDiscard button[name="save"]',
	SaveAs: '.SavePublishDiscard button[name="save-as"]',
	Publish: '.SavePublishDiscard button[name="publish"]',
	DiscardEdits: '.SavePublishDiscard button[name="discard-edits"]',
	Unpublish: '.SavePublishDiscard button[name="unpublish"]',
	Delete: '.SavePublishDiscard button[name="delete"]',
	facebookLogin: '.social-signin .facebook',
	twitterLogin: '.social-signin .twitter'
};

const FacebookSelectors = {
	username: '#email',
	password: '#pass',
	login: '#loginbutton input',
	continue: '#u_0_4 > div._58xh._1flz > div._1fl- > div._2mgi._4k6n > button'
};

const TwitterSelectors = {
	apiUsername: '#username_or_email',
	apiPassword: '#password',
	apiLogin: '#allow',
	username: 'fieldset > div:nth-child(2) > input',
	password: 'div:nth-child(3) > input',
	login: 'div.clearfix > button'
};

module.exports = {
	AdServerSelectors,
	CommonSelectors,
	FacebookSelectors,
	PortalSelectors,
	SoGiveSelectors,
	TwitterSelectors,
	MyLoopSelectors,
	DemoPageSelectors
};