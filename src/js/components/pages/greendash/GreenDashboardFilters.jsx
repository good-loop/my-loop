import React, { useEffect, useState } from 'react';
import { Button, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Row, UncontrolledDropdown } from 'reactstrap';

import KStatus from '../../../base/data/KStatus';
import DataStore from '../../../base/plumbing/DataStore';
import { nonce } from '../../../base/data/DataClass';
import { getDataItem, getDataList } from '../../../base/plumbing/Crud';
import { getPeriodQuarter, getPeriodMonth, periodToParams, printPeriod, getPeriodFromUrlParams } from '../../../base/utils/date-utils';

import DateRangeWidget from '../../DateRangeWidget';
import { modifyPage } from '../../../base/plumbing/glrouter';
import { isTester } from '../../../base/Roles';
import SearchQuery from '../../../base/searchquery';
import PropControl from '../../../base/components/PropControl';
import Logo from '../../../base/components/Logo';
import C from '../../../C';

/** Tick mark which appears in drop-downs next to currently selected option */
const selectedMarker = <span className='selected-marker' />;

/** All the URL parameters that pertain to the dashboard filters */
const allFilterParams = ['period', 'start', 'end', 'agency', 'brand', 'campaign', 'tag'];

/** Generate the list of quarter-period shortcuts */
const QuarterButtons = ({ period, setNamedPeriod }) => {
	const dateCursor = new Date();
	dateCursor.setHours(0, 0, 0, 0);
	dateCursor.setDate(1); // avoid month-length problems

	// Starting from now & stepping back 3 months at a time
	const buttons = [];
	for (let i = 0; i < 4; i++) {
		const q = getPeriodQuarter(null, dateCursor);
		buttons.push(
			<DropdownItem onClick={() => setNamedPeriod(q.name)} key={q.name}>
				{period.name === q.name ? selectedMarker : null} {printPeriod(q)}
			</DropdownItem>
		);
		dateCursor.setMonth(dateCursor.getMonth() - 3);
	}
	return buttons;
};

/** For the given URL params, what filter mode should the user be in? */
const defaultFilterMode = ({ agency, brand, campaign, tag }) => {
	if (agency && agency !== 'all') return 'agency';
	if (brand && brand !== 'all') return 'brand';
	if (campaign && campaign !== 'all') return 'campaign';
	if (tag && tag !== 'all') return 'tag';
};

/** Are these two period-specs the same - ie do they refer to the same quarter / month / year / custom period? */
const periodChanged = (periodA, periodB) => {
	if (periodA.name !== periodB.name) return true; // Least-surprise - consider "Q1" and "1 jan - 31 mar" different
	if (periodA.start?.getTime() !== periodB.start?.getTime()) return true;
	if (periodA.end?.getTime() !== periodB.end?.getTime()) return true;
	return false; // Unchanged!
};


/** Should we show the "Apply New Filters" button - ie have they changed? */
const filtersChanged = ({ filterMode, period, ...nextFilters }) => {
	// Time period?	
	if (periodChanged(getPeriodFromUrlParams(), period)) return true;
	// Focused item?
	let changed = false;
	let prevFilters = {};
	['agency', 'brand', 'campaign', 'tag'].every((filter) => {
		prevFilters[filter] = DataStore.getUrlValue(filter);
		if (nextFilters[filter] == null) return true;
		changed = nextFilters[filter] !== prevFilters[filter];
		return changed;
	});
	if (changed) return true;
	// Filter mode? (Will this ever return true after the block above?)
	return filterMode !== defaultFilterMode(prevFilters);
};


/** Extract the time period filter from URL params if present - if not, apply "current quarter" by default */
const initPeriod = () => {
	let period = getPeriodFromUrlParams();
	if (!period) {
		period = getPeriodQuarter();
		modifyPage(null, { period: period.name });
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

/** Type enum members corresponding to each filter mode */
const typeForMode = {
	agency: C.TYPES.Agency,
	brand: C.TYPES.Advertiser,
	campaign: C.TYPES.Campaign,
	tag: C.TYPES.GreenTag,
};

/** Sort a list of data-items by name, or by ID if unavailable*/
const sortDataItems = (list) => list.sort((a, b) => (a.name || a.id || '').localeCompare(b.name || b.id || ''));

/** Get IDs of all items of [type] shared with the logged-in user */
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
 *
 * Fetch all items of a type that are explicitly (eg "Campaign: J0zxYqk") shared with a user */
const getMergeDirectShares = async ({ type, setFilterItems }) => {
	const ids = await sharesOfType(type);
	if (!ids || !ids.length) return; // Don't make an unbounded list request!

	const { hits } = await getDataList({ type, status: KStatus.PUBLISHED, ids }).promise;
	mergeHits(hits, setFilterItems);
};

/** What agencies/brands/campaigns/tags are available for the user to filter on? */
const getFilterItems = async ({ filterMode, setFilterItems }) => {
	// For shorthand use in getDataList calls below
	const type = typeForMode[filterMode];

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
	if (filterMode === 'agency') return;
	// Brand, campaign, tag can be implicitly shared under an agency
	getMergeImplicitShares({ shareType: C.TYPES.Agency, type, setFilterItems });
	if (filterMode === 'brand') return;
	// Campaign & tag can be implicitly shared under a brand
	getMergeImplicitShares({ shareType: C.TYPES.Advertiser, type, setFilterItems });
	if (filterMode === 'campaign') return;
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
	const [period, setPeriod] = useState(initPeriod());
	const [agency, setAgency] = useState(() => DataStore.getUrlValue('agency'));
	const [brand, setBrand] = useState(() => DataStore.getUrlValue('brand'));
	const [campaign, setCampaign] = useState(() => DataStore.getUrlValue('campaign'));
	const [tag, setTag] = useState(() => DataStore.getUrlValue('tag'));

	const [filterMode, setFilterMode] = useState(defaultFilterMode({ brand, agency, campaign, tag }));
	const [showCustomRange, setShowCustomRange] = useState(!period?.name);

	const displayCustomRange = () => {
		// Don't display the All Time 1970-2999 range
		if (period.name === 'all') {
			let periodObj = getPeriodMonth();
			periodObj.name = null;
			setPeriod(periodObj);
		}
		setShowCustomRange(true);
	};

	// Update this to signal that the new filter values should be applied
	const [dummy, setDummy] = useState(false);
	const doCommit = () => setDummy(nonce());

	// On signal - Write updated filter spec back to URL parameters
	useEffect(() => {
		if (!dummy) return;
		// Remove all URL params pertaining to green dashboard, and re-add the ones we want.
		const { params } = DataStore.getValue('location');
		const paramsOld = { ...params };
		allFilterParams.forEach((p) => {
			delete params[p];
		});
		modifyPage(
			null,
			{
				[filterMode]: { brand, agency, campaign, tag }[filterMode],
				...periodToParams(period),
				emode: paramsOld.emode || 'total',
			},
			false,
			true
		);
	}, [dummy]);

	// Update the item ID to to focus on
	const setFilterItem = { agency: setAgency, brand: setBrand, campaign: setCampaign, tag: setTag }[filterMode];

	// Shorthand for a click on one of the "Xth Quarter" buttons
	const setNamedPeriod = (name) => setPeriod({ name });

	// Items to populate the filter-by-[agency, brand, campaign, tag] dropdown
	const [filterItems, setFilterItems] = useState([]);

	// Populate the filter-by-item dropdown based on user shares & access level
	useEffect(() => {
		if (filterMode) getFilterItems({ filterMode, setFilterItems });
	}, [Login.getId(), filterMode]);

	// TODO "Normal" access control:
	// - Advertisers & Campaigns will be shared with contacts
	// - Admin users get an email entry control to "act as" contacts
	// - When acting as non-admin, their available brands & campaigns populate dropdowns

	const periodLabel = `Timeframe: ${period.name ? printPeriod(period, true) : 'Custom'}`;

	// label and logo
	let tagItem = (tag && filterMode === "tag") ? getDataItem({ type: C.TYPES.GreenTag, id: tag, status: KStatus.PUB_OR_DRAFT }).value : null;
	let campaignItem = (campaign && filterMode === "campaign") ? getDataItem({ type: C.TYPES.Campaign, id: campaign, status: KStatus.PUBLISHED }).value : null;
	
	// if tag or campaign exist, also grab the brand item as we'll need it for the logo
	let brandItem =
		((brand && filterMode === "brand") || (campaignItem && campaignItem.vertiser) || (tagItem && tagItem.vertiser)) 
			? getDataItem({ type: C.TYPES.Advertiser, id: ((campaignItem && campaignItem.vertiser) || (tagItem && tagItem.vertiser) || brand), status: KStatus.PUBLISHED }).value
			: null;

	let agencyItem =
		(agency || (campaignItem && campaignItem.agencyId))
			? getDataItem({ type: C.TYPES.Agency, id: agency || campaignItem.agencyId, status: KStatus.PUBLISHED }).value
			: null;

	let filterItemLabel = {
		agency: agencyItem?.name || agency,
		brand: brandItem?.name || brand,
		campaign: campaignItem?.name || campaign,
		tag: tagItem?.name || tag,
	}[filterMode];
	if (!filterItemLabel) {
		filterItemLabel = `Select a${filterMode?.match(/^[aieou]/i) ? 'n' : ''} ${filterMode}`;
	}

	let itemLogo = (filterMode == "agency") ? agencyItem : brandItem;

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
									<QuarterButtons period={period} setNamedPeriod={setNamedPeriod} />
									<DropdownItem onClick={() => setNamedPeriod('all')}>
										All Time
										{period.name === 'all' ? selectedMarker : null}
									</DropdownItem>
									<DropdownItem toggle={false} onClick={() => displayCustomRange()}>
										Custom
										{!period.name && (period.start || period.end) ? selectedMarker : null}
									</DropdownItem>
									{showCustomRange ? (
										<>
											<DropdownItem divider />
											<DateRangeWidget dflt={period} onChange={setPeriod} />
											<DropdownItem tag='div'>
												<Button color='primary' onClick={doCommit}>
													Apply custom timeframe
												</Button>
											</DropdownItem>
										</>
									) : null}
								</DropdownMenu>
							</UncontrolledDropdown>

							{!pseudoUser && <UncontrolledDropdown className='filter-dropdown ml-2'>
								<DropdownToggle caret>Filter by: {filterMode || ''}</DropdownToggle>
								<DropdownMenu>
									{['agency', 'brand', 'campaign', 'tag'].map((m, i) => (
										<DropdownItem key={i} onClick={() => setFilterMode(m)}>
											{m === filterMode ? selectedMarker : null} {m}
										</DropdownItem>
									))}
								</DropdownMenu>
							</UncontrolledDropdown>}

							{filterMode && !pseudoUser && (
								<UncontrolledDropdown className='filter-dropdown ml-2'>
									<DropdownToggle caret>{filterItemLabel}</DropdownToggle>
									<DropdownMenu style={longMenuStyle}>
										{filterItems.map((item, i) => (
											<DropdownItem key={i} onClick={() => setFilterItem(item.id)}>
												{{ campaign, brand, agency, tag }[filterMode] === item.id ? selectedMarker : null}
												{item.name}
											</DropdownItem>
										))}
									</DropdownMenu>
								</UncontrolledDropdown>
							)}

							{filtersChanged({ period, filterMode, agency, brand, campaign, tag }) ? (
								<Button color='primary' className='ml-2' onClick={doCommit} size='sm'>
									Apply new filters
								</Button>
							) : null}
						</>
					</Form>
				</div>
			</Col>
		</Row>
	);
};

export default GreenDashboardFilters;
