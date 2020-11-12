import React from 'react';
import { Col, Row } from 'reactstrap';
import { space } from '../../base/utils/miscutils';

const TabsForGoodSettings = () => {
	return <TabStats/>;
};

const TabStats = () => {
	//<StatCard md={6} number={35} label="Tokens gained"/>
	return (
		<Row>
			<StatCard md={3} number={5} label="Tabs Opened"/>			
		</Row>
	);
};

const StatCard = ({md, lg, xs, number, label, className, padding, children}) => {
	return <Col md={md} lg={lg} xs={xs} className={space("stat-card bg-white", className)} style={{padding:(padding || "5px")}}>
		<div className="stat-content w-100 h-100 p-3">
			<h1>{number}</h1>
			<p>{label}</p>
			{children}
		</div>
	</Col>;
};

export default TabsForGoodSettings;
