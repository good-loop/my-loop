/**
 * A refactor could probably remove much of the logic here.
 */
import React, { useEffect, useState } from 'react';
import { Button, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Row, UncontrolledDropdown } from 'reactstrap';

import KStatus from '../../../base/data/KStatus';
import DataStore, { getUrlValue } from '../../../base/plumbing/DataStore';
import { nonce } from '../../../base/data/DataClass';
import { getDataItem, getDataList } from '../../../base/plumbing/Crud';
import { getPeriodQuarter, getPeriodMonth, periodToParams, printPeriod, getPeriodFromUrlParams, getTimeZone, getTimeZoneShortName, setTimeZone } from '../../../base/utils/date-utils';

import DateRangeWidget from '../../DateRangeWidget';
import { modifyPage } from '../../../base/plumbing/glrouter';
import { isTester } from '../../../base/Roles';
import SearchQuery from '../../../base/searchquery';
import PropControl from '../../../base/components/PropControl';
import Logo from '../../../base/components/Logo';
import C, { urlParamForType } from '../../../C';
import PropControlDate from '../../../base/components/propcontrols/PropControlDate';
import PropControlPeriod from '../../../base/components/propcontrols/PropControlPeriod';
import { equals, setUrlParameter } from '../../../base/utils/miscutils';

/** Tick mark which appears in drop-downs next to currently selected option */
const selectedMarker = <span className='selected-marker' />;

/** All the URL parameters that pertain to the dashboard filters */
const allFilterParams = ['period', 'start', 'end', 'tz', 'agency', 'brand', 'campaign', 'tag'];

/** For the given URL params, what filter mode should the user be in? */
const defaultFilterType = ({ agency, brand, campaign, tag }) => {
	if (agency && agency !== 'all') return C.TYPES.Agency;
	if (brand && brand !== 'all') return C.TYPES.Advertiser;
	if (campaign && campaign !== 'all') return C.TYPES.Campaign;
	if (tag && tag !== 'all') return C.TYPES.GreenTag;
};

/** Extract the time period filter from URL params if present - if not, apply "current quarter" by default */
const initPeriod = () => {
	let period = getPeriodFromUrlParams();
	if ( ! period) {
		period = getPeriodQuarter();
		modifyPage(null, { period: period.name, start: period.start, end: period.end });
	}
	// default to UTC timezone
	if ( ! getUrlValue("tz")) {
		setTimeZone("UTC");
		modifyPage(null, { tz:"UTC" });
	}
	return period;
};

/** The filter-by-entity list can get very long esp for devs/testers - manage its size */
const longMenuStyle = {
	maxHeight: '75vh', // with long lists this gets clipped by the footer
	overflowY: 'auto', // Add scrollbars as needed
};

/** Regular expressions for extracting IDs of items directly shared with the user */
const shareRegexes = {
	[C.TYPES.Agency]: /^Agency:(\w+)/,
	[C.TYPES.Advertiser]: /^Advertiser:(\w+)/,
	[C.TYPES.Campaign]: /^Campaign:(\w+)/,
	[C.TYPES.GreenTag]: /^Tag:(\w+)/,
};

/** What property should we use to construct a search query for e.g. "tags whose agency is J0zxYqk"? */
const queryProps = {
	[C.TYPES.Agency]: 'agencyId',
	[C.TYPES.Advertiser]: 'vertiser',
	[C.TYPES.Campaign]: 'campaign',
};

/** Sort a list of data-items by name, or by ID if unavailable*/
const sortDataItems = (list) => list.sort((a, b) => (a.name || a.id || '').localeCompare(b.name || b.id || ''));

/** Get IDs of all items of [type] shared with the logged-in user
 * 
 * Does PropControlDataItem do this?? Would switching to that be cleaner??
 */
const sharesOfType = async (type) => {
	const { cargo: shareList } = await Login.getSharedWith(Login.getId());
	if (!shareList) return;
	return shareList
		.map(({ item }) => {
			const match = item.match(shareRegexes[type]);
			return match ? match[1] : null;
		})
		.filter((a) => !!a);
};

/** Merge a batch of additional items into the current filter-by-item list */
const mergeHits = (hits, setFilterItems) =>
	setFilterItems((prevItems) => {
		const nextItems = [...prevItems];
		hits.forEach((hit) => {
			if (!nextItems.find((item) => item.id === hit.id)) nextItems.push(hit);
		});
		return sortDataItems(nextItems);
	});

/**
 * ??Does this duplicate server-side work done by CrudServlet.doList2_securityFilter2_filterByShares()?
 * Does PropControlDataItem do this?? Would switching to that be cleaner??
 * 
 * Fetch all items of [type] which are implicitly shared with the user under items of [shareType]
 * (for instance - if a campaign is explicitly shared, the user should see all campaigns under it)
 */
const getMergeImplicitShares = async ({ shareType, type, setFilterItems }) => {
	const shareIds = await sharesOfType(shareType);
	if (!shareIds || !shareIds.length) return; // Don't make an unbounded list request!

	const q = SearchQuery.setPropOr(null, queryProps[shareType], shareIds).query;

	const { hits } = await getDataList({ type, status: KStatus.PUBLISHED, q }).promise;
	mergeHits(hits, setFilterItems);
};

/**
 * ??Does this duplicate server-side work done by CrudServlet.doList2_securityFilter2_filterByShares()?
 * Does PropControlDataItem do this?? Would switching to that be cleaner??
 * 
 * Fetch all items of a type that are explicitly (eg "Campaign: J0zxYqk") shared with a user */
const getMergeDirectShares = async ({ type, setFilterItems }) => {
	const ids = await sharesOfType(type);
	if (!ids || !ids.length) return; // Don't make an unbounded list request!

	const { hits } = await getDataList({ type, status: KStatus.PUBLISHED, ids }).promise;
	mergeHits(hits, setFilterItems);
};

/** What agencies/brands/campaigns/tags are available for the user to filter on? 
 * Does PropControlDataItem do this?? Would switching to that be cleaner??
 * 
*/
const getFilterItems = async ({ type, filterMode, setFilterItems }) => {
	assert( ! filterMode, "use type");
	// Special behaviour for Good-Loop staff: load all items of type, unfiltered
	if (isTester()) {
		const { hits } = await getDataList({ type, status: KStatus.PUBLISHED }).promise;
		setFilterItems(sortDataItems(hits));
		return; // Nothing else to do!
	}

	// We'll be merging results from multiple fetches, so start with a clean list
	setFilterItems([]);

	// What items of the current filter-type are directly shared with the user?
	getMergeDirectShares({ type, setFilterItems });

	// What items are implicitly shared, e.g. brands under an agency the user can access?
	if (type === C.TYPES.Agency) return;
	// Brand, campaign, tag can be implicitly shared under an agency
	getMergeImplicitShares({ shareType: C.TYPES.Agency, type, setFilterItems });
	if (type === C.TYPES.Advertiser) return;
	// Campaign & tag can be implicitly shared under a brand
	getMergeImplicitShares({ shareType: C.TYPES.Advertiser, type, setFilterItems });
	if (type ===  C.TYPES.Campaign) return;
	// Tag can be implicitly shared under a campaign
	getMergeImplicitShares({ shareType: C.TYPES.Campaign, type, setFilterItems });
};

/** What time period and agency/brand/campaign/tag are currently in focus?
 *
 * This is set/stored in the url (so links can be shared)
 *
 * Refactor to use PropControlDataItem??
 */
const GreenDashboardFilters = ({ pseudoUser }) => {
	const urlValues = DataStore.getValue('location','params');
	let periodObj = initPeriod();
	const [filters, _setFilters] = useState(Object.assign({}, urlValues));
	const [filterType, setFilterType] = useState(defaultFilterType({ brand, agency, campaign, tag }));
	const {period,start,end,tz,brand,campaign,tag,agency} = filters;
	
	let filtersChanged = JSON.stringify(filters) !== JSON.stringify(urlValues);
	console.warn(filtersChanged, JSON.stringify(filters), JSON.stringify(urlValues));
	const setPeriodFilters = (period) => {
		filters.start = period.start;
		filters.end = period.end;
		filters.period = period.name;
	}

	// Update this to signal that the new filter values should be applied (see useEffect below)
	const [dummy, setDummy] = useState(false);
	const doCommit = () => setDummy(nonce());

	// On signal - Write updated filter spec back to URL parameters
	useEffect(() => {
		if (!dummy) return;
		// Remove all URL params pertaining to green dashboard, and re-add the ones we want.
		const { params } = DataStore.getValue('location');
		const paramsOld = { ...params };
		const paramsNew = { ...params };
		// remove incumbents (so falsy can be put in place)
		allFilterParams.forEach((p) => {
			delete paramsNew[p];
		});
		let filterTypeParam = urlParamForType(filterType);
		paramsNew[filterTypeParam] = { brand, agency, campaign, tag }[filterTypeParam]
		let pparams = periodToParams(period)
		console.warn(pparams, period);
		Object.assign(paramsNew, pparams);
		paramsNew.tz = paramsOld.tz; // the timezone control modifies the url already, as part of modifying timezone logic
		paramsNew.emode = paramsOld.emode || 'total';
		// modify the url
		modifyPage(
			null,
			paramsNew,			
			false,
			true // clear other params -- do we want this??
		);
	}, [dummy]);

	// Items to populate the filter-by-[agency, brand, campaign, tag] dropdown
	const [filterItems, setFilterItems] = useState([]);

	// Populate the filter-by-item dropdown based on user shares & access level
	useEffect(() => {
		if (filterType) getFilterItems({type: filterType, setFilterItems });
	}, [Login.getId(), filterType]);

	// TODO "Normal" access control:
	// - Advertisers & Campaigns will be shared with contacts
	// - Admin users get an email entry control to "act as" contacts
	// - When acting as non-admin, their available brands & campaigns populate dropdowns

	const periodLabel = `Timeframe: ${period.name ? printPeriod(period, true) : 'Custom'} (${getTimeZoneShortName()})`;

	// label and logo
	let tagItem = (tag && filterType === C.TYPES.GreenTag) ? getDataItem({ type: C.TYPES.GreenTag, id: tag, status: KStatus.PUB_OR_DRAFT }).value : null;
	let campaignItem = (campaign && filterType === C.TYPES.Campaign) ? getDataItem({ type: C.TYPES.Campaign, id: campaign, status: KStatus.PUBLISHED }).value : null;
	
	// if tag or campaign exist, also grab the brand item as we'll need it for the logo
	let brandItem =
		((brand && filterType === C.TYPES.Advertiser) || (campaignItem && campaignItem.vertiser) || (tagItem && tagItem.vertiser)) 
			? getDataItem({ type: C.TYPES.Advertiser, id: ((campaignItem && campaignItem.vertiser) || (tagItem && tagItem.vertiser) || brand), status: KStatus.PUBLISHED }).value
			: null;

	let agencyItem =
		(agency || (campaignItem && campaignItem.agencyId))
			? getDataItem({ type: C.TYPES.Agency, id: agency || campaignItem.agencyId, status: KStatus.PUBLISHED }).value
			: null;

	let filterItemLabel = {
		Agency: agencyItem?.name || agency,
		Advertiser: brandItem?.name || brand,
		Campaign: campaignItem?.name || campaign,
		GreenTag: tagItem?.name || tag,
	}[filterType];
	if (!filterItemLabel) {
		filterItemLabel = `Select a${filterType?.match(/^[aieou]/i) ? 'n' : ''} ${filterType}`;
	}

	let itemLogo = (filterType == C.TYPES.Agency) ? agencyItem : brandItem;

	const setFilterItem = id => {
		filters[urlParamForType(filterType)] = id;
		DataStore.update();
	};

	return (
		<Row className='greendash-filters my-2'>
			<Col xs='12'>
				<div className='d-flex'>
					<Form inline>
						<Logo className='mr-2' style={{ width: 'auto', maxWidth: '8em' }} item={itemLogo}/>
						<>
							{/* ??Seeing layout bugs that can block use -- refactoring to use a PropControl might be best*/}
							<UncontrolledDropdown className='filter-dropdown'>
								<DropdownToggle className='pl-0' caret>
									{periodLabel}
								</DropdownToggle>
								<DropdownMenu>
									<DropdownItem divider />
									<DateRangeWidget dflt={periodObj} onChange={setPeriodFilters} />
									<PropControlPeriod dflt={periodObj} saveFn={setPeriodFilters} />
								</DropdownMenu>
							</UncontrolledDropdown>

							{!pseudoUser && <UncontrolledDropdown className='filter-dropdown ml-2'>
								<DropdownToggle caret>Filter by: {urlParamForType(filterType) || ''}</DropdownToggle>
								<DropdownMenu>
									{'Agency Advertiser Campaign GreenTag'.split(" ").map((m, i) => (
										<DropdownItem key={i} onClick={() => setFilterType(m)}>
											{m === filterType ? selectedMarker : null} {urlParamForType(m)}
										</DropdownItem>
									))}
								</DropdownMenu>
							</UncontrolledDropdown>}

							{filterType && !pseudoUser && (
								<UncontrolledDropdown className='filter-dropdown ml-2'>
									<DropdownToggle caret>{filterItemLabel}</DropdownToggle>
									<DropdownMenu style={longMenuStyle}>
										{filterItems.map((item, i) => (
											<DropdownItem key={i} onClick={() => setFilterItem(item.id)}>
												{{ campaign, brand, agency, tag }[urlParamForType(filterType)] === item.id ? selectedMarker : null}
												{item.name}
											</DropdownItem>
										))}
									</DropdownMenu>
								</UncontrolledDropdown>
							)}

							{filtersChanged && 
								<Button color='primary' className='ml-2' onClick={doCommit} size='sm'>
									Apply new filters
								</Button>
								}
						</>
					</Form>
				</div>
			</Col>
		</Row>
	);
};

export default GreenDashboardFilters;
