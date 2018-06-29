import Enum from 'easy-enums';
import Roles from './base/Roles';
import C from './base/CBase';

export default C;

/**
 * app config
 */
C.app = {
	name: "the My-Loop Portal",
	service: "good-loop",
	logo: "/img/logo.png",
	facebookAppId: "320927325010346", // https://developers.facebook.com/apps/320927325010346/dashboard/
	privacyPolicy: "",
	tsncs: "",
};

// NB: MonetaryAmount is deprecated - left here for old data
C.TYPES = new Enum("Charity Variants Global Publisher NGO Advert Advertiser Budget Bid User Person Money MonetaryAmount");

C.ROLES = new Enum("user admin");
C.CAN = new Enum("view edit admin sudo");
// setup roles
Roles.defineRole(C.ROLES.user, [C.CAN.view]);
Roles.defineRole(C.ROLES.admin, C.CAN.values);
