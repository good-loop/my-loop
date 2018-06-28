import Enum from 'easy-enums';
import Roles from './base/Roles';
import C from './base/CBase';

export default C;

/**
 * app config
 */
C.app = {
	name: "the My-Loop Portal",
	service: "goodloop",
	logo: "/img/logo.png",
	facebookAppId: "320927325010346"
};

// NB: MonetaryAmount is deprecated - left here for old data
C.TYPES = new Enum("Charity Variants Global Publisher NGO Advert Advertiser Budget Bid User Person Money MonetaryAmount");

C.ROLES = new Enum("user admin");
C.CAN = new Enum("view edit admin sudo");
// setup roles
Roles.defineRole(C.ROLES.user, [C.CAN.view]);
Roles.defineRole(C.ROLES.admin, C.CAN.values);
