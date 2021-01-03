import React, { useRef, useState } from 'react';
import { Col, Form, Row } from 'reactstrap';
import ListLoad from '../../base/components/ListLoad';
import PropControl from '../../base/components/PropControl';
import JSend from '../../base/data/JSend';
import { getAllXIds, getClaimValue, getProfilesNow, savePersons, setClaimValue } from '../../base/data/Person';
import { getDataItem } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { isPortraitMobile, space } from '../../base/utils/miscutils';
import ServerIO from '../../plumbing/ServerIO';
import Login from '../../base/youagain';
import { CharityLogo } from '../cards/CharityCard';


const TabsForGoodSettings = () => {
	return <>
		<h1>Your stats</h1>
		<TabStats/>
		<div className="py-3"/>
		<h1>Pick your charity</h1>
		<p className={isPortraitMobile() ? "" : "w-50"}>Select a charity and we will send them all the money that your Tabs for Good are generating. You can change your selection at any time.</p>
		<br/><br/>
		<CharityPicker/>
		{/* whitespace to prevent jump on charity search */}
		<div style={{height:"50vh"}}/>
	</>;
};

const CharityPicker = () => {
	const selId = getSelectedCharityId();
	const selectedCharity = selId && getDataItem({type:C.TYPES.NGO, id:selId, status:C.KStatus.Published, swallow:true});
	let q = DataStore.getValue('widget','search','q');
	const DEFAULT_LIST = "against-malaria-foundation oxfam helen-keller-international clean-air-task-force strong-minds give-directly pratham wwf-uk";
	const dq = "HACKY-HACK"; //'"'+(DEFAULT_LIST.split(" ").join("\" OR \""))+'"'; // NB: "id:X" doesn't work as SoGive is annoyingly using the schema.org "@id" property
	return <div className="tabs-for-good-settings">
		{selectedCharity && 
			<><p>Your selected charity:</p>
				<div className="col-md-3">
					<CharitySelectBox charity={selectedCharity} selected />
				</div>
			</>}		
		<div className="d-md-flex flex-md-row justify-content-between unset-margins mb-3">
			<p>Can't see your favourite charity?&nbsp;<br className="d-md-none"/>Search for it:</p>
			<Search onSubmit={e => e.preventDefault()} placeholder="Find your charity" className="flex-grow ml-md-5"/>
		</div>
		<ListLoad type="NGO" status="PUBLISHED" q={q || dq} sort="impact" />
	</div>;
};

// ListItem {type, servlet, navpage, item, sort} <div key={c.id} className="p-md-3 d-flex justify-content-center align-items-center">
				// <CharitySelectBox charity={c} padAmount3D={25} className="pt-3 pt-md-0"/>
				// </div>

// TODO charity selection backend!!
/**
 * Show a selectable charity in the charity list
 * @param charity the charity to show
 * @param {boolean} selected 
 * @param do3d activate the 3d mouse follow effect ??doc: why not always on?
 * @param padAmount3D override width of div that captures the mouse for tracking on 3d effects. ??0Why would this vary?
 */
const CharitySelectBox = ({charity, selected, padAmount3D=150, className}) => {
	let do3d = ! isPortraitMobile();		
	// ref & state are used for the 3D card effect
	const container3d = useRef(null);
	const [axis, setAxis] = useState({x: 0, y: 0});
	const [transition, setTransition] = useState('none');
	const [elementHeight, setElementHeight] = useState(0);

	const on3dMouseMove = e => {
		if (container3d.current) {
			// Higher = less extreme
			let sensitivity = 10;
			let rect = container3d.current.getBoundingClientRect();
			// Maths for this found partially by trial and error - "it just works", Todd Howard
			setAxis({x: ((rect.width / 2) - e.pageX + rect.left) / sensitivity,
				y: ((rect.height * 2) - e.pageY + rect.bottom + ((rect.top - rect.bottom) / 2) + window.scrollY - (window.screen.height / 2)) / sensitivity});
		}
	};

	const on3dMouseEnter = () => {
		setTransition('none');
		setElementHeight(50);
	};

	const on3dMouseLeave = () => {
		setTransition('all 0.5s ease');
		setAxis({x:0, y:0});
		setElementHeight(0);
	};	

	let style = do3d ? {transform:`rotateY(${-axis.x}deg) rotateX(${axis.y}deg)`, transition:transition} : {};
	style.height = 280;

	// NB: to deselect, pick a different charity (I think that's intuitive enough)

	return <div className={space(do3d && "container-3d", className)} ref={container3d}
		style={do3d ? {paddingLeft:padAmount3D, paddingRight:padAmount3D, marginLeft:-padAmount3D, marginRight:-padAmount3D} : null}
		onMouseMove={do3d ? on3dMouseMove : null}
		onMouseEnter={do3d ? on3dMouseEnter : null}
		onMouseLeave={do3d ? on3dMouseLeave : null}
	>
		<div style={style} 
			className={space("charity-select-box flex-column justify-content-center align-items-center unset-margins p-md-3 position-relative w-100", do3d ? "do3d" : "")}
		>
			{charity ? <>
				<CharityLogo style={{maxWidth:"100%", width: "100%", transform: `translateZ(${elementHeight}px)`}} charity={charity} key={charity.id} className="p-2 mb-5 mt-5 w-75"/>
				{selected ? <span className="text-success thin position-absolute" style={{bottom:20, left:"50%", transform:"translateX(-50%)"}} >&#10004; Selected</span>
					: <a className="btn btn-transparent fill thin position-absolute" style={{bottom:20, left:"50%", transform:"translateX(-50%)"}} onClick={() => {console.log("DSAHKDSAKJJ"); setSelectedCharityId(charity.id)}}>Select</a>}
				<a className="position-absolute" style={{top: 10, right: 10}} href={charity.url} target="_blank" rel="noreferrer">About</a>
			</> : <p style={{transform: `translateZ(${elementHeight}px)`}} className="color-gl-light-red">Select a charity</p>}
		</div>
	</div>;
};

const TabStats = () => {
	let pvTabsOpened = getTabsOpened();
	let daysWithGoodLoop = getDaysWithGoodLoop();
	let weeklyAvg = Math.round(7*pvTabsOpened.value / daysWithGoodLoop);

	const goodStat = (stat) => {
		return stat && stat !== Infinity;
	};

	return (
		<Row>
			<StatCard md={4} number={goodStat(daysWithGoodLoop) ? daysWithGoodLoop : "-"} label="Days with Tabs for Good"/>
			<StatCard md={4} number={goodStat(pvTabsOpened) && (pvTabsOpened && pvTabsOpened.value) ? pvTabsOpened.value : "-"} label="Tabs opened"/>
			<StatCard md={4} number={goodStat(weeklyAvg) ? weeklyAvg : "-"} label="Weekly tab average"/>
		</Row>
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
const getTabsOpened2_unwrap = res => JSend.data(res).all.count;

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

const getSelectedCharityId = () => {
	let xids = getAllXIds();
	let persons = getProfilesNow(xids);
	let cid = getClaimValue({persons, key:"charity"});
	return cid;
};

const setSelectedCharityId = (cid) => {
	let xids = getAllXIds();
	let persons = getProfilesNow(xids);
	setClaimValue({persons, key:"charity", value:cid});
	savePersons({persons});
	console.log("setSelectedCharityId " + cid);
	DataStore.update();
};

const StatCard = ({md, lg, xs, number, label, className, padding, children}) => {
	return <Col md={md} lg={lg} xs={xs} className={space("stat-card", className)} style={{padding:(padding || "20px")}}>
		<div className="stat-content w-100 h-100 p-4 bg-gl-pink color-gl-red text-center">
			<h1>{number}</h1>
			<p style={{marginBottom: 0}}>{label}</p>
			{children}
		</div>
	</Col>;
};

export { getTabsOpened, Search, getSelectedCharityId };
export default TabsForGoodSettings;
