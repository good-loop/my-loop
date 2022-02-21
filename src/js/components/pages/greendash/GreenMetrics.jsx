import React from 'react';
import { Col, Container, Row } from 'reactstrap';

const GreenCard = ({ header, children }) => {
	return <div className="green-card">
		<div className="gc-header">{header}</div>
		<div className="gc-body">{children}</div>
	</div>
};


const CO2Card = ({}) => {
	return <GreenCard header="How much carbon is your digital advertising emitting?">

	</GreenCard>;
};


const JourneyCard = ({}) => {
	return <GreenCard header="Your journey so far">

	</GreenCard>;
};


const CompareCard = ({}) => {
	return <GreenCard header="How do your ad emissions compare?">

	</GreenCard>;
};


const BreakdownCard = ({}) => {
	return <GreenCard header="What is the breakdown of your emissions?">

	</GreenCard>;
};


const TimeOfDayCard = ({}) => {
	return <GreenCard header="When are your ad carbon emissions highest?">

	</GreenCard>;
};


const CTACard = ({}) => {
	return <GreenCard header="Interested to know more about climate positive advertising?">

	</GreenCard>;
};


const GreenMetrics = ({}) => {
	return (
		<div className="green-subpage green-metrics">
			<Container>
				<Row>
					<Col md="8">
						<CO2Card />
					</Col>
					<Col md="4">
						<JourneyCard />
					</Col>
				</Row>
				<Row>
					<Col md="4">
						<CompareCard />
					</Col>
					<Col md="4">
						<BreakdownCard />
					</Col>
					<Col md="4">
						<TimeOfDayCard />
						<CTACard />
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default GreenMetrics;
