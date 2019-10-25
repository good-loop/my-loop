import Enum from 'easy-enums';
import Roles, {defineRole} from './base/Roles';
import C from './base/CBase';

export default C;

/**
 * app config
 */
C.app = {
	name: "the My-Loop Portal",
	service: "good-loop",
	logo: "/img/new-logo.svg",
	website: "https://good-loop.com",
	facebookAppId: "320927325010346", // https://developers.facebook.com/apps/320927325010346/dashboard/
	privacyPolicy: "https://doc.good-loop.com/privacy-policy.html",
	tsncs: "",
};

// NB: MonetaryAmount is deprecated - left here for old data
C.TYPES = new Enum("Publisher NGO Advert Advertiser User Person Money MonetaryAmount");

C.ROLES = new Enum("user admin marketing");
C.CAN = new Enum("view edit admin sudo viewmarketingreports");
// setup roles
defineRole(C.ROLES.user, [C.CAN.view]);
defineRole(C.ROLES.admin, C.CAN.values);
