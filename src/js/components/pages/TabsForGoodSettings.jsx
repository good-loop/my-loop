import React from 'react';
import Login from 'you-again';
import { Col, Row } from 'reactstrap';
import { space } from '../../base/utils/miscutils';
import DataStore from '../../base/plumbing/DataStore';
import ServerIO from '../../plumbing/ServerIO';


const TabsForGoodSettings = () => {
	return <>
		<h1>Your stats</h1>
		<TabStats/>
		<h1>Pick your charity</h1>
	</>;
};

const CharityPicker = () => {

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

const StatCard = ({md, lg, xs, number, label, className, padding, children}) => {
	return <Col md={md} lg={lg} xs={xs} className={space("stat-card", className)} style={{padding:(padding || "20px")}}>
		<div className="stat-content w-100 h-100 p-4 bg-gl-pink color-gl-red text-center">
			<h1>{number}</h1>
			<p style={{marginBottom: 0}}>{label}</p>
			{children}
		</div>
	</Col>;
};

export default TabsForGoodSettings;
