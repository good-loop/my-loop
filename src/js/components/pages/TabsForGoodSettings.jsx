import React, { useState, useEffect, useRef } from 'react';
import Login from 'you-again';
import { Col, Row, Form } from 'reactstrap';
import { isPortraitMobile, space, yessy } from '../../base/utils/miscutils';
import DataStore from '../../base/plumbing/DataStore';
import ServerIO from '../../plumbing/ServerIO';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import { fetchAllCharities, fetchAllCharityIDs, fetchCharity } from './MyCharitiesPage';
import { CharityLogo } from '../cards/CharityCard';
import PropControl from '../../base/components/PropControl';
import Paginator from '../Paginator';


const TabsForGoodSettings = () => {
	return <>
		<h1>Your stats</h1>
		<TabStats/>
		<div className="py-3"/>
		<h1>Pick your charity</h1>
		<p className={isPortraitMobile() ? "" : "w-50"}>Select a charity and we will send them all the money that your Tabs for Good are generating. You can change your selection at any time.</p>
		<br/><br/>
		<CharityPicker/>
	</>;
};

const CharityPicker = () => {
	// Why is this useState??
	const [charities, setCharities] = useState([]);

	// TODO allow picking a charity without a logo	
	let charityLogos = [];

	// TODO less charities -- just show a shortlist of dunno, the top 10 UK charities?
	// Because paging through is not fun.
	// TODO search should search SoGive, to give a wide range of options
	// Parse CSV from donations tracker into json
	if (!yessy(charities)) {
		fetchAllCharityIDs().then(chars => setCharities(chars)).catch(status => console.error("Failed to get donation tracker CSV! Status: " + status));
	} else {
		let chars = fetchAllCharities(charities);
		// Get logo charities
		charityLogos = chars.filter(c => c.logo);
		let search = DataStore.getValue(['widget', 'search', 'q']);
		if (search) {
			search = search.toLowerCase();
			charityLogos = charityLogos.filter(c => c.name ? c.name.toLowerCase().includes(search) : false);
		}
	}

	const selId = getSelectedCharity();
	const selectedCharity = selId ? fetchCharity(selId) : null;

	return <div className="tabs-for-good-settings">
		<p>Your selected charity:</p>
		<div className="col-md-3">
			<CharitySelectBox charity={selectedCharity} deselect do3d={!isPortraitMobile()}/>
		</div>
		<div className="py-5"/> {/* spacer */}
		<div className="d-md-flex flex-md-row justify-content-between unset-margins mb-3">
			<p>Can't see your favourite charity?&nbsp;<br className="d-md-none"/>Search for it:</p>
			<Search onSubmit={e => e.preventDefault()} placeholder="Find your charity"/>
		</div>
		<Paginator rows={4} cols={5} rowsMD={2} colsMD={5} pageButtonRangeMD={1} displayCounter displayLoad>
			{charityLogos.map(c => <div key={c.id} className="p-md-3 d-flex justify-content-center align-items-center">
				<CharitySelectBox charity={c} do3d={!isPortraitMobile()} padAmount3D={25} className="pt-3 pt-md-0"/>
			</div>)}
		</Paginator>
	</div>;
};

// TODO charity selection backend!!
/**
 * Show a selectable charity in the charity list
 * @param charity the charity to show
 * @param deselect show a deselect button instead of a select one
 * @param do3d activate the 3d mouse follow effect ??doc: why not always on?
 * @param padAmount3D override width of div that captures the mouse for tracking on 3d effects. ??0Why would this vary?
 */
const CharitySelectBox = ({charity, deselect, do3d, padAmount3D=150, className}) => {
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
				{deselect ? <a className="btn btn-primary thin position-absolute" style={{bottom:20, left:"50%", transform:"translateX(-50%)"}} onClick={() => deselectCharity(charity)}>Deselect</a>
					: <a className="btn btn-transparent fill thin position-absolute" style={{bottom:20, left:"50%", transform:"translateX(-50%)"}} onClick={() => selectCharity(charity)}>Select</a>}
				<a className="position-absolute" style={{top: 10, right: 10}} href={charity.url} target="_blank" rel="noreferrer">About</a>
			</> : <p style={{transform: `translateZ(${elementHeight}px)`}} className="color-gl-light-red">Select a charity</p>}
		</div>
	</div>;
};

const TabStats = () => {
	//<StatCard md={6} number={35} label="Tokens gained"/>

	let tabsOpened = getTabsOpened();
	if (tabsOpened && tabsOpened.error) tabsOpened="Something went wrong :(";

	let daysWithGoodLoop = getDaysWithGoodLoop();
	if (daysWithGoodLoop && daysWithGoodLoop.error) daysWithGoodLoop="Something went wrong :(";

	let weeklyAvg = getTabsWeeklyAverage();
	if (weeklyAvg && weeklyAvg.error) weeklyAvg="Something went wrong :(";

	return (
		<Row>
			<StatCard md={4} number={daysWithGoodLoop !== null ? daysWithGoodLoop : "-"} label="Days with Good-Loop"/>
			<StatCard md={4} number={tabsOpened !== null ? tabsOpened : "-"} label="Tabs opened"/>
			<StatCard md={4} number={weeklyAvg !== null ? weeklyAvg : "-"} label="Weekly tab average"/>
		</Row>
	);
};

/** Search box -- for what?? Charity search and Ecosia web search are probably best kept separate. */
const Search = ({onSubmit, placeholder}) => {
	return (<>
		<Form onSubmit={onSubmit} inline className="flex-row tab-search-form px-2" >
			<PropControl placeholder={placeholder} type="search" prop="q" path={['widget', 'search']} className="flex-grow w-100" /><i className="fa fa-search tab-search mr-2" onClick={onSubmit}/>
		</Form>
	</>);
};

/*
 * Fetch the number of tabs opened by the user.
 * Returns null if no value i.e. loading.
 * Returns the pvValue itself on error - an error can be tested for by checking if (val.error)
 */
const getTabsOpened = () => {
	if (!Login.isLoggedIn()) return null;
	// Get tabs opened stat from profiler
	let pvValue = DataStore.fetch(['misc','stats','tabopens'], () => {
		const trkreq = {
			q: "user:"+Login.getId(),
			name: "tabopens",
			dataspace: 'gl',
			start: 0 // all time (otherwise defaults to 1 month)
		}; // ??future, end, breakdowns: [byHostOrAd]};				
		return ServerIO.getDataLogData(trkreq);
	});
	if (pvValue.error) return pvValue;
	if (!pvValue.value) return null;
	return pvValue.value.all.count;
};

const getTabsWeeklyAverage = () => {
	// TODO fill in backend!!
	return 54;
};

const getDaysWithGoodLoop = () => {
	// TODO fill in backend!!
	return 16;
};

const getSelectedCharity = () => {
	// TODO fill in backend!!
	return null;//"battersea-dogs-and-cats-home";
};

const selectCharity = (charity) => {
	// TODO fill in backend!!
};

const deselectCharity = (charity) => {
	// TODO fill in backend!!
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

export { getTabsOpened, Search, getSelectedCharity };
export default TabsForGoodSettings;
