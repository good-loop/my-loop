import Enum from 'easy-enums';
import { defineRole } from './base/Roles';
import C from './base/CBase';
import GLAppManifest from '../../GLAppManifest';

export default C;

/**
 * app config NOW DONE IN GLAppManifest.js
 */
C.app = GLAppManifest;

// NB: MonetaryAmount is deprecated - left here for old data
C.TYPES = new Enum("Publisher NGO Advert Campaign Advertiser Agency User Person Money MonetaryAmount");

C.ROLES = new Enum("user admin marketing");
C.CAN = new Enum("view edit admin sudo viewmarketingreports");
// setup roles
defineRole(C.ROLES.user, [C.CAN.view]);
defineRole(C.ROLES.admin, C.CAN.values);
