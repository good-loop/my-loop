import React, { useEffect, useState, useRef } from 'react';
import { useTransition, animated, useSpring } from 'react-spring';
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
import { fetchCharity } from '../pages/MyCharitiesPage'
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import ActionMan from '../../plumbing/ActionMan';
import C from '../../C';
import NGOImage from '../../base/components/NGOImage';
import AdvertsCatalogue from '../campaignpage/AdvertsCatalogue';
import { getDataItem } from '../../base/plumbing/Crud';
import KStatus from '../../base/data/KStatus';
import Misc from '../../base/components/Misc';
import List from '../../base/data/List';
import ListLoad from '../../base/components/ListLoad';

/**
 * DEBUG OBJECTS
 */

 import {TEST_CHARITY, TEST_CHARITY_OBJ, TEST_BRAND, TEST_BRAND_OBJ, TEST_CAMPAIGN, TEST_CAMPAIGN_OBJ} from './TestValues';

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

	let [isNavbarOpen, setIsNavbarOpen] = useState(false)

	const navToggleAnimation = useSpring({
		width : isNavbarOpen ? "270px" : "90px",	// shrink navbar
	})

	return (
	<>
		<div className="navbars-overlay">
			<NavBars active={"overview"} setIsNavbarOpen={setIsNavbarOpen}/>
			<FilterAndAccountTopBar size="mobile"/>  {/*mobile topbar*/}
			<FilterAndAccountTopBar size="desktop" setIsNavbarOpen={setIsNavbarOpen}/>  {/*widescreen topbar*/}
		</div>
		<Container fluid className='iview-container pr-md-5'>
			<animated.div id='in-flow-navbar' style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}}></animated.div>
				<GLHorizontal>
					{/* first grid half */}
					<GLVertical>
						{/* top left corner - both top corners with basis 60 to line up into grid pattern*/}
						<GLCard basis={60} className="hero-card">
							<div className='white-circle'>
								<div className='content'>
									<img className='logo' src={TEST_BRAND_OBJ.branding.logo}/>
									<br/>
									<h1>£A BAJILLION</h1>
									<h2>Donated</h2>
									<br/>
									<h5>With</h5>
									<br/>
									<img className='w-50' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
								</div>
							</div>
						</GLCard>

						{/* bottom left corner */}
						<GLHorizontal>
							<GLCard>
								<h2>Watch to donate</h2>
							</GLCard>
							<GLCard modalContent={ThisAdDoesGoodModal} modalTitle="This Ad Does Good" modalId="full-page" modalClassName="no-padding">
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
									<GLCard modalContent={BrandList} modalTitle="9 Brands" modalId="right-half" modalClassName="list-modal">
										<h2>9</h2>
										<h3>Brands</h3>
									</GLCard>
									<GLCard modalContent={CharityList} modalTitle="18 charities" modalId="right-half" modalClassName="list-modal" className="center-number">
										<h2>18</h2>
										<h3>Charities</h3>
									</GLCard>
								</GLHorizontal>
								<GLCard basis={10} modalContent={CampaignList} modalTitle="16 Campaigns" modalClassName="list-modal" modalId="right-half">
									<h3>16 CAMPAIGNS</h3>
								</GLCard>
								<GLCard basis={10}>
									<h3>6.5M VIEWS | 5 COUNTRIES</h3>
								</GLCard>
								<GLCard noPadding className="offset-card" basis={0} modalId="right-half" modalTitle="8.69T CO2E Offset" modalHeader={CO2OffsetInfoHeader} modalContent={CO2OffsetInfo} modalClassName="no-header-padding co2-offset">
									<div className='offset-number'>
										<h3>8.69T CO2E OFFSET</h3>
									</div>
									<div className='carbon-neutral px-5 py-2'>
										<img src="/img/Impact/Good-Loop_CarbonNeutralAd_Logo_Final-05.svg" className='w-100'/>
									</div>
								</GLCard>
							</GLVertical>
							<GLCard modalId="right-half" modalTitle="Ads for good" modalHeader={AdsForGoodCTAHeader} modalContent={AdsForGoodCTA} modalClassName="no-header-padding ads-for-good">
								<div className='d-flex flex-column align-items-stretch justify-content-between h-100'>
									<img className='w-75 align-self-center mb-3' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
									<ContentList/>
								</div>
							</GLCard>
						</GLHorizontal>
						
						{/* bottom right corner */}
						<GLCard modalContent={AdsCatalogueModal} modalId="full-page" modalClassName="ads-catalogue-modal">
							<AdsCatalogueModal noPreviews/>
						</GLCard>

						<GLModalCard id="right-half"/>
					</GLVertical>

					<GLModalCard id="full-page"/>
				</GLHorizontal>

		</Container>

		<GLModalBackdrop/>
	</>
	);
};

const ThisAdDoesGoodModal = () => {
	return <div className="bg-gl-background-default h-100">
		<GLCard className="m-5">
		</GLCard>
	</div>;
}

const ContentList = () => {

	const content = {
		"Watch To Donate": true,
		"This Ad Does Good": true,
		"Green Ad Tag": true,
		"Engage To Donate": false,
		"This Ad Supports Local": false
	};

	const contentRenderable = Object.keys(content).map(title => { return {title, tick:content[title]}})

	return <>
		{contentRenderable.map(c => <Row>
			<Col xs={3}>
				<img src={"/img/mydata/" + (c.tick ? "circle-tick.svg" : "circle-no-tick.svg")} className='logo'/>
			</Col>
			<Col xs={9} className="d-flex flex-column align-items-start justify-content-center">
				<h5 className='text-left'>{c.title}</h5>
			</Col>
		</Row>)}
	</>;
}

const AdsCatalogueModal = ({noPreviews}) => {

	const status = KStatus.PUB_OR_ARC;
	const pvCampaign = getDataItem({type:C.TYPES.Campaign,status,id:TEST_CAMPAIGN});
	if (!pvCampaign.value) return <Misc.Loading/>
	const pvAds = Campaign.pvAds({campaign: pvCampaign.value, status});
	if (!pvAds.value) return <Misc.Loading/>

	const ads = List.hits(pvAds.value) || [];

	return <>
		<AdvertsCatalogue
			campaign={pvCampaign.value}
			ads={ads}
			canonicalAds={ads} // maybe wrong should be all ads
			noPreviews={noPreviews}
		/>
	</>;

};

const AdsForGoodCTAHeader = () => {
	return <div className='bg-gl-impact-red pt-5 position-relative'>
		<img src="/img/curves/curve-white.svg" className='w-100'/>
		<img src="/img/Impact/images-combined.png" className='header-overlay'/>
	</div>;
};

const AdsForGoodCTA = () => {
	const vertiser = TEST_BRAND_OBJ;
	
	return <div className='d-flex flex-column align-items-center justify-content-between h-100'>
		<img src={vertiser.branding.logo} className="logo"/>
		<img className='w-25' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
		<h3>Discover our products and fund even more good causes</h3>
		<Button color="primary">Get in touch</Button>
	</div>
};

const CO2OffsetInfoHeader = () => {
	return <div className='bg-co2-offset pt-5 position-relative'>
		<img src="/img/curves/curve-white.svg" className='w-100'/>
		<img src="/img/green/hummingbird.png" className='header-overlay'/>
	</div>;
};

const CO2OffsetInfo = () => {
	const vertiser = TEST_BRAND_OBJ;

	return <div className='d-flex flex-column align-items-center justify-content-between h-100'>
		<img src={vertiser.branding.logo} className="logo"/>
		<img className='w-25' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
		<h4>Info about Green Ad Tag</h4>
		<h4>Info about Offset Project</h4>
		<h4>Cost of Offset - it only cost £X to offset</h4>
		<Button color="primary">Download offset certificate</Button>
	</div>
}

const BrandListItem = ({ type, item, checkboxes, canDelete, nameFn, extraDetail, button}) => {

	console.log(item);

	return <Col md={4} className="mt-3">
		<GLCard className="preview h-100" noMargin>
			
			{item && item.branding?.logo && <img src={item.branding.logo} className="logo"/>}
			<p className='text-center'>{item.name}</p>
		</GLCard>
	</Col>;

}

const BrandList = () => {

	const vertiser = TEST_BRAND;

	return <>
		<br/>
		<h5>Brands donating via Good-Loop Ads</h5>
		<p className='color-gl-red text-center'>{TEST_BRAND_OBJ.name} - All Campaigns</p>
		<br/>
		<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
				q={SearchQuery.setProp(null, "parentId", vertiser).query}
				ListItem={BrandListItem} unwrapped className="row"/>
	</>;
};

const CharityList = () => {
	
	// DUMMY DATA
	const charity = TEST_CHARITY_OBJ;
	let charities = [];
	for (let i = 0; i < 20; i++) charities.push(charity);
	// END DUMMY DATA

	return <>
		<br/>
		<h5>Charities supported via Good-Loop Ads</h5>
		<p className='color-gl-red text-center'>{TEST_BRAND_OBJ.name} - All Campaigns</p>
		<br/>
		<Row>
			{charities.map((charity, i) => <Col key={i} md={4} className="mt-3">
				<GLCard className="preview h-100" noMargin
					modalContent={() => <CharityInfo charity={charity}/>}
					modalHeader={() => <CharityHeader charity={charity}/>}
					modalHeaderImg={charity.images}
					modalClassName="charity-info"
					modalId="left-half">
					
					{charity && <CharityLogo charity={charity}/>}
					<p className='text-center'>{NGO.displayName(charity)}</p>
				</GLCard>
			</Col>)}
		</Row>
	</>;
}

const CharityHeader = ({charity}) => {
	return <div className='w-100 position-relative'>
		<div className="white-circle">
			<CharityLogo charity={charity}/>
		</div>
	</div>
}

const CharityInfo = ({charity}) => {
	return <div className='d-flex flex-column justify-content-center align-items-center charity-body'>
		<h3>{NGO.displayName(charity)}</h3>
		<img className='w-25' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
		<br/>
		<p className='p-5'>
			{NGO.extendedDescription(charity) || NGO.anyDescription(charity)}
		</p>
	</div>;
}


const CampaignList = () => {

	// DUMMY DATA
	const campaign = TEST_CAMPAIGN_OBJ;
	let campaigns = [];
	for (let i = 0; i < 20; i++) campaigns.push(campaign);
	// END DUMMY DATA

	return <>
		<br/>
		<h5>Campaigns run via Good-Loop Ads</h5>
		<p className='color-gl-red text-center'>{TEST_BRAND_OBJ.name} - All Campaigns</p>
		<br/>
		<GLVertical>
			{campaigns.map((campaign, i) => <GLCard className="preview campaign mt-3" noMargin>
				<div className='campaign-details'>
					<p className='text-left m-0'>
						<b>{campaign.vertiserName}</b>
						<br/>
						{campaign.name}
					</p>
				</div>
				{campaign && <img className="logo" src={TEST_BRAND_OBJ.branding.logo}/>}
			</GLCard>)}
		</GLVertical>
	</>;
	
};

export default ImpactOverviewPage;
