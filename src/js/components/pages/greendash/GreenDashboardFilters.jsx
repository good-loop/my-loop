import React, { useEffect, useState } from 'react';
import { Button, Col, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Row, UncontrolledDropdown } from 'reactstrap';
import { nonce } from '../../../base/data/DataClass';
import KStatus from '../../../base/data/KStatus';
import { getDataList } from '../../../base/plumbing/Crud';
import DataStore from '../../../base/plumbing/DataStore';
import { stopEvent } from '../../../base/utils/miscutils';
import DateRangeWidget from '../../DateRangeWidget';
import { getPeriodQuarter, periodFromUrl, periodToUrl, printPeriod } from './dashutils';


/** Generate the list of quarter-period shortcuts */
const QuarterButtons = ({ period, setNamedPeriod }) => {
	const buttons = [];
	const dateCursor = new Date();
	dateCursor.setDate(1); // avoid month-length problems
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


/** What time period, brand, and campaign are currently in focus? */
const GreenDashboardFilters = ({}) => {
	const [period, setPeriod] = useState(periodFromUrl());
	const [brand, setBrand] = useState(() => DataStore.getUrlValue('brand'));
	const [campaign, setCampaign] = useState(() => DataStore.getUrlValue('campaign'));
	const [tag, setTag] = useState(() => DataStore.getUrlValue('tag'));



	const [filterMode, setFilterMode] = useState(defaultFilterMode(brand, campaign, tag));
	const [showCustomRange, setShowCustomRange] = useState(!period.name);

	// Update this to signal that the new filter values should be applied
	const [dummy, setDummy] = useState(false);
	const doCommit = () => setDummy(nonce());

	// Write updated filter spec back to URL parameters
	useEffect(() => {
		if (!dummy) return;
		// Put currently-selected filter in URL...
		const filterVals = { brand, campaign, tag };
		DataStore.setUrlValue(filterMode, filterVals[filterMode], false);
		// ...and remove the others. (Don't provoke redraw yet!)
		delete filterVals[filterMode];
		Object.keys(filterVals).forEach((modeName) => DataStore.setUrlValue(modeName, null, false));

		// Apply date filter and trigger redraw
		periodToUrl(period);
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
		doCommit();
	};

	const [availableBrands, setAvailableBrands] = useState([]);
	const [availableCampaigns, setAvailableCampaigns] = useState([]);
	const [availableTags, setAvailableTags] = useState([]);

	const userId = Login.getId();

	useEffect(() => {
		Login.getSharedWith(userId).then(res => {
			const shareList = res.cargo;
			if (!shareList) return;

			const nextBrands = [];
			const nextCampaigns = [];

			shareList.forEach(share => {
				const brandMatches = share.item.match(/^Advertiser:(\w+)/);
				if (brandMatches) nextBrands.push(brandMatches[1]);
				const campaignMatches = share.item.match(/^Campaign:(\w+)/);
				if (campaignMatches) nextCampaigns.push(campaignMatches[1]);
			});

			// Get all the brands, campaigns and tags this user can manage
			if (nextBrands.length) {
					getDataList({
					type: C.TYPES.Advertiser,
					status: KStatus.PUBLISHED,
					ids: nextBrands,
				}).promise.then(cargo => {
					if (cargo.hits) setAvailableBrands(cargo.hits);
				});
			}
			if (nextCampaigns.length) {
				getDataList({
					type: C.TYPES.Campaign,
					status: KStatus.PUBLISHED,
					ids: nextCampaigns,
				}).promise.then(cargo => {
					if (cargo.hits) setAvailableCampaigns(cargo.hits);
				});
				getDataList({
					type: C.TYPES.GreenTag,
					status: KStatus.PUBLISHED,
					q: `${nextCampaigns.map(c => `campaign:${c.id}`).join(' OR ')}`
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

	return (
		<Row className="greendash-filters mb-2">
			<Col xs="12">
				{ brand ? <img src="brand.png" alt="Brand Logo" /> : null }
				<Form inline>
					<UncontrolledDropdown className="filter-dropdown">
						<DropdownToggle caret>Timeframe</DropdownToggle>
						<DropdownMenu>
							<QuarterButtons period={period} setNamedPeriod={setNamedPeriod} />
							<DropdownItem toggle={false} onClick={() => setShowCustomRange(true)}>
								Custom
								{period.name ? null : <span className="selected-marker" />}
							</DropdownItem>
							{showCustomRange ? <>
								<DropdownItem divider />
								<DateRangeWidget dflt={period} onChange={setPeriod} />
								<DropdownItem className="btn btn-primary pull-right d-inline-block w-unset" onClick={doCommit}>Apply custom timeframe</DropdownItem>
							</> : null}
						</DropdownMenu>
					</UncontrolledDropdown>
					<UncontrolledDropdown className="filter-dropdown ml-2">
						<DropdownToggle caret>Filter by {filterMode || '...'}</DropdownToggle>
						<DropdownMenu>
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
						<DropdownMenu>
							{{brand: availableBrands, campaign: availableCampaigns, tag: availableTags}[filterMode].map(item => (
								<DropdownItem onClick={() => setCurrentTemp(item.id)}>
									{{ campaign, brand, tag }[filterMode] === item.id ? <span className="selected-marker" /> : null}
									{item.name}
								</DropdownItem>
							))}
						</DropdownMenu>
					</UncontrolledDropdown>}

					<Button className="ml-2" onClick={doCommit} size="sm">Apply</Button>
				</Form>
			</Col>
		</Row>
	);
};


export default GreenDashboardFilters;