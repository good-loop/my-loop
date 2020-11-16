import React, { useState, useEffect, useRef } from 'react';
import Login from 'you-again';
import { Col, Row, Form } from 'reactstrap';
import { space, yessy } from '../../base/utils/miscutils';
import DataStore from '../../base/plumbing/DataStore';
import ServerIO from '../../plumbing/ServerIO';
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
		<p className="w-50">Select a charity and we will send them all the money that your Tabs for Good are generating. You can change your selection at any time.</p>
		<br/><br/>
		<CharityPicker/>
	</>;
};

const CharityPicker = () => {
	const [charities, setCharities] = useState([]);

	let charityLogos = [];

	// Parse CSV from donations tracker into json
	if (!yessy(charities)) {
		fetchAllCharityIDs().then(chars => setCharities(chars)).catch(status => console.error("Failed to get donation tracker CSV! Status: " + status));
	} else {
		let chars = fetchAllCharities(charities);
		// Get logo charities
		charityLogos = chars.filter(c => c.logo);
	}

	const selectedCharity = {
		id: "battersea-dogs-and-cats-home",
		logo: "https://www.battersea.org.uk/sites/all/themes/battersea_theme/images/logo.png",
		url: "https://www.battersea.org.uk/"
	};//fetchCharity(getSelectedCharity());

	return <div className="tabs-for-good-settings">
		<p>Your selected charity:</p>
		{selectedCharity ?
			<div className="col-md-3">
				<CharitySelectBox charity={selectedCharity} deselect do3d/>
			</div>
			: <b>Pick a charity!</b>}
		<div className="py-5"/> {/* spacer */}
		<div className="flex-row justify-content-between unset-margins mb-3">
			<p>Can't see your favourite charity? Search for it:</p>
			<Form onSubmit={e => e.preventDefault()} inline className="flex-row tab-search-form" >
				<i className="fa fa-search tab-search mr-2"/><PropControl type="search" prop="q" path={['widget', 'search']} className="flex-grow w-100" />
			</Form>
		</div>
		<Paginator rows={4} cols={5} rowsMD={2} colsMD={5} pageButtonRangeMD={1} displayCounter displayLoad>
			{charityLogos.map(c => <div className="p-3 d-flex justify-content-center align-items-center">
				<CharitySelectBox charity={c} do3d do3dPadding={25}/>
			</div>)}
		</Paginator>
	</div>;
};

// TODO charity selection backend!!
/**
 * Show a selectable charity in the charity list
 * @param charity the charity to show
 * @param deselect show a deselect button instead of a select one
 * @param do3d activate the 3d mouse follow effect
 * @param do3dPadding override width of div that captures the mouse for tracking on 3d effects
 */
const CharitySelectBox = ({charity, deselect, do3d, do3dPadding}) => {

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

	const padAmount = do3dPadding || 150;

	return <div className={do3d ? "container-3d" : ""} ref={container3d}
		style={do3d ? {paddingLeft:padAmount, paddingRight:padAmount, marginLeft:-padAmount, marginRight:-padAmount} : null}
		onMouseMove={do3d ? on3dMouseMove : null}
		onMouseEnter={do3d ? on3dMouseEnter : null}
		onMouseLeave={do3d ? on3dMouseLeave : null}
	>
		<div style={style} 
			className={space("charity-select-box flex-column justify-content-center align-items-center unset-margins p-3 position-relative", do3d ? "do3d" : "")}
		>
			<CharityLogo charity={charity} key={charity.id} style={{width: "100%", transform: `translateZ(${elementHeight}px)`}} className="p-2 mb-5 mt-5 w-75"/>
			{deselect ? <a className="btn btn-primary thin position-absolute" style={{bottom:20, left:"50%", transform:"translateX(-50%)"}}>Deselect</a>
				: <a className="btn btn-transparent fill thin position-absolute" style={{bottom:20, left:"50%", transform:"translateX(-50%)"}}>Select</a>}
			<a className="position-absolute" style={{top: 10, right: 10}} href={charity.url} target="_blank" rel="noreferrer">About</a>
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

/*
 * Fetch the number of tabs opened by the user.
 * Returns null if no value i.e. loading.
 * Returns the pvValue itself on error - an error can be tested for by checking if (val.error)
 */
const getTabsOpened = () => {
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
	return "battersea-dogs-and-cats-home";
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

export { getTabsOpened };
export default TabsForGoodSettings;
