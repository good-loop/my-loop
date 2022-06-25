import React, { useEffect, useState } from 'react';
import { Button, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Label, Row, UncontrolledDropdown } from 'reactstrap';

import KStatus from '../../../base/data/KStatus';
import DataStore from '../../../base/plumbing/DataStore';
import { nonce } from '../../../base/data/DataClass';
import { getDataItem, getDataList } from '../../../base/plumbing/Crud';
import { getPeriodQuarter, periodFromUrl, periodToParams, printPeriod } from './dashutils';

import DateRangeWidget from '../../DateRangeWidget';
import { modifyPage } from '../../../base/plumbing/glrouter';
import { isTester } from '../../../base/Roles';
import SearchQuery from '../../../base/searchquery';
import PropControl from '../../../base/components/PropControl';
import Logo from '../../../base/components/Logo';
import C from '../../../C';


/** Generate the list of quarter-period shortcuts */
const QuarterButtons = ({ period, setNamedPeriod }) => {
	const buttons = [];
	const dateCursor = new Date();
	dateCursor.setDate(1); // avoid month-length problems
	// quarters
	for (let i = 0; i < 4; i++) {
		const q = getPeriodQuarter(dateCursor);

		buttons.push(
			<DropdownItem onClick={() => setNamedPeriod(q.name)} key={q.name}>
				{printPeriod(q)}{period.name === q.name ? <span className="selected-marker" /> : null}
			</DropdownItem>
		);
		dateCursor.setMonth(dateCursor.getMonth() - 3);
	}
	return buttons;
};


const defaultFilterMode = (brand, campaign, tag) => {
	if (brand && brand !== 'all') return 'brand';
	if (campaign && campaign !== 'all') return 'campaign';
	if (tag && tag !== 'all') return 'tag';
}


/** Are these two period-specs the same - ie do they refer to the same quarter / month / year / custom period? */
const samePeriod = (periodA, periodB) => {
	if (periodA.name && periodB.name) return periodA.name === periodB.name;
	if ((periodA.start && periodA.start.getTime()) !== (periodB.start && periodB.start.getTime())) return false;
	if ((periodA.end && periodA.end.getTime()) !== (periodB.end && periodB.end.getTime())) return false;
	return false;
}


/** Should we show the "Apply New Filters" button - ie have they changed? */
const filtersChanged = (nextPeriod, nextFilterMode, nextBrand, nextCampaign, nextTag) => {
	const currentPeriod = periodFromUrl();
	if (!samePeriod(currentPeriod, nextPeriod)) return true;
	const currentBrand = DataStore.getUrlValue('brand');
	if (currentBrand !== nextBrand) return true;
	const currentCampaign = DataStore.getUrlValue('campaign');
	if (currentCampaign !== nextCampaign) return true;
	const currentTag = DataStore.getUrlValue('tag');
	if (currentTag !== nextTag) return true;
	const currentFilterMode = defaultFilterMode(currentBrand, currentCampaign, currentTag);
	if (currentFilterMode !== nextFilterMode) return true;
	return false;
};


/** Extract the time period filter from URL params if present - if not, apply "current quarter" by default */
const initPeriod = () => {
	let period = periodFromUrl();
	if (!period) {
		period = getPeriodQuarter();
		modifyPage(null, {period: period.name});
	}
	return period;
};


const allFilterParams = ['period', 'start', 'end', 'brand', 'campaign', 'tag'];


/** The filter-by-entity list can get very long esp for devs/testers - manage its size*/
const longMenuStyle = {
	maxHeight: '75vh', // with long lists this gets clipped by the footer
	overflowY: 'auto', // Add scrollbars as needed
};


/** What time period, brand, and campaign are currently in focus?
 * 
 * This is set/stored in the url (so links can be shared)
 * 
 */
const GreenDashboardFilters = ({}) => {
	const [period, setPeriod] = useState(initPeriod());
	const [brand, setBrand] = useState(() => DataStore.getUrlValue('brand'));
	const [campaign, setCampaign] = useState(() => DataStore.getUrlValue('campaign'));
	const [tag, setTag] = useState(() => DataStore.getUrlValue('tag'));

	const [filterMode, setFilterMode] = useState(defaultFilterMode(brand, campaign, tag));
	const [showCustomRange, setShowCustomRange] = useState(!period?.name);

	// Update this to signal that the new filter values should be applied
	const [dummy, setDummy] = useState(false);
	const doCommit = () => setDummy(nonce());

	// Write updated filter spec back to URL parameters
	useEffect(() => {
		if (!dummy) return;
		// Get all params in effect, remove all params pertaining to green dashboard..
		const { params } = DataStore.getValue('location');
		allFilterParams.forEach(p => { delete params[p]; });

		// ...and re-add the ones we want.
		modifyPage(null, {
			[filterMode]: { brand, campaign, tag }[filterMode],
			...periodToParams(period),
		}, false, true);
	}, [dummy])

	// Update whichever ID we're currently filtering by
	const setCurrentTemp = {
		brand: setBrand,
		campaign: setCampaign,
		tag: setTag,
	}[filterMode];

	// Shorthand for a click on one of the "Xth Quarter" buttons
	const setNamedPeriod = name => {
		setPeriod({name});
	};

	const [availableBrands, setAvailableBrands] = useState([]);
	const [availableCampaigns, setAvailableCampaigns] = useState([]);
	const [availableTags, setAvailableTags] = useState([]);

	const userId = Login.getId();

	useEffect(() => {
		// setup options
		Login.getSharedWith(userId).then(res => {
			const shareList = res.cargo;
			if (!shareList) return;

			const nextBrandIds = [];
			const nextCampaignIds = [];

			shareList.forEach(share => {
				const brandMatches = share.item.match(/^Advertiser:(\w+)/);
				if (brandMatches) nextBrandIds.push(brandMatches[1]);
				const campaignMatches = share.item.match(/^Campaign:(\w+)/);
				if (campaignMatches) nextCampaignIds.push(campaignMatches[1]);
			});

			// Get all the brands, campaigns and tags this user can manage
			if (nextBrandIds.length || isTester()) {
				getDataList({
					type: C.TYPES.Advertiser,
					status: KStatus.PUBLISHED,
					ids: nextBrandIds, // NB: a GL user should be fine with [] here
				}).promise.then(cargo => {
					if (cargo.hits) setAvailableBrands(cargo.hits);
				});
			}
			if (nextCampaignIds.length || isTester()) {
				getDataList({
					type: C.TYPES.Campaign,
					status: KStatus.PUBLISHED,
					ids: nextCampaignIds,
				}).promise.then(cargo => {
					if (cargo.hits) setAvailableCampaigns(cargo.hits);
				});
				// NB: no client-side filter for testers
				let q = isTester()? null : SearchQuery.setPropOr(null, "campaign", nextCampaigns.map(c => c.id));
				getDataList({
					type: C.TYPES.GreenTag,
					status: KStatus.PUBLISHED,
					q
				}).promise.then(cargo => {
					if (cargo.hits) setAvailableTags(cargo.hits);
				});
			}
		});
	}, [userId]);

	// TODO "Normal" access control:
	// - Advertisers & Campaigns will be shared with contacts
	// - Admin users get an email entry control to "act as" contacts
	// - When acting as non-admin, their available brands & campaigns populate dropdowns

	let periodLabel = 'Timeframe:';
	if (!period.name) periodLabel += ' Custom'
	else periodLabel += ` ${printPeriod(period, true)}`

	let filterLabel = 'Filter by:';
	if (filterMode) filterLabel += ` ${filterMode}`;

	let thisQuarter = getPeriodQuarter(new Date()).name;
	let dateCursor = new Date();
	dateCursor.setMonth(dateCursor.getMonth() - 3);
	let lastQuarter = getPeriodQuarter(dateCursor).name;

	// What will we show in the last filter stage?
	const filterByEntityOptions = {
		brand: availableBrands,
		campaign: availableCampaigns,
		tag: availableTags
	}[filterMode];
	
	let brandItem = brand? getDataItem({type:C.TYPES.Advertiser, id:brand, status:KStatus.PUBLISHED}).value : null;

	return (
		<Row className="greendash-filters my-2">
			<Col xs="12">
				<Logo item={brandItem} />
				<Form inline>
					{/* ??Seeing layout bugs that can block use -- refactoring to use a PropControl might be best*/}
					<UncontrolledDropdown className="filter-dropdown">
						<DropdownToggle className="pl-0" caret>{periodLabel}</DropdownToggle>
						<DropdownMenu>
							<QuarterButtons period={period} setNamedPeriod={setNamedPeriod} />
							<DropdownItem onClick={() => setNamedPeriod('all')}>
								All Time
								{period.name === 'all' ? <span className="selected-marker" /> : null}
							</DropdownItem>
							<DropdownItem toggle={false} onClick={() => setShowCustomRange(true)}>
								Custom
								{(!period.name && (period.start || period.end)) ? <span className="selected-marker" /> : null}
							</DropdownItem>
							{showCustomRange ? <>
								<DropdownItem divider />
								<DateRangeWidget dflt={period} onChange={setPeriod} />
								<DropdownItem className="btn btn-primary pull-right d-inline-block w-unset" onClick={doCommit}>Apply custom timeframe</DropdownItem>
							</> : null}
						</DropdownMenu>
					</UncontrolledDropdown>
					
					<UncontrolledDropdown className="filter-dropdown ml-2">
						<DropdownToggle caret>Filter by: {filterMode || ''}</DropdownToggle>
						<DropdownMenu>
							<DropdownItem onClick={() => setFilterMode('brand')}>
								{filterMode === 'brand' ? <span className="selected-marker" /> : null}
								Brand
							</DropdownItem>
							<DropdownItem onClick={() => setFilterMode('campaign')}>
								{filterMode === 'campaign' ? <span className="selected-marker" /> : null}
								Campaign
							</DropdownItem>
							<DropdownItem onClick={() => setFilterMode('tag')}>
								{filterMode === 'tag' ? <span className="selected-marker" /> : null}
								Tag
							</DropdownItem>
						</DropdownMenu>
					</UncontrolledDropdown>

					{filterMode && <UncontrolledDropdown className="filter-dropdown ml-2">
						<DropdownToggle caret>{{ campaign, brand, tag }[filterMode] || `Select a ${filterMode}`}</DropdownToggle>
						<DropdownMenu style={longMenuStyle} >
							{filterByEntityOptions.map(item => (
								<DropdownItem key={item.id} onClick={() => setCurrentTemp(item.id)}>
									{{ campaign, brand, tag }[filterMode] === item.id ? <span className="selected-marker" /> : null}
									{item.name}
								</DropdownItem>
							))}
						</DropdownMenu>
					</UncontrolledDropdown>}

					{filtersChanged(period, filterMode, brand, campaign, tag) ? (
						<Button color="primary" className="ml-2" onClick={doCommit} size="sm">Apply new filters</Button>
					) : null}
				</Form>
			</Col>
		</Row>
	);
};


export default GreenDashboardFilters;
