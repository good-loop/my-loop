// import DataClass from '../base/data/DataClass';
import Money from '../base/data/Money';


class CampaignPage {} //extends DataClass {
// 	/** @type {Money} */
// 	dntn;

// 	constructor(base) {
// 		Object.assign(this, base);
// 		this['@type'] = 'CampaignPage';
// 	}
// }
// DataClass.register(CampaignPage, "CampaignPage");

/**
 * Utility hack to handle old string format
 * @param {CampaignPage} item
 * @returns {?Money}
 */
CampaignPage.donation = item => {
	if (item.dntn) return item.dntn;
	if (item.donation) {
		item.dntn = new Money(item.donation);
		return item.dntn;
	}
	return null;
};

export default CampaignPage;
