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
C.T4G = "Tabs for Good";

/**
 * Warning: also written as "£4.7 million" in places
 */
C.DONATIONS_TOTAL = "£4,700,000";

// NB: MonetaryAmount is deprecated - left here for old data
C.TYPES = new Enum("Publisher NGO Advert Campaign Advertiser Agency ImpactDebit User Person Money MonetaryAmount BlogPost ScheduledContent GreenTag");

/**
 * What parameter to use in a url?
 * This is partly an aesthetic choice, and does not always match query ES parameters.
 * @param {!string} type e.g. Advertiser
 * @returns {!string} e.g. `brand`
 */
export const urlParamForType = type => {
    if ( ! type) return;
    switch(type) {
    case "Advertiser": return "brand";
    case "GreenTag": return "tag";
    }
    return type.toLowerCase();
};

C.ROLES = new Enum("user admin marketing agency");
C.CAN = new Enum("view edit admin sudo viewmarketingreports");
// setup roles
defineRole(C.ROLES.user, [C.CAN.view]);
defineRole(C.ROLES.admin, C.CAN.values);
defineRole(C.ROLES.agency, [C.CAN.view]); // do we need this here??
