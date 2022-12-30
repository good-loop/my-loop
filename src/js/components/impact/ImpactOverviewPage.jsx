
import React, { useEffect } from 'react';
import KStatus from '../../base/data/KStatus';
import List from '../../base/data/List';
import I18N from '../../base/i18n';
import PromiseValue from '../../base/promise-value';
import { getDataItem, getDataList, setWindowTitle } from '../../base/plumbing/Crud';
import C from '../../C';
import DataStore from '../../base/plumbing/DataStore';
import SearchQuery from '../../base/searchquery';
import PropControlDataItem from '../../base/components/PropControlDataItem';
import { Button, Col, Container, InputGroup, Row } from 'reactstrap';
import PropControl from '../../base/components/PropControl';
import Circle from '../../base/components/Circle';
import { Card } from '../../base/components/CardAccordion';
import BG from '../../base/components/BG';
import Misc from '../../MiscOverrides';
import { getLogo, space, stopEvent, uniq } from '../../base/utils/miscutils';
import Branding from '../../base/data/Branding';
import Impact from '../../base/data/Impact';
import Money from '../../base/data/Money';
import { OTHER_CONSENT } from '../../base/data/Claim';
import { modifyPage } from '../../base/plumbing/glrouter';
import { getId, getType } from '../../base/data/DataClass';
import DynImg from '../../base/components/DynImg';
import PortalLink from '../../base/components/PortalLink';
import Roles from '../../base/Roles';
import ServerIO from '../../plumbing/ServerIO';
import Campaign from '../../base/data/Campaign';
import { setNavProps } from '../../base/components/NavBar';


export class ImpactFilters {
	agency;
	brand;
	brand2;
	campaign;
	cid;
	/** charity ID */
	ngo;
	impactdebit;
	start;
	end;
	status;
	q;
}

const ImpactOverviewPage = () => {
	/** @type {ImpactFilters} */
	let filters = DataStore.getValue('location', 'params');

	// fetch items
	let {focusItem, brand1, brand2, agency, charity, campaign} = fetchImpactItems(filters);

	setNavProps(focusItem);
	let windowTitle = space("Impact Hub", focusItem && "for "+focusItem.name);
	setWindowTitle(windowTitle);

	return <Container>
		<FilterBar filters={filters} />
		<Row>
			<Col>
				<Card style={{ background: "#3488AB" }}><HeadlineDonationCard brand={focusItem} filters={filters} /></Card>
				<Card style={{}}><PhotoWall filters={filters} /></Card>
			</Col>
			<Col>
				<Card><CampaignCountCard filters={filters} /></Card>

				<Card><CharityCountCard filters={filters} /></Card>
			</Col>
		</Row>
		{/* <Card><ViewCountCard filters={filters} /></Card>
		<Card><LogoWallCard brand={brand} filters={filters} /></Card> */}
	</Container>;
};


/* ------- Data Functions --------- */

export const fetchImpactItems = filters => {
	if (!filters.status) filters.status = KStatus.PUBLISHED;

	let pvBrand = filters.brand ? getDataItem({ type: C.TYPES.Advertiser, id: filters.brand, status, swallow: true }) : {};
	let pvBrand2 = filters.brand2 ? getDataItem({ type: C.TYPES.Advertiser, id: filters.brand2, status, swallow: true }) : {};
	let pvAgency = filters.agency ? getDataItem({ type: C.TYPES.Agency, id: filters.agency, status, swallow: true }) : {};
	let pvCampaign = filters.campaign ? getDataItem({ type: C.TYPES.Campaign, id: filters.campaign, status, swallow: true }) : {};
	let pvCharity = filters.cid ? getDataItem({ type: C.TYPES.NGO, id: filters.cid, status, swallow: true }) : {};
	let brandId = filters.brand2 || filters.brand;
	let brand1 = pvBrand.value;
	let brand2 = pvBrand2.value;    
	let agency = pvAgency.value;
	let charity = pvCharity.value;
	let campaign = pvCampaign.value;
	// prefer the child brand, brand, agency, charity
	let focusItem;
	if (filters.brand2) focusItem = brand2;
	else if (filters.brand) focusItem = brand1;
	else if (filters.agency) focusItem = agency;
	else if (filters.cid) focusItem = charity; 
	else if (filters.campaign) focusItem = campaign; 

	// HACK - poke q onto the filters
	let sq = SearchQuery.setProp(null, "vertiser", brandId);
	sq = SearchQuery.setProp(sq, "campaign", filters.campaign);
	sq = SearchQuery.setProp(sq, "agencyId", filters.agency);
	sq = SearchQuery.setProp(sq, "impact.charity", filters.cid);
	filters.q = sq.query;
	return {focusItem, brand1, brand2, agency, charity, campaign};
};

/**
 * TODO this relies on Portal making ImpactDebit objects. Which it doesn't yet.
 * See CampaignServlet
 * @param {Object} p
 * @param {ImpactFilters} p.filters
 * @returns {PromiseValue} List hits:ImpactDebit[]
 */
export const getImpactDebits = ({ filters }) => {
	let pvImpactDebits = getDataList({ type: C.TYPES.ImpactDebit, ...filters, swallow: true });
	// console.log("pvImpactDebits", pvImpactDebits);
	return pvImpactDebits;
};

/**
 * @param {Object} p
 * @param {ImpactFilters} p.filters
 * @returns {PromiseValue} List hits:Campaign[] Does not include master campaigns
 */
const getCampaigns = ({ filters }) => {
	let q = filters.q;
	q = space(q, "-master:true"); // no master campaigns (master=false or unset)
	let pvCampaigns = getDataList({ type: C.TYPES.Campaign, q, start:filters.start, end:filters.end, status:filters.status, swallow: true });
	// console.log("pvCampaigns", pvCampaigns);
	return pvCampaigns;
};

const getCharities = ({ filters }) => {
	// get the ImpactDebits
	let pvItems0 = getImpactDebits({ filters });
	// ...then get the charities
	let pvCharities = PromiseValue.then(pvItems0, item0s => {
		let cids = List.hits(item0s).map(i0 => i0.impact?.charity).filter(x => x);
		if (!cids.length) {
			return new List();
		}
		const pv2 = getDataList({ type: "NGO", status: filters.status, ids: cids, swallow: true });
		return pv2;
	});
	// console.group("pvCharities", pvCharities);
	return pvCharities;
}

/* ------- End of Data Functions --------- */


/* ------- Components --------- */

const CampaignCountCard = ({ filters }) => {
	let pvItems = getCampaigns({ filters });
	if (!pvItems.value) return <Nope />;
	let n = List.total(pvItems.value);
	return <>
		<h3>{I18N.tr(n + " Campaign(s)")}</h3>
		{n < 20 && <div>{List.hits(pvItems.value).map(item => <ItemButton key={item.id} item={item}/>)}</div>}
	</>;
}

const CharityCountCard = ({ filters }) => {
	let pvItems = getCharities({ filters });
	if (!pvItems.value) return <Nope />;
	let n = List.total(pvItems.value);
	return <>
		<h3>{I18N.tr(n + " Charities (singular: Charity)")}</h3>
		{n < 20 && <div className="gridbox gridbox-sm-2">{List.hits(pvItems.value).map(item => <ItemButton key={item.id} item={item} />)}</div>}
	</>;
}

const ItemButton = ({ item }) => {
	let key = getType(item).toLowerCase(); // e.g. advertiser or ngo
	let value = getId(item);
	let logo = getLogo(item);
	// NB: tried putting dev-only PortalLinks here but it was fugly
	return <Button className="btn-tile m-2" color="outline-dark"
		onClick={e => stopEvent(e) && modifyPage(["istory"], { [key]: value })} >
		{logo && <img src={logo} className={space('rounded logo logo-lg')} />}<p>{item.name}</p>
	</Button>;
};

const ViewCountCard = ({ filters }) => {
	return "?? Views";
}

const LogoWallCard = ({ filters }) => {
	return "?? logos";
}

export const HeadlineDonationCard = ({ brand, impactdebit, charity, filters }) => {
	if (!brand) {
		return <Misc.Loading />
	}
	let logo = getLogo(brand);
	if (!logo) {
		logo = getLogo(impactdebit);
	}
	if (!logo && charity) {
		logo = getLogo(charity);
		if (!logo) {
			let images = NGO.images(charity);
			logo = images[0];
		}
	}
	let branding = Branding.get(brand);
	let image = branding?.backgroundImage || impactdebit?.impact?.img || "/img/ihub/world-hand.png";

	let pvImpactDebits = getImpactDebits({ filters });
	let moneys = pvImpactDebits.value && List.hits(pvImpactDebits.value).map(item => Impact.amount(item.impact)).filter(x => x);
	let totalMoney = moneys && Money.total(moneys, "GBP");

	return (<BG style={{ height: '30vh', width: '30vh', margin: "auto" }} image={image} color="#3488AB" >
		<Circle color="white" width="100%" height="100%" center>
			{logo ? <img className="logo logo-xl center m-auto" src={logo} /> : <h3>{brand?.name}</h3>}
			<h2 style={{ textAlign: "center" }}>{totalMoney && <Misc.Money amount={totalMoney} />} Donated</h2>
			<PortalLink item={brand} size="small" devOnly />
		</Circle>
	</BG>);
};

/**
 * Filter display / controls at the top of the page
 */
export const FilterBar = ({ filters }) => {
	let pvChildBrands, childBrands;
	if (filters.brand) {
		let q = SearchQuery.setProp(null, "parentId", filters.brand).query;
		pvChildBrands = getDataList({ type: "Advertiser", status: filters.status, q, swallow: true });
		childBrands = List.hits(pvChildBrands?.value);
	}
	return <div id="filterBar">
		<PropControl type="DataItem" itemType={C.TYPES.Advertiser} prop="brand" label showId={false} />
		{childBrands && childBrands.length ? <PropControl type="DataItem" itemType={C.TYPES.Advertiser} prop="brand2" label="Brand" list={childBrands} /> : null}
	</div>;
}

const PhotoWall = ({ filters }) => {
	let pvImpactDebits = getImpactDebits({ filters });
	if (!pvImpactDebits.resolved) return <Misc.Loading />
	let impactdebits = List.hits(pvImpactDebits.value);
	let images = impactdebits.map(i => i.impact?.img).filter(x => x);
	images = images.slice(0, 3);
	return images.map(img => <DynImg key={img.contentUrl || img} image={img} className="w-100" />);
};

const Nope = () => <>-</>;

export default ImpactOverviewPage;
