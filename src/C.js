import Enum from 'easy-enums';
import Roles from './base/Roles';
import C from './base/CBase';

export default C;

/**
 * app config
 */
C.app = {
	name: "the My-Loop Portal",
	service: "my-loop",
	logo: "/img/logo.png",
	facebookAppId: "320927325010346"
};

/**
 * Special ID for things which dont yet have an ID
 */
C.newId = 'new';

// NB: MonetaryAmount is deprecated - left here for old data
C.TYPES = new Enum("Charity Variants Global Publisher NGO Advert Advertiser Budget Bid User Money MonetaryAmount");

C.NAV = new Enum('vertiser vert pub');

/**
 * url parameters for navigation -- these match types
 */
C.navParam4type = {
	'Advertiser': C.NAV.vertiser,
	'Advert': C.NAV.vert,
	'Publisher': C.NAV.pub
};
Object.keys(C.navParam4type).forEach(k => C.TYPES.has(k));

C.ROLES = new Enum("advertiser publisher admin");
C.CAN = new Enum("edit publish admin sudo");
// setup roles
Roles.defineRole(C.ROLES.publisher, [C.CAN.publish, C.CAN.edit]);
Roles.defineRole(C.ROLES.admin, C.CAN.values);

C.emailRegex = /(.+?@[\w-]+?\.[\w-]+?)/;

/*
NOTE: We want to standardise on a-z names without punctuation.
E.g. "verticalbanner" not "vertical-banner"
TODO: And use this canonical form everywhere.
*/
C.ADSIZEINFO = {
	mediumrectangle: 'MPU aka Medium-Rectangle (300x250)', 
	leaderboard: 'Leaderboard (728x90)',
	billboard: 'Billboard (970x250)', 
	// NB: Superheader is a bit different: 900x250	
	stickyfooter: 'Large-Mobile-Banner aka Sticky-Footer (320x100)',
	mobilebanner: 'TODO Mobile-Banner (320x50)', 
	mpu2: 'TODO Double-MPU aka Half-Page (300x600)', 
	verticalbanner: 'Small Vertical Banner (120x240)'
};
