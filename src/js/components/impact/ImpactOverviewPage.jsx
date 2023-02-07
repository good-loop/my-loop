
import React, { useEffect, useState } from 'react';
import PromiseValue from '../../base/promise-value';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { Button, Col, Container, InputGroup, Row, Card, Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropControl from '../../base/components/PropControl';
import Circle from '../../base/components/Circle';
import BG from '../../base/components/BG';
import { getLogo, space, stopEvent, uniq } from '../../base/utils/miscutils';
import { modifyPage } from '../../base/plumbing/glrouter';
import DynImg from '../../base/components/DynImg';
import NavBars from './ImpactNavBars';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop } from './GLCards';
import FilterAndAccountTopBar from './FilterAndAccountTopBar'

export class ImpactFilters {
	agency;
	brand;
	brand2;
	campaign;
	cid;
	/** charity ID */
	ngo;
	impactdebit;
	start;
	end;
	status;
	q;
}

/*<LeftSidebar>
			<div>
				<C.A href={modifyPage(["ihub"], null, true)}>Overview</C.A>
			</div>
			<div>
			<C.A href={modifyPage(["istory"], null, true)}>Story</C.A>
			</div>
			<div>
			<C.A href={modifyPage(["istat"], null, true)}>Stats</C.A>
			</div>
		</LeftSidebar>*/

const ImpactOverviewPage = () => {

	useEffect (() => {
		//setNavProps(focusItem)
		let windowTitle = space("Impact Overview");
		setWindowTitle(windowTitle);
	}, []);

	return (
	<div className="d-flex flex-column justify-content-between"  id="impact-overview-container">
	<FilterAndAccountTopBar size="mobile"/>  {/*mobile topbar*/}	
		<div className="d-flex flex-row justify-content-between"  id="impact-overview-container">
		<NavBars active={"overview"}/>
		<Container fluid className='iview-container'>
			<div className='d-flex flex-column justify-content-between'>
			<FilterAndAccountTopBar size="desktop"/>  {/*widescreen topbar*/}
			<GLHorizontal>

				{/* first grid half */}
				<GLVertical>
					{/* top left corner - both top corners with basis 60 to line up into grid pattern*/}
					<GLCard basis={60}>
						<h2>NESTLE DONATED</h2>
						<h1>£A BAJILLION</h1>
					</GLCard>

					{/* bottom left corner */}
					<GLHorizontal>
						<GLCard>
							<h2>Watch to donate</h2>
						</GLCard>
						<GLCard>
							<h2>This ad does good</h2>
						</GLCard>
					</GLHorizontal>

					<GLModalCard id="left-half"/>
				</GLVertical>

				{/* second grid half */}
				<GLVertical>

					{/* top right corner */}
					<GLHorizontal collapse="md" basis={60}>
						<GLVertical>
							<GLHorizontal>
								<GLCard modalContent={<p>9 brands!! wow!!</p>} modalTitle="9 Brands" modalId="right-half">
									<p>9 BRANDS</p>
								</GLCard>
								<GLCard modalContent={<CharityList/>} modalTitle="18 charities" modalId="right-half">
									<p>18 CHARITIES</p>
								</GLCard>
							</GLHorizontal>
							<GLCard basis={10}>
								<h2>16 CAMPAIGNS</h2>
							</GLCard>
							<GLCard basis={10}>
								<h2>6.5M VIEWS | 5 COUNTRIES</h2>
							</GLCard>
							<GLCard>
								<h2>8.69T CO2E OFFSET</h2>
							</GLCard>
						</GLVertical>
						<GLCard>
							<h2>Ads for good by Good Loop</h2>
							<p>Hello</p>
							<p>Hello</p>
							<p>Hello</p>
							<p>Hello</p>
							<p>Hello</p>
						</GLCard>
					</GLHorizontal>
					
					{/* bottom right corner */}
					<GLCard modalContent={<p>ADSSSSSSS</p>} modalTitle="Ads" modalId="full-page">
						<h1>LOOK! AN AD!</h1>
					</GLCard>

					<GLModalCard id="right-half"/>
				</GLVertical>

				<GLModalCard id="full-page"/>
			</GLHorizontal>
			</div>
		</Container>

		<GLModalBackdrop/>
	</div>
	</div>
	);
};


const CharityList = () => {
	
	const charities = ["charity","charity","charity","charity","charity","charity","charity","charity"];

	return <Row>
		{charities.map((charity, i) => <Col md={4} className="mt-3">
			<GLCard noMargin modalContent={<CharityInfo cid={i}/>} modalTitle={charity} modalId="left-half">
				{charity}
			</GLCard>
		</Col>)}
	</Row>;
}

const CharityInfo = ({cid}) => {
	return <h1>This is a charity!! {cid}</h1>
}


const ItemButton = ({ item }) => {
	let key = getType(item).toLowerCase(); // e.g. advertiser or ngo
	let value = getId(item);
	let logo = getLogo(item);
	// NB: tried putting dev-only PortalLinks here but it was fugly
	return <Button className="btn-tile m-2" color="outline-dark"
		onClick={e => stopEvent(e) && modifyPage(["istory"], { [key]: value })} >
		{logo && <img src={logo} className={space('rounded logo logo-lg')} />}<p>{item.name}</p>
	</Button>;
};

export const HeadlineDonationCard = ({ brand, impactdebit, charity, filters }) => {
	if (!brand) {
		return <Misc.Loading />
	}
	let logo = getLogo(brand);
	if (!logo) {
		logo = getLogo(impactdebit);
	}
	if (!logo && charity) {
		logo = getLogo(charity);
		if (!logo) {
			let images = NGO.images(charity);
			logo = images[0];
		}
	}
	let branding = Branding.get(brand);
	let image = branding?.backgroundImage || impactdebit?.impact?.img || "/img/ihub/world-hand.png";

	let pvImpactDebits = getImpactDebits({ filters });
	let moneys = pvImpactDebits.value && List.hits(pvImpactDebits.value).map(item => Impact.amount(item.impact)).filter(x => x);
	let totalMoney = moneys && Money.total(moneys, "GBP");

	return (<BG style={{ height: '30vh', width: '30vh', margin: "auto" }} image={image} color="#3488AB" >
		<Circle color="white" width="100%" height="100%" center>
			{logo ? <img className="logo logo-xl center m-auto" src={logo} /> : <h3>{brand?.name}</h3>}
			<h2 style={{ textAlign: "center" }}>{totalMoney && <Misc.Money amount={totalMoney} />} Donated</h2>
			<PortalLink item={brand} size="small" devOnly />
		</Circle>
	</BG>);
};

const PhotoWall = ({ filters }) => {
	let pvImpactDebits = getImpactDebits({ filters });
	if (!pvImpactDebits.resolved) return <Misc.Loading />
	let impactdebits = List.hits(pvImpactDebits.value);
	console.log("IMPACT DEBITS", pvImpactDebits)
	let images = impactdebits ? impactdebits.map(i => i.impact?.img).filter(x => x) : [];
	images = images.slice(0, 3);
	return images.map(img => <DynImg key={img.contentUrl || img} image={img} className="w-100" />);
};

export default ImpactOverviewPage;
