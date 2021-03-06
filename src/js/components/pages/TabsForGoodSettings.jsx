import React from 'react';
import { Col, Form, Row } from 'reactstrap';
import ListLoad from '../../base/components/ListLoad';
import PropControl from '../../base/components/PropControl';
import { getId } from '../../base/data/DataClass';
import JSend from '../../base/data/JSend';
import { getAllXIds, getClaimValue, getProfilesNow, savePersons, setClaimValue } from '../../base/data/Person';
import { getDataItem } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { assert } from '../../base/utils/assert';
import { space } from '../../base/utils/miscutils';
import Login from '../../base/youagain';
import ServerIO from '../../plumbing/ServerIO';
import Cookies from 'js-cookie';
import Icon from '../../base/components/Icon';


const TabsForGoodSettings = () => {
	const task = DataStore.getUrlValue("task"); // e.g. "select-charity"
	return <>		
		{ ! task && <TabStats/>}
		<div className="py-3"/>
		<h2>Choose a different search engine</h2>
		<SearchEnginePicker/>
		<div className="py-3"/>
		<h1>Pick your charity</h1>
		<br/>
		<CharityPicker/>
	</>;
};

const SearchEnginePicker = () => {
	const selEngine = getSearchEngine();
	DataStore.setValue(['widget', 'TabsForGoodSettings', 'searchEnginePicker'], selEngine || 'google');
	
	console.log("Selected search engine: " + selEngine);

	const onSelect = () => {
		const newEngine = DataStore.getValue(['widget', 'TabsForGoodSettings', 'searchEnginePicker']);
		console.log(newEngine);
		setSearchEngine(newEngine);
	}

	return <PropControl type="select" prop="searchEnginePicker" options={["google", "ecosia", "duckduckgo", "bing"]}
		labels={["Google", "Ecosia", "DuckDuckGo", "Bing"]} dflt={"google"} onChange={onSelect}
		path={['widget', 'TabsForGoodSettings']}/>;
}

const CharityPicker = () => {
	const selId = getSelectedCharityId();
	const pvSelectedCharity = selId && getDataItem({type:C.TYPES.NGO, id:selId, status:C.KStatus.Published, swallow:true});
	let q = DataStore.getValue('widget','search','q');
	
	// HACK: default list - poke it into appstate
	const dq = "LISTLOADHACK"; // NB: an OR over "id:X" doesn't work as SoGive is annoyingly using the schema.org "@id" property
	const DEFAULT_LIST = "against-malaria-foundation oxfam helen-keller-international clean-air-task-force strong-minds give-directly pratham wwf-uk cancer-research-uk";
	const type = "NGO"; const status="PUBLISHED";
	// fetch the full item - and make a Ref
	let hits = DEFAULT_LIST.split(" ").map(cid => getDataItem({type, id:cid, status}) && {id:cid, "@type":type, status});
	DataStore.setValue("list.NGO.PUBLISHED.nodomain.LISTLOADHACK.whenever.impact".split("."), {hits, total:hits.length}, false);

	return <div>
		{selId && 
			<><p className='large'>Your selected charity:</p>
				<div className="gridbox gridbox-md-3">
					<CharitySelectBox item={pvSelectedCharity.value || {id:selId}} />
				</div>
				<br/>
			</>}		
		<div className="d-md-flex flex-md-row justify-content-between unset-margins mb-3">
			<p className='large'>Can't see your favourite charity?&nbsp;<br className="d-md-none"/>Search for it:</p>
			<Search onSubmit={e => e.preventDefault()} placeholder="Find your charity" className="flex-grow ml-md-5"/>
		</div>
		<ListLoad className={"gridbox gridbox-md-3"} type="NGO" status="PUBLISHED" q={q || dq} sort="impact" ListItem={CharitySelectBox} unwrapped hideTotal />
	</div>;
};

// ListItem {type, servlet, navpage, item, sort} <div key={c.id} className="p-md-3 d-flex justify-content-center align-items-center">
				// <CharitySelectBox charity={c} padAmount3D={25} className="pt-3 pt-md-0"/>
				// </div>

/**
 * Show a selectable charity in the charity list
 * @param charity the charity to show
 * @param {boolean} selected 
 */
const CharitySelectBox = ({item, className}) => {
	assert(item, "CharitySelectBox - no item");
	const selId = getSelectedCharityId();
	let selected = getId(item) === selId;	
	// NB: to deselect, pick a different charity (I think that's intuitive enough)

	return <div className={space("m-md-2", className)}>
		<div
			className={space("charity-select-box flex-column justify-content-between align-items-center unset-margins p-md-3 w-100 position-relative")}			
		>
			{item.logo? <img className="logo-xl mt-4 mb-2" src={item.logo} /> : <span>{item.name || item.id}</span>}
			<p>{item.summaryDescription}</p>
			{selected ? <span className="text-success thin"><Icon name='tick' /> Selected</span>
				: <button onClick={() => setSelectedCharityId(getId(item))} className="btn btn-outline-primary thin">Select</button>
			}
			{item.url && <a className="position-absolute" style={{top: 10, right: 10}} href={item.url} target="_blank" rel="noreferrer">About</a>}
		</div>
	</div>;
}; // ./CharitySelectBox


const TabStats = () => {
	let pvTabsOpened = getTabsOpened();
	let daysWithGoodLoop = getDaysWithGoodLoop();
	let weeklyAvg = Math.round(7*pvTabsOpened.value / daysWithGoodLoop);

	const goodStat = (stat) => {
		return stat && stat !== Infinity;
	};

	return (
		<><h1>Your stats</h1>
		<Row>
			<StatCard md={4} number={goodStat(daysWithGoodLoop) ? daysWithGoodLoop : "-"} label="Days with My-Loop"/>
			<StatCard md={4} number={goodStat(pvTabsOpened) && (pvTabsOpened && pvTabsOpened.value) ? pvTabsOpened.value : "-"} label="Tabs opened"/>
			<StatCard md={4} number={goodStat(weeklyAvg) ? weeklyAvg : "-"} label="Weekly tab average"/>
		</Row></>
	);
};

/** Search box - a magnifying-glass icon by a text input ??This is a nice search box - Should this move to PropControl type=search??
 */
const Search = ({onSubmit, placeholder, icon, className}) => {
	return (<>
		<Form onSubmit={onSubmit} inline className={space("flex-row tab-search-form px-2", className)} >
			{icon && icon}
			<PropControl placeholder={placeholder} type="search" prop="q" path={['widget', 'search']} className="flex-grow w-100" />
			<i className="fa fa-search tab-search mr-2" onClick={onSubmit}/>
		</Form>
	</>);
};

/** 
 * Fetch the number of tabs opened by the user.
 * @returns ?PromiseValue<Number> null if not logged in yet
 */
const getTabsOpened = () => {
	if ( ! Login.isLoggedIn()) {
		return null;
	}
	// Get tabs opened stat from profiler
	let pvValue = DataStore.fetch(['misc','stats','tabopens'], () => {
		const trkreq = {
			q: "user:"+Login.getId()+" AND evt:tabopen",
			name: "tabopens",
			dataspace: 'gl',
			start: 0 // all time (otherwise defaults to 1 month)
		}; // ??future, end, breakdowns: [byHostOrAd]};				
		let pData = ServerIO.getDataLogData(trkreq);
		// unwrap the count
		return pData.then(getTabsOpened2_unwrap);
	});
	return pvValue;	
};
const getTabsOpened2_unwrap = res => {
	const data = JSend.data(res);
	return data.all;
}

const getDaysWithGoodLoop = () => {
	const xids = getAllXIds();
	const persons = getProfilesNow(xids);
	// use the oldest claim (TODO lets have a register claim and use that)
	let allClaims = [];
	persons.forEach(peep => allClaims.push(...peep.claims));	
	// const claims = getClaims({persons, key:"registered:tabs-for-good"});
	// find the oldest
	const claimDates = allClaims.map(c => c.t).filter(t => t);
	claimDates.sort();
	const oldest = claimDates[0];
	if ( ! oldest) {
		console.warn("getDaysWithGoodLoop - No claim date");
		return 1;
	}
	const dmsecs = new Date().getTime() - new Date(oldest).getTime();
	const days = Math.floor(dmsecs / (1000*60*60*24));
	return days;
};

/**
 * Warning: this uses `getProfilesNow()` -- so the value may start null, then change as profiles are loaded.
 * @returns {?String} charity ID
 */
const getSelectedCharityId = () => {
	let xids = getAllXIds();
	let persons = getProfilesNow(xids);
	let cid = getClaimValue({persons, key:"charity", swallow:true});
	return cid;
};

const setSelectedCharityId = (cid) => {
	let xids = getAllXIds();
	assert(xids.length);
	let persons = getProfilesNow(xids);
	assert(persons.length);
	setClaimValue({persons, key:"charity", value:cid, swallow:true});
	console.log("setSelectedCharityId " + cid+" for ",xids, "persons", persons);
	DataStore.update();
	// save
	let pv = savePersons({persons});
	// return??
	const task = DataStore.getUrlValue("task"); // e.g. "select-charity"
    const link = DataStore.getUrlValue("link");
    pv.promise.then(re => {
        console.log("... saved setSelectedCharityId " + cid);
        if (task==="select-charity" && link) {
            window.location = link;
        }
    }).catch(e => {
        console.error("FAILED CHARITY SELECT", e);
    })
	
};

const doesUserHaveT4G = () => {
	let xids = getAllXIds();
	let persons = getProfilesNow(xids);
	let cid = getClaimValue({persons, key:"hasT4G", swallow:true});
	return cid;
};

const setHasT4G = (hasT4G, update=true) => {
	let xids = getAllXIds();
	let persons = getProfilesNow(xids);
	setClaimValue({persons, key:"hasT4G", value:hasT4G, swallow:true});
	console.log("setHasT4G " + hasT4G +" for ",xids, "persons", persons);
	if (update) DataStore.update();
	// save
	let pv = savePersons({persons});
    pv.promise.then(re => console.log("... saved setHasT4G " + hasT4G));
};

const getSearchEngine = () => {
	let xids = getAllXIds();
	let persons = getProfilesNow(xids);
	let engine = getClaimValue({persons, key:"searchEngine", swallow:true});
	if (!engine) {
		engine = Cookies.get('t4g-search-engine');
	}
	return engine;
};

const setSearchEngine = (engine) => {
	let xids = getAllXIds();
	let persons = getProfilesNow(xids);
	setClaimValue({persons, key:"searchEngine", value:engine, swallow:true});
	console.log("setSelectedCharityId " + engine);
	DataStore.update();
	// save
	let pv = savePersons({persons});

	// Set a cookie with the new search engine, so there isnt a delay on loading the correct search engine on new tabs
	const secure = window.location.protocol==='https:';
	// ref: https://web.dev/samesite-cookies-explained/
	Cookies.set('t4g-search-engine', engine, {expires:365, sameSite:'None', secure: true});

	// return??
	const task = DataStore.getUrlValue("task"); // e.g. "select-charity"
	const link = DataStore.getUrlValue("link"); 
	if (task==="select-search-engine" && link) {
		pv.promise.then(re => {
			console.log("... saved setSearchEngine " + engine);
			window.location = link;
		});
	}
};

const StatCard = ({md, lg, xs, number, label, className, padding, children}) => {
	return <Col md={md} lg={lg} xs={xs} className={space("stat-card", className)} style={{padding:(padding || "20px")}}>
		<div className="stat-content w-100 h-100 p-4 bg-gl-pink color-gl-red text-center">
			<h1>{number}</h1>
			<p className="large" style={{marginBottom: 0}}>{label}</p>
			{children}
		</div>
	</Col>;
};

export { getTabsOpened, Search, getSelectedCharityId, setSelectedCharityId, getSearchEngine, setHasT4G, doesUserHaveT4G };
export default TabsForGoodSettings;
