import React, { useEffect } from 'react';
import { Col, Form, Row } from 'reactstrap';
import ListLoad from '../../base/components/ListLoad';
import PropControl from '../../base/components/PropControl';
import { getId } from '../../base/data/DataClass';
import Person, { getPVClaimValue, getProfile, savePersons, setClaimValue, getClaimValue } from '../../base/data/Person';
import { getDataItem } from '../../base/plumbing/Crud';
import DataStore, { getListPath } from '../../base/plumbing/DataStore';
import { assert, assMatch } from '../../base/utils/assert';
import { space } from '../../base/utils/miscutils';
import Login from '../../base/youagain';
import Icon from '../../base/components/Icon';
import PromiseValue from 'promise-value';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataLogData } from '../../base/plumbing/DataLog';
import C from '../../C';
import LinkOut from '../../base/components/LinkOut';


const TabsForGoodSettings = () => {
	const task = DataStore.getUrlValue("task"); // e.g. "select-charity"
	return <>
		{!task && <TabStats />}
		<div className="py-3" />
		<h2>Choose a different search engine</h2>
		<SearchEnginePicker />
		<div className="py-3" />
		<h1>Pick your charity</h1>
		<br />
		<CharityPicker />
	</>;
};

const SearchEnginePicker = () => {
	const person = getProfile().value;
	if (!person) return <Misc.Loading />;
	let searchEngine = getClaimValue({ person, key: "searchEngine" });
	const dpath = ['widget', 'TabsForGoodSettings'];
	if (!searchEngine) {
		searchEngine = "google";
	} else {
		DataStore.setValue(dpath.concat("searchEnginePicker"), searchEngine, false); // set it for the PropControl
	}
	const onSelect = ({ value }) => {
		console.log("newEngine", value);
		setPersonSetting("searchEngine", value);
	};

	return <PropControl type="select" prop="searchEnginePicker" options={["google", "ecosia", "duckduckgo", "bing"]}
		labels={["Google", "Ecosia", "DuckDuckGo", "Bing"]} dflt={"google"} saveFn={onSelect}
		path={dpath} aria-label="Choose a search engine"/>;
};


const CharityPicker = () => {
	const person = getProfile().value;
	if (!person) return <Misc.Loading />;
	let selId = getClaimValue({ person, key: "charity" });

	const pvSelectedCharity = selId && getDataItem({ type: C.TYPES.NGO, id: selId, status: KStatus.Published, swallow: true });
	let q = DataStore.getValue('widget', 'search', 'q');

	// HACK: default list - poke it into appstate
	const dq = "LISTLOADHACK"; // NB: an OR over "id:X" doesn't work as SoGive is annoyingly using the schema.org "@id" property
	const DEFAULT_LIST = "against-malaria-foundation oxfam helen-keller-international clean-air-task-force strong-minds give-directly pratham wwf-uk cancer-research-uk";
	const type = "NGO"; const status = "PUBLISHED";
	// fetch the full item - and make a Ref
	let hits = DEFAULT_LIST.split(" ").map(cid => getDataItem({ type, id: cid, status }) && { id: cid, "@type": type, status });
	// HACK: This is whereListLoad will look!
	const charityPath = getListPath({ type: "NGO", status: KStatus.PUBLISHED, q: "LISTLOADHACK", sort: "impact" }); // "list.NGO.PUBLISHED.nodomain.LISTLOADHACK.whenever.impact".split(".");
	DataStore.setValue(charityPath, { hits, total: hits.length }, false);

	return <div>
		{selId &&
			<><p className="large">Your selected charity:</p>
				<div className="gridbox gridbox-md-3">
					<CharitySelectBox item={pvSelectedCharity.value || { id: selId }} />
				</div>
				<br />
			</>}
		<div className="d-md-flex flex-md-row justify-content-between unset-margins mb-3">
			<p className="large">Can't see your favourite charity?&nbsp;<br className="d-md-none" />Search for it:</p>
			<Search onSubmit={e => e.preventDefault()} placeholder="Find your charity" className="flex-grow ml-md-5" />
		</div>
		<ListLoad className={"gridbox gridbox-md-3"} type="NGO" status="PUBLISHED" q={q || dq} sort="impact" ListItem={CharitySelectBox} unwrapped hideTotal />
	</div>;
};

/**
 * Show a selectable charity in the charity list
 * @param charity the charity to show
 * @param {boolean} selected
 */
const CharitySelectBox = ({ item, className }) => {
	assert(item, "CharitySelectBox - no item");
	const person = getProfile().value;
	let selId = person && getClaimValue({ person, key: "charity" });

	let selected = getId(item) === selId;
	// NB: to deselect, pick a different charity (I think that's intuitive enough)

	return <div className={space("m-md-2", className)}>
		<div
			className={space("charity-select-box flex-column justify-content-between align-items-center unset-margins p-md-3 w-100 position-relative")}
		>
			{item.logo ? <img className="logo-xl mt-4 mb-2" src={item.logo} alt={item.name || item.id} /> : <span>{item.name || item.id}</span>}
			<p>{item.summaryDescription}</p>
			{selected ? <span className="text-success thin"><Icon name="tick" /> Selected</span>
				: <button onClick={() => setPersonSetting("charity", getId(item))} className="btn btn-outline-primary thin">Select</button>
			}
			{item.url && <LinkOut className="position-absolute" style={{ top: 10, right: 10 }} href={item.url} aria-label={"Read more about " + (item.name || item.id)}>About</LinkOut>}
		</div>
	</div>;
}; // ./CharitySelectBox


const TabStats = () => {
	let pvTabsOpened = getTabsOpened();
	let daysWithGoodLoop = getDaysWithGoodLoop();
	let weeklyAvg = Math.round(7 * pvTabsOpened.value / daysWithGoodLoop);

	const goodStat = (stat) => {
		return stat && stat !== Infinity;
	};

	return (
		<><h1>Your stats</h1>
			<Row>
				<StatCard md={4} number={goodStat(daysWithGoodLoop) ? daysWithGoodLoop : "-"} label="Days with My-Loop" />
				<StatCard md={4} number={goodStat(pvTabsOpened) && (pvTabsOpened && pvTabsOpened.value) ? pvTabsOpened.value : "-"} label="Tabs opened" />
				<StatCard md={4} number={goodStat(weeklyAvg) ? weeklyAvg : "-"} label="Weekly tab average" />
			</Row></>
	);
};

/** Search box - a magnifying-glass icon by a text input ??Refactor with PropControl type=search??
 */
const Search = ({ onSubmit, placeholder, icon, className }) => {
	return (<>
		<Form onSubmit={onSubmit} inline className={space("flex-row tab-search-form px-2", className)} >
			{icon && icon}
			<PropControl placeholder={placeholder} type="search" id="search" prop="q" path={['widget', 'search']} className="flex-grow w-100" />
			<i className="fa fa-search tab-search mr-2" onClick={onSubmit}/>
		</Form>
	</>);
};

/**
 * Fetch the number of tabs opened by the user.
 * @returns ?PromiseValue<Number> null if not logged in yet
 */
const getTabsOpened = () => {
	// start:0 = all time (otherwise defaults to 1 month)
	return getTabsOpened2({start:0, user:Login.getId()});
};

/**
 * Fetch the number of tabs opened (by the user) (for a charity).
 * @returns ?PromiseValue<Number> null if not logged in yet
 */
 export const getTabsOpened2 = ({start, user, cid}) => {
	let q = space( // HACK! It'd be better to use searchquery.js
		user && "user:"+Login.getId()+ " AND", 
		cid && "cid:"+cid+ " AND", 
		cid? "evt:tabadview" : "evt:tabopen" // HACK count adviews for charity-specific stats which are used to estimate £s
		);
	const trkreq = {
		q,
		name: "tabopens",
		dataspace: 'gl',
		start
	}; // ??future, end, breakdowns: [byHostOrAd]};
	let pvData = getDataLogData(trkreq);
	let pvAllCount = PromiseValue.then(pvData, res => {
		return res.allCount;
	});
	return pvAllCount;
};


/**
 * @returns {!Number}
 */
const getDaysWithGoodLoop = () => {
	const person = getProfile().value;
	if (!person) {
		return 1;
	}
	// use the oldest claim (TODO lets have a register claim and use that)
	let claims = Person.claims(person);
	// const claims = getClaims({persons, key:"app:t4g.good-loop.com"});
	// find the oldest
	const claimDates = claims.map(c => c.t).filter(t => t);
	claimDates.sort();
	const oldest = claimDates[0];
	if (!oldest) {
		console.warn("getDaysWithGoodLoop - No claim date");
		return 1;
	}
	const dmsecs = new Date().getTime() - new Date(oldest).getTime();
	const days = Math.floor(dmsecs / (1000 * 60 * 60 * 24));
	return days;
};

/**
	@returns ?PromiseValue(String)
 */
const getPVSelectedCharityId = (xid) => {
	return getPVClaimValue({ xid, key: "charity" });
};

/**
 * Set and save
 * @param {*} key 
 * @param {*} value 
 */
const setPersonSetting = (key, value) => {
	assMatch(key, String, "setPersonSetting - no key");
	assMatch(value, "String|Number|Boolean");
	const xid = Login.getId();
	assert(xid, "setPersonSetting - no login");
	let pvp = getProfile({ xid });
	let person = pvp.value || pvp.interim;
	assert(person, "setPersonSetting - no person", pvp);
	console.log("setPersonSetting", xid, key, value, person);
	setClaimValue({ person, key, value });
	DataStore.update();
	const pv = savePersons({ person });
	const task = DataStore.getUrlValue("task"); // e.g. "select-charity"
	const link = DataStore.getUrlValue("link");
	pv.promise.then(re => {
		console.log("... saved person setting ", key, value);
		if (task === "return" && link) {
			window.location = link;
		}
	}).catch(e => {
		console.error("FAILED PERSON SAVE", e);
	});
};

const StatCard = ({ md, lg, xs, number, label, className, padding, children }) => {
	return <Col md={md} lg={lg} xs={xs} className={space("stat-card", className)} style={{ padding: (padding || "20px") }}>
		<div className="stat-content w-100 h-100 p-4 bg-gl-pink color-gl-red text-center">
			<h1>{number}</h1>
			<p className="large" style={{ marginBottom: 0 }}>{label}</p>
			{children}
		</div>
	</Col>;
};

export { getTabsOpened, Search, getPVSelectedCharityId, setPersonSetting };
export default TabsForGoodSettings;
