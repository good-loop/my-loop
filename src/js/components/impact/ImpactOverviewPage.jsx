import React, { useEffect, useState, useRef } from 'react';
import { useTransition, animated, useSpring } from 'react-spring';
import PromiseValue from '../../base/promise-value';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { Button, Col, Container, InputGroup, Row, Card, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Card as CardCollapse } from '../../base/components/CardAccordion';
import PropControl from '../../base/components/PropControl';
import Circle from '../../base/components/Circle';
import BG from '../../base/components/BG';
import { getLogo, space, stopEvent, uniq } from '../../base/utils/miscutils';
import { modifyPage } from '../../base/plumbing/glrouter';
import DynImg from '../../base/components/DynImg';
import NavBars from './ImpactNavBars';
import ImpactLoginCard from './ImpactLogin';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop } from './GLCards';
import ImpactFilterOptions from './ImpactFilterOptions'
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
import Campaign from '../../base/data/Campaign';

/**
 * DEBUG OBJECTS
 */

 import {TEST_CHARITY, TEST_CHARITY_OBJ, TEST_BRAND, TEST_BRAND_OBJ, TEST_CAMPAIGN, TEST_CAMPAIGN_OBJ} from './TestValues';
import Login from '../../base/youagain';
import AccountMenu from '../../base/components/AccountMenu';

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


const fetchBaseObjects = () => {
	const path = DataStore.getValue(['location', 'path']);

	if (path.length < 3) throw new Error("Invalid URL");

	const status = DataStore.getUrlValue('gl.status') || DataStore.getUrlValue('status') || KStatus.PUBLISHED;

	const itemId = path[2];
	const itemType = path[1];

	let pvCampaign, campaign;
	let pvBrand, brand, brandId;
	let pvMasterBrand, masterBrand;
	let pvSubBrands, subBrands;
	let pvSubCampaigns, subCampaigns;

	// Fetch campaign object if specified
	if (itemType === "campaign") {
		pvCampaign = getDataItem({type: C.TYPES.Campaign, status, id:itemId});
		campaign = pvCampaign.value;
		if (pvCampaign.error) throw pvCampaign.error;
		// If we have a campaign, use it to find the brand
		brandId = campaign?.vertiser;
	} else if (itemType === "brand") {
		// Otherwise use the URL
		brandId = itemId;
	}

	if (brandId) {
		// Find the specified brand
		pvBrand = getDataItem({type: C.TYPES.Advertiser, status, id:brandId});
		brand = pvBrand.value;
		if (pvBrand.error) throw pvBrand.error;
		if (brand && brand.parentId) {
			// If this brand has a parent, get it
			pvMasterBrand = getDataItem({type: C.TYPES.Advertiser, status, id:brand.parentId});
			masterBrand = pvMasterBrand.value;
			if (pvMasterBrand.error) throw pvMasterBrand.error;
		}
		// Find any subBrands of this brand (technically brands should only have a parent OR children - but might be handy to make longer brand trees in future)
		let sq = SearchQuery.setProp(null, "parentId", brandId);
		pvSubBrands = ActionMan.list({type: C.TYPES.Advertiser, status:KStatus.PUBLISHED, q:sq.query});
		subBrands = pvSubBrands.value && List.hits(pvSubBrands.value);
		if (pvSubBrands.error) throw pvSubBrands.error;
		// Don't look for subCampaigns if this is a campaign
		if (!campaign) {
			// Find all related campaigns to this brand
			pvSubCampaigns = Campaign.fetchForAdvertiser(brandId, status);
			subCampaigns = pvSubCampaigns.value && List.hits(pvSubCampaigns.value);
		}
	}

	// Simplifies having to add null checks for subBrands everywhere
	if (!subBrands) subBrands = [];
	if (!subCampaigns) subCampaigns = [];

	// If we've looked for both brand and campaign and found nothing, we have a 404
	if (pvCampaign && pvCampaign.resolved && !campaign
		&& pvBrand && pvBrand.resolved && !brand) {
		throw new Error("404: Not found");
	}

	const resolved = (!pvCampaign || pvCampaign.resolved) &&
					(!pvBrand || pvBrand.resolved) &&
					(!pvMasterBrand || pvMasterBrand.resolved) &&
					(!pvSubBrands || pvSubBrands.resolved) &&
					(!pvSubCampaigns || pvSubCampaigns.resolved);

	return {campaign, brand, masterBrand, subBrands, subCampaigns, resolved};
}


const ImpactOverviewPage = () => {

	useEffect (() => {
		//setNavProps(focusItem)
		let windowTitle = space("Impact Overview");
		setWindowTitle(windowTitle);
	}, []);

	// shrinking / expanding navbar animation values
	let [isNavbarOpen, setIsNavbarOpen] = useState(false)
	const navToggleAnimation = useSpring({
		width : isNavbarOpen ? "270px" : "90px",
	})
	// if not logged in, use may select GreenDash instead.
	// set to true to avoid this choice being made on page refresh if logged in 
	let [impactChosen, setImpactChosen] = useState(true)

	let baseObjects;

	try {
		baseObjects = fetchBaseObjects();
	} catch (e) {
		console.error(e)
		return <ErrorDisplay e={e}/>
	}

	const {campaign, brand, masterBrand, subBrands, subCampaigns, resolved} = baseObjects;
	
	if(! resolved) {
		return <p> loading screen goes here soon hopefully</p>
	}

	// if not logged in AND impact hasn't been chosen yet...
	if(!Login.isLoggedIn() || !impactChosen) {
		return <ImpactLoginCard choice={impactChosen} setChoice={setImpactChosen} masterBrand={TEST_BRAND_OBJ}/>
	}

	return (
	<>
		<div className="navbars-overlay">
			{/*<ImpactFilterOptions size="thin"/>  {/*mobile horizontal filters topbar*/}
			<NavBars active={"overview"} setIsNavbarOpen={setIsNavbarOpen}/>
			<ImpactFilterOptions size="wide" setIsNavbarOpen={setIsNavbarOpen} masterBrand={masterBrand} brand={brand} campaign={campaign}/>  {/*widescreen vertical filters topbar*/}
		</div>
		<div className='iview-positioner pr-md-1'>
			<Container fluid className='iview-container'>
				<animated.div id='in-flow-navbar' style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}}></animated.div>
				<GLVertical>
					<GLHorizontal collapse="md" className="iview-grid">
						{/* first grid half */}
						<GLVertical>
							{/* top left corner - both top corners with basis 60 to line up into grid pattern*/}
							<GLCard basis={60} className="hero-card">
								<div className='white-circle'>
									<div className='content'>
										<img className='logo' src={(brand?.branding)?.logo}/>
										<br/>
										<h1>£A BAJILLION</h1>
										<h2>Donated</h2>
										<br/>
										<h5>With</h5>
										<br/>
										<img className='w-50' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
									</div>
								</div>
								<GLModalCard id="hero-card-modal" />
							</GLCard>

							{/* bottom left corner */}
							<GLHorizontal>
								<GLCard className="ad-boast" modalContent={WatchToDonateModal} modalTitle="Watch To Donate" modalId="full-page" modalClassName="no-padding watch-to-donate">
									<h3>Watch to donate</h3>
									<h2>£333,203</h2>
									<h3 className="text-bold">Donated...</h3>

									<h5>INCLUDING</h5>

									<h4>15,000 Trees Planted</h4>
									<CharityLogo charity={TEST_CHARITY_OBJ}/>

									<h4>10,012 Children's Meals</h4>
									<CharityLogo charity={TEST_CHARITY_OBJ}/>

									<QuestionIcon/>
								</GLCard>
								<GLCard className="ad-boast" modalContent={ThisAdDoesGoodModal} modalTitle="This Ad Does Good" modalId="full-page" modalClassName="no-padding this-ad-does-good">
									<h3 className="color-greenmedia-darkcyan">This ad does good</h3>
									<h2 className="color-greenmedia-darkcyan">136,580</h2>
									<h3 className="color-greenmedia-darkcyan text-bold">Trees planted...</h3>

									<img src={TEST_BRAND_OBJ.branding.logo} className="logo"/>
									<CharityLogo charity={TEST_CHARITY_OBJ}/>
									<QuestionIcon/>
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
										{subBrands.length ? <GLCard modalContent={() => <BrandList brand={brand}/>} modalTitle={subBrands.length + " Brands"} modalId="right-half" modalClassName="list-modal" className="center-number">
											<h2>{subBrands.length}</h2>
											<h3>Brands</h3>
										</GLCard> : null}
										<GLCard modalContent={CharityList} modalTitle="18 charities" modalId="right-half" modalClassName="list-modal" className="center-number">
											<h2>18</h2>
											<h3>Charities</h3>
										</GLCard>
									</GLHorizontal>
									{subCampaigns.length ? <GLCard basis={10} modalContent={() => <CampaignList brand={brand} subBrands={subBrands} campaigns={subCampaigns}/>} modalTitle={subCampaigns.length + " Campaigns"} modalClassName="list-modal" modalId="right-half">
										<h3>{subCampaigns.length} CAMPAIGNS</h3>
									</GLCard> : null}
									<GLCard basis={10}>
										<h3>6.5M VIEWS | 5 COUNTRIES</h3>
									</GLCard>
									<GLCard noPadding className="offset-card" basis={0} modalId="right-half" modalTitle="8.69T CO2E Offset" modalHeader={CO2OffsetInfoHeader} modalContent={CO2OffsetInfo} modalClassName="no-header-padding co2-offset">
										<div className='offset-number px-3'>
											<h3>8.69T CO2E OFFSET</h3>
										</div>
										<div className='carbon-neutral px-5 py-2'>
											<img src="/img/Impact/Good-Loop_CarbonNeutralAd_Logo_Final-05.svg" className='w-100'/>
										</div>
									</GLCard>
								</GLVertical>
								<div>
									<GLCard modalId="right-half" modalTitle="Ads for good" modalHeader={AdsForGoodCTAHeader} modalContent={AdsForGoodCTA} modalClassName="no-header-padding ads-for-good">
										<div className='d-flex flex-column align-items-stretch justify-content-between h-100'>
											<img className='w-75 align-self-center mb-3' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
											<ContentList/>
										</div>
									</GLCard>
									<GLModalCard id="ads-for-good-modal" />
								</div>

							</GLHorizontal>
							
							{/* bottom right corner */}
							<GLCard modalContent={AdsCatalogueModal} modalId="full-page" modalClassName="ads-catalogue-modal">
								<AdsCatalogueModal noPreviews/>
							</GLCard>

							<GLModalCard id="right-half"/>
						</GLVertical>

						<GLModalCard id="full-page"/>
					</GLHorizontal>

					<GLCard className="logos-display">
						<LogosDisplay/>
					</GLCard>
				</GLVertical>
			</Container>


		</div>

		<GLModalBackdrop/>
	</>
	);
};

const ErrorDisplay = ({e}) => {

	const [showError, setShowError] = useState(false);

	let errorTitle = "Sorry, something went wrong :(";

	if (e.message.includes("404: Not found")) errorTitle = "404: We couldn't find that!"

	return <Container className='mt-5'>
		<h1>{errorTitle}</h1>
		<p>
			Check you have the correct URL. If you think this is a bug, please report it to support@good-loop.com
		</p>
		<CardCollapse title="Error" collapse={!showError} onHeaderClick={() => setShowError(!showError)}>
			<code>
				{e.message}
			</code>
		</CardCollapse>
	</Container>;
}

const LogosDisplay = () => {

	const BrandLogo = ({type, item, checkboxes, canDelete, nameFn, extraDetail, button}) => {
		return <Col md={1} xs={7} className="text-center">
			{item.branding?.logo ? <img src={item.branding.logo}/> : <p>{item.name}</p>}
		</Col>
	}

	const vertiserId = TEST_BRAND;
	const vertiser = TEST_BRAND_OBJ;

	return <>
		<h3>Advertising that's a force for good</h3>
		<br/><br/>
		<img src={vertiser.branding.logo} className="logo"/>
		<br/><br/>
		<img className='a4glogo' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
		<br/><br/><br/>
		<ListLoad status={KStatus.PUBLISHED} hideTotal type={C.TYPES.Advertiser}
				q={SearchQuery.setProp(null, "parentId", vertiserId).query}
				ListItem={BrandLogo} unwrapped className="row justify-content-center w-100"/>
	</>;

};

const QuestionIcon = () => {
	return <div className='question-icon'>
		?
	</div>
}

const ThisAdDoesGoodModal = () => {

	const vertiser = TEST_BRAND_OBJ;
	const charity = TEST_CHARITY_OBJ;

	return <div className="bg-gl-background-default inmodal-wrapper p-5">
		<GLCard className="inmodal-content" noPadding >
			<BG src="/img/Impact/curves-background.svg" className="py-5 img-bg">
				<h3 className='text-white'>1 This Ad Does Good Campaign</h3>
				<br/>
				<AdsCatalogueModal noPreviews />
				<br/>
				<Row className='text-center rates'>
					<Col xs={4}>
						<p>
							<b>XX%</b>
						</p>
						<p>Viewability rate</p>
					</Col>
					<Col xs={4}>
						<p>
							<b>XX%</b>
						</p>
						<p>Click through rate</p>
					</Col>
					<Col xs={4}>
						<p>
							<b>XX%</b>
						</p>
						<p>Completed view rate</p>
					</Col>
				</Row>
			</BG>
			<br/>
			<h3>136,283 Trees Planted</h3>
			<br/>
			<h5>SUPPORTING</h5>
			<br/><br/>
			<p className='text-center'>Reforestation projects in Madagascar, Kenya, and Mozambique</p>
			<br/>
			<Row className='w-50 mx-auto'>
				<Col xs={6} className="d-flex flex-row align-items-center justify-content-center">
					<img src={vertiser.branding.logo} className="logo"/>
				</Col>
				<Col xs={6} className="d-flex flex-row align-items-center justify-content-center">
					<CharityLogo charity={charity}/>
				</Col>
			</Row>
			<br/>
		</GLCard>
	</div>;
}

const WatchToDonateModal = () => {

	const vertiser = TEST_BRAND_OBJ;
	const charity = TEST_CHARITY_OBJ;

	return <div className="bg-gl-background-default inmodal-wrapper p-5">
		<GLCard className="inmodal-content" noPadding >
			<BG src="/img/Impact/curves-background.svg" className="py-5 img-bg">
				<h3 className='text-white'>15 Watch To Donate Campaigns</h3>
				<br/>
				<AdsCatalogueModal noPreviews />
				<br/>
				<Row className='text-center rates'>
					<Col xs={4}>
						<p>
							<b>XX%</b>
						</p>
						<p>Viewability rate</p>
					</Col>
					<Col xs={4}>
						<p>
							<b>XX%</b>
						</p>
						<p>Click through rate</p>
					</Col>
					<Col xs={4}>
						<p>
							<b>XX%</b>
						</p>
						<p>Completed view rate</p>
					</Col>
				</Row>
			</BG>
			<br/>
			<h3>£136,283 Donated</h3>
			<br/>
			<h5>INCLUDING</h5>
			<br/><br/>
			<p className='text-center'>Reforestation projects in Madagascar, Kenya, and Mozambique</p>
			<br/>
			<Row className='w-50 mx-auto'>
				<Col xs={6} className="d-flex flex-row align-items-center justify-content-center">
					<img src={vertiser.branding.logo} className="logo"/>
				</Col>
				<Col xs={6} className="d-flex flex-row align-items-center justify-content-center">
					<CharityLogo charity={charity}/>
				</Col>
			</Row>
			<br/>
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

const BrandList = () => {

	const BrandListItem = ({ type, item, checkboxes, canDelete, nameFn, extraDetail, button}) => {
		return <Col md={4} className="mt-3">
			<GLCard className="preview h-100" noMargin>
				
				{item && item.branding?.logo && <img src={item.branding.logo} className="logo"/>}
				<p className='text-center'>{item.name}</p>
			</GLCard>
		</Col>;
	}

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


const CampaignList = ({campaigns, brand, subBrands, status}) => {

	const allBrandList = [brand, ...subBrands];
	const allBrands = {};
	allBrandList.forEach(b => {
		allBrands[b.id] = b;
	});

	return <>
		<br/>
		<h5>Campaigns run via Good-Loop Ads</h5>
		<p className='color-gl-red text-center'>{brand.name} - All Campaigns</p>
		<br/>
		<GLVertical>
			{campaigns.map((campaign, i) => {
				const myBrand = allBrands[campaign.vertiser];
				return <GLCard className="preview campaign mt-3" noMargin>
					<div className='campaign-details'>
						<p className='text-left m-0'>
							<b>{campaign.vertiserName}</b>
							<br/>
							{campaign.name}
						</p>
					</div>
					{campaign && <img className="logo" src={myBrand?.branding?.logo}/>}
				</GLCard>
			})}
		</GLVertical>
	</>;
	
};

export default ImpactOverviewPage;
