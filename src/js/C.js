import Enum from 'easy-enums';
import { defineRole } from './base/Roles';
import C from './base/CBase';
import GLAppManifest from '../../GLAppManifest';
import { A, initRouter } from './base/plumbing/glrouter';

export default C;

// HACK <a> vs <A> for optional replacement with import { A } from "hookrouter";
C.A = A;
initRouter();

/**
 * app config NOW DONE IN GLAppManifest.js
 */
C.app = GLAppManifest;

/** To help us standardise on the use or not of -s */
C.T4G = "Tabs-For-Good";

// NB: MonetaryAmount is deprecated - left here for old data
C.TYPES = new Enum("Publisher NGO Advert Campaign Advertiser Agency User Person Money MonetaryAmount");

C.ROLES = new Enum("user admin marketing");
C.CAN = new Enum("view edit admin sudo viewmarketingreports");
// setup roles
defineRole(C.ROLES.user, [C.CAN.view]);
defineRole(C.ROLES.admin, C.CAN.values);
