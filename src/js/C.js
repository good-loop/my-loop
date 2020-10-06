import Enum from 'easy-enums';
import Roles, {defineRole} from './base/Roles';
import C from './base/CBase';

export default C;

/**
 * app config NOW DONE IN GLAppManifest.js
 */

// NB: MonetaryAmount is deprecated - left here for old data
C.TYPES = new Enum("Publisher NGO Advert Advertiser User Person Money MonetaryAmount");

C.ROLES = new Enum("user admin marketing");
C.CAN = new Enum("view edit admin sudo viewmarketingreports");
// setup roles
defineRole(C.ROLES.user, [C.CAN.view]);
defineRole(C.ROLES.admin, C.CAN.values);
