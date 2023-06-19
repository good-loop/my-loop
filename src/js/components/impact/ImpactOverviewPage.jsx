import React, { useEffect, useState } from 'react';
import { animated } from 'react-spring';
import TODO from '../../base/components/TODO';
import DevOnly from '../../base/components/DevOnly';
import { Button, Col, Container, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import BG from '../../base/components/BG';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop } from './GLCards';
import NGO from '../../base/data/NGO';
import Money from '../../base/data/Money';
import CharityLogo from '../CharityLogo';
import AdvertsCatalogue from '../campaignpage/AdvertsCatalogue';
import Misc from '../../base/components/Misc';
import Circle from '../../base/components/Circle';
import Center from '../../base/components/Center';

import Advert from '../../base/data/Advert';
import { getActiveTypes, getImpressionsByCampaignByCountry } from '../../base/data/ImpactPageData';
import printer from '../../base/utils/printer'

/**
 * DEBUG OBJECTS
 */

// import {TEST_CHARITY, TEST_CHARITY_OBJ, TEST_BRAND, TEST_BRAND_OBJ, TEST_CAMPAIGN, TEST_CAMPAIGN_OBJ} from './TestValues';
import { addAmountSuffixToNumber, space, stopEvent } from '../../base/utils/miscutils';
import { dataColours, getCountryFlag, getCountryName } from '../pages/greendash/dashUtils';
import { isEmpty, keyBy, sumBy } from 'lodash';
import Logo from '../../base/components/Logo';
import { getId } from '../../base/data/DataClass';
import ImpactHubLink from '../ImpactHubLink';
import PortalLink from '../../base/components/PortalLink';
import { getMainItem } from './ImpactPages';
import ImpactSettings from '../../base/data/ImpactSettings';
import MDText from '../../base/components/MDText';

export class ImpactFilters {
	agency;
	brand;
	brand2;
	campaign;
	cid;
	/** @type {String} charity ID */
	ngo;
	impactdebit;
	start;
	end;
	status;
	q;
}


/**
 * The left or top half of the Impact Overview page. Contains the hero splash and run-downs of donation totals etc
 * @param {object} p
 * @param {object} p.brand Currently focused brand
 * @param {object} p.campaign Currently focused campaign
 * @param {object[]} p.charities List of charity objects associated with ads under the current focus
 * @param {object} p.impactDebits All impact debits associated with items under the current focus
 * @param {string} p.mainLogo Primary brand logo for the hero card
 * @param {string} p.totalString String representation of amount donated under current focus
 * 
 * @returns {JSX.Element}
 */
function IOPFirstHalf({ wtdAds, tadgAds, brand, campaign, charities, impactDebits, totalString, mainLogo }) {
	return <GLVertical>
		{/* top left corner - both top corners with basis 60 to line up into grid pattern */}
		<GLCard basis={campaign ? 80 : 60} className="hero-card">
			<div className='white-circle'>
				<div className='content'>
					<img  className='logo' src={mainLogo} />
					<DevOnly><PortalLink item={brand} /></DevOnly>
					<br/>
					<h1>{totalString}</h1>
					<h2>Donated</h2>
					<h5>With</h5>
					<img  className='w-50' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
				</div>
			</div>
			<GLModalCard id="hero-card-modal" />
		</GLCard>

		{/* bottom left corner */}
		{campaign ? (
			<CampaignCharityDisplay charities={charities} impactDebits={impactDebits}/>
		) : (
			/*<GLHorizontal>
				<WTDCard ads={wtdAds} brand={brand} charities={charities} impactDebits={impactDebits} />
				<TADGCard ads={tadgAds} brand={brand} charities={charities} impactDebits={impactDebits} />
			</GLHorizontal>*/
			// Can't have in set - or CommonDivision wrapper messes up. Can't think of fix so just shove contents here for now
			<CharitiesCardSet charities={charities} impactDebits={impactDebits} glCardPassThru={true} />
		)}
		<GLModalCard id="left-half" />
	</GLVertical>;
};

/**
 * Collapsed: Count of campaigns/sub-campaigns under the current focus
 * Expanded: List of campaigns
 * @param {obect} p
 * @param {object[]} p.brand Currently focused brand
 * @param {object[]} p.subBrandsDisplayable List of brands under the current focus which have impact debits attached
 * 
 * @returns {JSX.Element}
 */
function SubBrandsCard({ brand, subBrandsDisplayable: subBrands }) {
	if (!subBrands.length) return null;

	const cardProps = {
		className: 'center-number',
		modalContent: <BrandList brand={brand} subBrands={subBrands} />,
		modalTitle: `${subBrands.length} Brands`,
		modalId: 'right-half',
		modalClassName: 'list-modal'
	};

	const noun = (subBrands.length === 1) ? 'Brand' : 'Brands';

	return <GLCard {...cardProps}>
		<h2>{subBrands.length}</h2>
		<h3>{noun}</h3>
	</GLCard>;
}


/**
 * Collapsed: Count of charities helped by group/brand/campaign
 * Expanded: List of charities helped
 * @param {object} p
 * @param {object[]} p.charities List of charity objects associated with ads under the current focus
 * @returns {JSX.Element}
 */
function CharitiesCard({mainItem, charities }) {
	const cardProps = {
		className: 'center-number',
		modalContent: <CharityList mainItem={mainItem} charities={charities}/>,
		modalTitle: `${charities.length} Charities`,
		modalId: 'right-half',
		modalClassName: 'list-modal'
	};

	const noun = (charities.length === 1) ? 'Charity' : 'Charities';

	return <GLCard {...cardProps}>
		<h2>{charities.length}</h2>
		<h3>{noun}</h3>
	</GLCard>;
}


/**
 * Collapsed: Count of campaigns/sub-campaigns under the current focus
 * Expanded: List of campaigns
 * @param {obect} p
 * @param {object[]} p.subCampaignsDisplayable List of campaigns under the current focus which have impact debits attached
 * @param {object[]} p.brand Currently focused brand
 * @param {object[]} p.subBrands List of sub-brands under the current focus
 * @param {object[]} p.impactDebits ImpactDebits associated with campaigns under the current focus
 * @returns {JSX.Element}
 */
function SubCampaignsCard({ brand, subBrands, subCampaignsDisplayable: campaigns, impactDebits}) {
	if (!campaigns.length) return null;

	const cardProps = {
		basis: 10,
		modalContent: <CampaignList brand={brand} subBrands={subBrands} campaigns={campaigns} impactDebits={impactDebits}/>,
		modalTitle: `${campaigns.length} Campaigns`,
		modalId: 'right-half',
		modalClassName: 'list-modal'
	};

	const noun = (campaigns.length === 1) ? 'Campaign' : 'Campaigns';

	return <GLCard {...cardProps}>
		<h2>{campaigns.length}</h2>
		<h3>{noun}</h3>
	</GLCard>;
}


/** Dead code: as of 22/02/2023, this card is being discussed if it should be kept or not */
function OffsetsCard() {
	return null;

	return <GLCard
		noPadding
		className="offset-card"
		basis={0}
		modalId="right-half"
		modalTitle="8.69T CO2E Offset"
		modalHeader={<CO2OffsetInfoHeader />}
		modalContent={<CO2OffsetInfo />}
		modalClassName="no-header-padding co2-offset"
	>
		<div className="offset-number px-3">
			<h3>8.69T CO2E OFFSET</h3>
		</div>
		<div className="carbon-neutral px-5 py-2">
			<img  src="/img/Impact/Good-Loop_CarbonNeutralAd_Logo_Final-05.svg" className="w-100" />
		</div>
	</GLCard>;
}


/**
 * @param {object} p
 * @param {object[]} p.ads List of ads under the current focus
 * @param {boolean} [noPreviews] Don't show ad previews (ie for the small-card view)
 * @param {boolean} [unwrap] Don't wrap in card (for the modal view, which will be put in the existing modal card)
 * 
 * @returns {JSX.Element}
 */
function AdsCatalogueCard({ ads, campaign, unwrap }) {
	let showAds = ads.filter(ad => !Advert.hideFromShowcase(ad));

	const content = showAds.length ? (
		<AdvertsCatalogue
			ads={showAds}
			noPreviews
		/>
	) : (
		<h3>No ads yet!</h3>
	);

	if (unwrap) return content;

	const cardProps = {
		basis: (campaign && 70),
		className: 'ads-catalogue-card',
		modalId: 'full-page',
		modalContent: <AdsCatalogueCard ads={ads} unwrap />,
		modalClassName: 'ads-catalogue-modal',
	};

	return <GLCard {...cardProps}>
		{content}
	</GLCard>
}


/**
 * The right or bottom half of the Impact Overview page. Contains counts of ads,
 * campaigns, charities helped, types of Good-Loop products in play, and ad previews.
 * @param {object} p
 * @param {object} p.brand Currently focused brand
 * @param {object} p.campaign Currently focused campaign
 * @param {object[]} p.charities List of charity objects associated with ads under the current focus
 * @param {object} p.impactDebits All impact debits associated with items under the current focus
 * @param {string} p.mainLogo Primary brand logo for the hero card
 * @param {string} p.totalString String representation of amount donated under current focus
 * 
 * @returns {JSX.Element}
 */
const IOPSecondHalf = (baseObjects) => {
	const { campaign, ads } = baseObjects;

	const mainItem = getMainItem(baseObjects);

	return <GLVertical>
		{mainItem?.impactSettings?.csrHtml && <GLCard><MDText source={mainItem.impactSettings.csrHtml} /></GLCard>}
		{/* top right corner */}
		{!campaign && <GLHorizontal collapse="md" basis={60}>
			<GLVertical>
				<GLHorizontal>
					<SubBrandsCard {...baseObjects} />
					<CharitiesCard mainItem={mainItem} {...baseObjects} />
				</GLHorizontal>
				<SubCampaignsCard {...baseObjects} />
				<CountryViewsGLCard basis={10} baseObjects={baseObjects} />
				<OffsetsCard />
			</GLVertical>
			<ContentListCard {...baseObjects } />
			<GLModalCard id="ads-for-good-modal" />
		</GLHorizontal>}

		{/* bottom right corner */}
		<GLVertical>
			{campaign && <CountryViewsGLCard basis={10} baseObjects={baseObjects}/>}
			<AdsCatalogueCard ads={ads} />
			{campaign && <GLCard className="boast" basis={20}>
				<h2>SUSTAINABLE GOALS</h2>
				<TODO>??</TODO>
			</GLCard>}
		</GLVertical>

		<GLModalCard id="right-half"/>
	</GLVertical>;
};


/**
 * @param {Object} p
 * @param {PromiseValue} p.pvBaseObjects See ImpactPageData.js:fetchImpactBaseObjects for resolved value
 * @param {object} p.navToggleAnimation Params for animating nav bar (?)
 * @param {string} totalS
 */
const ImpactOverviewPage = ({pvBaseObjects, navToggleAnimation, ...props}) => {
	if (!pvBaseObjects.resolved) return <Misc.Loading text="Fetching impact data..." />;
	const baseObjects = pvBaseObjects.value;

	return <>
		<div className='iview-positioner pr-md-1'>
			<Container fluid className='iview-container'>
				<animated.div className='impact-navbar-flow' style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}}></animated.div>
				<GLVertical id='overview-first-card' className="w-100">
					<GLHorizontal collapse="md" className="iview-grid">
						<IOPFirstHalf {...baseObjects} {...props} />
						<IOPSecondHalf {...baseObjects} {...props} />
						<GLModalCard id="full-page"/>
					</GLHorizontal>
					<GLCard className="logos-display">
						<LogosDisplay {...baseObjects} />
					</GLCard>
				</GLVertical>
			</Container>
		</div>
		<GLModalBackdrop />
	</>;
};


const CampaignCharityDisplay = ({charities}) => {


	return <GLHorizontal basis={20}>
		{charities.map(charity => {
			return <GLCard key={charity.id}
				className="boast"
				modalContent={<CharityInfo charity={charity}/>}
				modalHeader={<CharityHeader charity={charity}/>}
				modalHeaderImg={charity.images}
				modalClassName="charity-info"
				modalId="right-half"
			>
				<img src={charity.logo} style={{width: '7rem'}}/>
				<br/>
				<h2>{Money.prettyStr(charity.dntnTotal)} Donated</h2>
				<br/>
				<h4>{NGO.displayName(charity)}</h4>
			</GLCard>
		})}
	</GLHorizontal>;
};


function WTDCard({ads, brand, charities, impactDebits}) {
	// Which ImpactDebits are attached to the same campaign as at least one ad in the list?
	const [matchedDebits, setMatchedDebits] = useState();

	useEffect(() => {
		setMatchedDebits(impactDebits.filter(id => (
			ads.find(ad => ad.campaign = id.campaign)
		)));
	}, [ads, charities, impactDebits]);

	return <GLCard
		className="boast wtd"
		modalContent={<WatchToDonateModal ads={ads} brand={brand}/>}
		modalTitle="Watch To Donate"
		modalId="full-page"
		modalClassName="no-padding watch-to-donate"
	>
		<h3>Watch to donate</h3>
		<h2><TODO>£333,203</TODO></h2>
		<h3 className="text-bold">Donated</h3>

		<h5>including</h5>
		<TODO>(charity load)</TODO>
		<h4><TODO>15,000 Trees Planted</TODO></h4>
		<CharityLogo charity={TEST_CHARITY_OBJ}/>
		<h4><TODO>10,012 Children's Meals</TODO></h4>
		<CharityLogo charity={TEST_CHARITY_OBJ}/>
		<QuestionIcon />
	</GLCard>;
};


function TADGCard({ads, brand, charities, impactDebits}) {
	// Which ImpactDebits are attached to the same campaign as at least one ad in the list?
	const [matchedDebits, setMatchedDebits] = useState();

	useEffect(() => {
		setMatchedDebits(impactDebits.filter(id => (
			ads.find(ad => ad.campaign = id.campaign)
		)));
	}, [ads, charities, impactDebits]);
	
	return <GLCard
		className="boast tadg"
		modalContent={<ThisAdDoesGoodModal ads={ads} brand={brand}/>}
		modalTitle="This Ad Does Good"
		modalId="full-page"
		modalClassName="no-padding this-ad-does-good"
	>
		<h3 className="color-greenmedia-darkcyan">This ad does good</h3>
		<h2 className="color-greenmedia-darkcyan"><TODO>136,580</TODO></h2>
		<h3 className="color-greenmedia-darkcyan text-bold">Trees planted</h3>

		<img src={brand?.branding?.logo} className="logo" />
		<TODO>(charity load)</TODO>
		<CharityLogo charity={TEST_CHARITY_OBJ}/>
		<QuestionIcon/>
	</GLCard>;
}

/**
 * One, two or three charity cards (depending on donations found) to display below the hero splash
 * @param {object} p
 * @param {NGO[]} p.charities Charities donated to by the campaigns in scope.
 * @param {ImpactDebit[]} p.impactDebits The ImpactDebit objects representing in-scope donations.
 */
function CharitiesCardSet({charities, impactDebits}) {

	if (!charities?.length) {
		return <DevOnly>No charities</DevOnly>;
	};

	if (!charities.length) {
		return <Misc.Loading text="Fetching donation data..." />;
	}

	const topCharities = <GLHorizontal className="top-charities">
		{charities.slice(0, 3).map(charity => {
			const cid = getId(charity);
			return <CharityCard id={cid} key={cid} charity={charity} impactDebits={impactDebits} />;
		})}
	</GLHorizontal>;

	if (charities.length <= 3) return topCharities;

	return <GLVertical>
		{topCharities}
		<GLCard className="more-charities card-body" noPadding>
			<h5>Plus {charities.length-3} more</h5>
			<div className='flex-row'>
				{charities.slice(3).map(charity => {
					const cid = getId(charity);
					const cname = NGO.displayName(charity);
					return <ImpactHubLink className="charity-link" key={cid} item={charity} logo title={cname} />;
				})}
			</div>
		</GLCard>
	</GLVertical>;
};


/**
 * 
*/
function CharityCard({charity}) {
	let [show,setShow] = useState();
	let headerStyle = charity.images? {
		backgroundImage: "url("+charity.images+")",
		backgroundPosition: 'center'
	} : null;

	return <GLCard className="charity-card">
		<a href="dummy"  onClick={e => stopEvent(e) && setShow(true)}><img alt={charity.name} src={charity.logo} className="charity-logo"/></a>
		{/* This modal is similar (though not quite as well styled) as the one in the charity list on-click.
		Advantage: this uses vanilla bootstrap and is simpler.
		To Do: refactor to use vanilla bootstrap modals elsewhere. */}
		<Modal isOpen={show} toggle={() => setShow(!show)}
			// size="lg"
		>
			<div style={headerStyle}>
			<ModalHeader toggle={() => setShow(!show)}>
				{/* argh: modal-title is not filling the width so not centering */}
				<Center>
					<Circle padding="1rem" center>
						<CharityLogo charity={charity}/>
					</Circle>
				</Center>
				{/* <Misc.Logo service={C.app.id} url={logo} transparent={false} className="pull-left mr-1" />
				{' '}{title}
				{subtitle && <p className='my-4 login-subtitle'>{subtitle}</p>} */}
			</ModalHeader>
			</div>
			<ModalBody>
				<CharityInfo charity={charity}/>
			</ModalBody>
		</Modal>
		<h2 className="donation-total">
			{Money.prettyStr(charity.dntnTotal)}
		</h2>
		<h3>raised</h3>
	</GLCard>;
};



const BrandLogo = ({item}) => {
	return <Col md={1} xs={7} className="text-center">
		{item.branding?.logo ? <img src={item.branding.logo} className="logo"/> : <p>{item.name}</p>}
	</Col>
};


const LogosDisplay = ({brand, subBrands}) => {
	return <>
		<h3>Advertising that's a force for good</h3>
		<br/><br/>
		<img  src={brand?.branding?.logo} className="logo"/>
		<br/><br/>
		<img  className='a4glogo' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
		<br/><br/><br/>
		<Row className='justify-content-center w-100'>
			{subBrands.map(b => <BrandLogo item={b} key={b.id}/>)}
		</Row>
	</>;

};

const QuestionIcon = () => {
	return <div className='question-icon'>
		?
	</div>
}

const ThisAdDoesGoodModal = ({ads, brand}) => {
	const charity = TEST_CHARITY_OBJ;

	return <div className="bg-gl-background-default inmodal-wrapper p-5">
		<GLCard className="inmodal-content" noPadding>
			<BG src="/img/Impact/curves-background.svg" className="py-5 img-bg">
				<h3 className='text-white'>1 This Ad Does Good Campaign</h3>
				<br/>
				<AdsCatalogueCard ads={ads} unwrap noPreviews />
				<br/>
				<Row className='text-center rates'>
					<Col xs={4}>
						<p><TODO><b>XX%</b></TODO></p>
						<p>Viewability rate</p>
					</Col>
					<Col xs={4}>
						<p><b>XX%</b></p>
						<p>Click through rate</p>
					</Col>
					<Col xs={4}>
						<p><b>XX%</b></p>
						<p>Completed view rate</p>
					</Col>
				</Row>
			</BG>
			<br/>
			<h3><TODO>136,283 Trees Planted</TODO></h3>
			<br/>
			<h5>SUPPORTING</h5>
			<br/><br/>
			<p className='text-center'>Reforestation projects in Madagascar, Kenya, and Mozambique</p>
			<br/>
			<Row className='w-50 mx-auto'>
				<Col xs={6} className="d-flex flex-row align-items-center justify-content-center">
					<img  src={brand.branding?.logo} className="logo"/>
				</Col>
				<Col xs={6} className="d-flex flex-row align-items-center justify-content-center">
					<TODO>which charity</TODO>
					<CharityLogo charity={charity}/>
				</Col>
			</Row>
			<br/>
		</GLCard>
	</div>;
}

/**
 * TODO refactor to share code with ThisAdDoesGoodModal and BrandDonationInfo
 * @param {*} param0 
 * @returns 
 */
const WatchToDonateModal = ({ads, brand}) => {
	const charity = TEST_CHARITY_OBJ;

	return <div className="bg-gl-background-default inmodal-wrapper p-5">
		<GLCard className="inmodal-content" noPadding >
			<BG src="/img/Impact/curves-background.svg" className="py-5 img-bg">
				<h3 className='text-white'><TODO>15</TODO> Watch To Donate Campaigns</h3>
				<br/>
				<AdsCatalogueCard ads={ads} unwrap noPreviews />
				<br/>
				<Row className='text-center rates'>
					<Col xs={4}>
						<p>
							<b><TODO>XX%</TODO></b>
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
			<h3><TODO>£136,283 Donated</TODO></h3>
			<br/>
			<h5>INCLUDING</h5>
			<br/><br/>
			<p className='text-center'><TODO>Reforestation projects in Madagascar, Kenya, and Mozambique</TODO></p>
			<br/>
			<Row className='w-50 mx-auto'>
				<Col xs={6} className="d-flex flex-row align-items-center justify-content-center">
					<img  src={brand.branding?.logo} className="logo"/>
				</Col>
				<Col xs={6} className="d-flex flex-row align-items-center justify-content-center">
					<TODO>charity load</TODO>
					<CharityLogo charity={charity}/>
				</Col>
			</Row>
			<br/>
		</GLCard>
	</div>;
}


// Keys matched to members of baseObjects
const contentTypes = {
	wtdAds: 'Watch To Donate',
	tadgAds: 'This Ad Does Good',
	etdAds: 'Engage To Donate',
	greenTags: 'Green Ad Tag',
	// tasl: 'This Ad Supports Local'
};


const ContentListCard = (baseObjects) => {
	const activeTypes = Object.entries(contentTypes).map(([type, name]) => {
		const active = baseObjects[type]?.length; // ie true if there are entries in the "wtdAds" list etc
		return <Row key={type}>
			<Col xs={3}>
				<img src={`/img/mydata/circle${active ? '' : '-no'}-tick.svg`} className="logo" />
			</Col>
			<Col xs={9} className="d-flex flex-column align-items-start justify-content-center">
				<h5 className="text-left">{name}</h5>
			</Col>
		</Row>;
	});

	return <GLCard>
		<div className="d-flex flex-column align-items-stretch justify-content-between h-100">
			<img className="w-75 align-self-center mb-3" src="/img/gl-logo/AdsForGood/AdsForGood.svg" />
			{activeTypes}
		</div>
	</GLCard>;
}


const AdsForGoodCTAHeader = () => {
	return <div className='bg-gl-impact-red pt-5 position-relative'>
		<img  src="/img/curves/curve-white.svg" className='w-100'/>
		<img  src="/img/Impact/images-combined.png" className='header-overlay'/>
	</div>;
};


const AdsForGoodCTA = () => {
	const vertiser = TEST_BRAND_OBJ;

	return <div className='d-flex flex-column align-items-center justify-content-between h-100'>
		<img  src={vertiser.branding.logo} className="logo"/>
		<TODO>which brand</TODO>
		<img  className='w-25' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
		<h3>Discover our products and fund even more good causes</h3>
		<Button color="primary">Get in touch</Button>
	</div>
};


const CO2OffsetInfoHeader = () => {
	return <div className='bg-co2-offset pt-5 position-relative'>
		<img  src="/img/curves/curve-white.svg" className='w-100'/>
		<img  src="/img/green/hummingbird.png" className='header-overlay'/>
	</div>;
};


const CO2OffsetInfo = () => {
	const vertiser = TEST_BRAND_OBJ;

	return <div className='d-flex flex-column align-items-center justify-content-between h-100'>
		<img  src={vertiser.branding.logo} className="logo"/>
		<TODO>which brand</TODO>
		<img  className='w-25' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
		<h4><TODO>Info about Green Ad Tag</TODO></h4>
		<h4><TODO>Info about Offset Project</TODO></h4>
		<h4><TODO>Cost of Offset - it only cost £X to offset</TODO></h4>
		<Button color="primary">Download offset certificate</Button>
	</div>
}

const BrandList = ({brand, subBrands}) => {
	const BrandListItem = ({item}) => {
		const contents = <Col md={4} className="mt-3">
			<GLCard className={space("preview h-100", item._shouldHide && "bg-gl-light-red")} noMargin href={"/impact/view/brand/"+item.id}>
				{item && item.branding?.logo && <img  src={item.branding.logo} className="logo"/>}
				{item._shouldHide && <p className='text-white'>Normally hidden</p>}
				<p className='text-center'>{item.name}</p>
			</GLCard>
		</Col>;
		return item._shouldHide ? <DevOnly>{contents}</DevOnly> : contents;
	}

	return <>
		<br/>
		<h5>Brands donating via Good-Loop Ads</h5>
		<p className='color-gl-red text-center'>{brand.name} - All Campaigns</p>
		<br/>
		<Row>
			{subBrands.map(b => <BrandListItem item={b} key={b.id}/> )}
		</Row>
	</>;
};

const CharityList = ({mainItem, charities}) => {
	return <>
		<br/>
		<h5>Charities supported by <span className='color-gl-red'>{mainItem?.name}</span> via Good-Loop Ads</h5>		
		<br/>
		<Row>
			{charities.map((charity, i) => <Col key={i} md={4} className="mt-3">
				<GLCard className="preview h-100" noMargin
					modalContent={<CharityInfo charity={charity}/>}
					modalHeader={<CharityHeader charity={charity}/>}
					modalHeaderImg={charity.images}
					modalClassName="charity-info"
					modalId="left-half"
				>
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
		<img  className='w-25' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
		<br/>
		<p className='p-5'>
			<MDText source={NGO.extendedDescription(charity) || NGO.anyDescription(charity)}/>
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
		<h5>Campaigns run via Good-Loop Ads</h5>
		<p className="color-gl-red text-center">{brand.name} - All Campaigns</p>
		<GLVertical>
			{campaigns.map(campaign => {
				const myBrand = allBrands[campaign.vertiser];
				const contents = <GLCard className={space('preview campaign mt-3', campaign._shouldHide && 'bg-gl-light-red')} noMargin key={campaign.id} href={"/impact/view/campaign/" + campaign.id}>
					<p className="w-75 text-left m-0">
						<div className="brand-name">{myBrand.name || campaign.vertiserName}</div>
						<div className="campaign-name">{campaign.name}</div>
					</p>
					{campaign._shouldHide && <p className="text-white">Normally Hidden</p>}
					<Logo item={myBrand} />
				</GLCard>;
				return campaign._shouldHide ? <DevOnly>{contents}</DevOnly> : contents;
			})}
		</GLVertical>
	</>;
};


/** Round number to 3 significant figures and shorten with K/M/B suffix */
const shortNumber = (number) => (
	addAmountSuffixToNumber(printer.prettyNumber(number).replaceAll(',', ''))
);


const CountryViewsGLCard = ({basis, baseObjects}) => {
	if (!baseObjects) {
		console.warn("CountryViewsGLCard - no baseObjects");
		return null;
	}
	let impressionData = getImpressionsByCampaignByCountry({baseObjects})

	// Prepare data for non-modal view - total impressions and countries
	const totalCountries = Object.keys(impressionData).filter(country => country !== "unset").length;
	const impressions = sumBy(Object.values(impressionData), 'impressions') // sum impressions over all regions
	const countryWord = (totalCountries === 1) ? 'COUNTRY' : 'COUNTRIES';

	const modalMapCardContent = <>
		<MapCardContent data={impressionData}/>
		<CampaignCountryList data={impressionData} />
	</>;

	// handle list of campaigns & countries inside modal

	return (
	<GLCard
		basis={basis}
		modalContent={modalMapCardContent}
		modalClassName="impact-map"
		modalId="right-half"
	>
		<h3>{shortNumber(impressions)} VIEWS | {totalCountries} {countryWord}</h3>
	</GLCard>
	)
}


// TODO map widget in its own file
const MapCardContent = ({data}) => {
	const [mapData, setMapData] = useState('loading'); // Object mapping region ID to imps + carbon
	const [focusRegion, setFocusRegion] = useState('world'); // ID of currently focused country
	const [mapDefs, setMapDefs] = useState(); // JSON object with map paths and meta
	const [svgEl, setSvgEl] = useState(); // ref to the map SVG to create download button
	const [error, setError] = useState(); // Problems loading map?

	// Fetch the JSON with the map data for the current focus country
	useEffect(() => {
		// No mapdefs for this country? Return to world map and tell user
		const onError = () => {
			setFocusRegion('world');
			setError(`No detailed map available for country code "${focusRegion}"`);
		};

		fetch(`/js-data/mapdefs-${focusRegion}.json`).then((res) => {
			if (!res.ok) {
				onError();
				return;
			}
			res.json().then((json) => {
				setMapDefs(json);
				// clear error on successfully loading a country map
				if (!isWorld) setError(null);
			}).catch(onError);
		});
	}, [focusRegion]);


	const isWorld = (focusRegion === 'world');

	return <SVGMap mapDefs={mapDefs} data={data} setFocusRegion={setFocusRegion} showLabels={false} svgEl={svgEl} setSvgEl={setSvgEl} />;
}


const SVGMap = ({ mapDefs, data, setFocusRegion, showLabels, setSvgEl}) => {
	const [pathCentres, setPathCentres] = useState({}); // Estimate region centres from bounding boxes to place text labels

	if (!mapDefs) return null;
	const loading = data === 'loading';

	let regions = [];
	Object.entries(mapDefs.regions).forEach(([id, props]) => {
		// Removed some code here which tried to normalise map entry key "UK" to ISO "GB" - seems the map has been fixed.
		let { impressions = 0, } = data?.[id] || {};

		props = { ...props, stroke: '#fff', strokeWidth: mapDefs.svgAttributes.fontSize / 10 };
		// Don't paint misleading colours on a map we don't have data for
		if (!loading) {
			// Define colours in CSS instead of code
			props.className = `region-path ${impressions ? 'impressions' : 'no-impressions'}`
		}

		// Countries are clickable, sublocations aren't.
		if (setFocusRegion) {
			props.style = { cursor: 'pointer' };
			props.onClick = () => setFocusRegion(id);
		}

		const pathId = `${mapDefs.id}-${id}`;

		// Once path is drawn, find the centre of the region's bounding box to position a text label on the bigger map
		const pathRef = showLabels ? (path) => {
			if (!path) return;
			setPathCentres((prev) => {
				if (prev[pathId]) return prev;
				return { ...prev, [pathId]: bbCentre(path) };
			});
		} : null;

		// Tooltip on hover
		const title = loading ? null : (
			<title>{props.name}: {impressions} views</title>
		);

		regions.push(
			<path key={`path-${id}`} data-id={id} {...props} ref={pathRef}>
				{title}
			</path>
		);
	})
	const svgRef = (element) => element && setSvgEl(element);

	return (
		<div className={space('map-container text-center', loading && 'loading')}>
			<svg className="map-svg" version="1.1" {...mapDefs.svgAttributes} xmlns="http://www.w3.org/2000/svg" ref={svgRef}>
				{regions}
			</svg>
			{loading && <Misc.Loading text={`Fetching map data for ${mapDefs.name}`} />}
		</div>
	);
}

function UnsetCountryWarning() {
	return <div className="row-aux unset-warning">
		Geolocation recording was implemented in April 2022.<br/>
		Older impressions will not be locatable.
	</div>;
}

// comparator for sorting the weird-shaped Object.entries() data we work with in CampaignCountryList
const countryListComparator = ([,a], [,b]) => (b.impressions - a.impressions);

const CampaignCountryList = ({data}) => {
	const regions = Object.entries(data);
	regions.sort(countryListComparator);

	// if data has an unset region, push it to the back so it'll appear at the bottom of the country list
	const unsetIndex = regions.findIndex(([k, v]) => k === 'unset');
	if (unsetIndex >= 0){
		const [unsetKV] = regions.splice(unsetIndex, 1);
		regions.push(unsetKV);
	}

	// [['a', {x: 1, y: 2}], ['b', {x: 3, y: 4}], ['c', {x: 5, y: 6}]].map(([first, {x, y}]) => console.log(first, x, y))

	return regions.map(([regionCode, {impressions, campaignsInRegion}]) => {
		if (impressions === 0) return;

		let isUnset = false;
		let flag = null;
		if (regionCode === 'unset') {
			isUnset = true;
			regionCode = 'Unknown';
		} else {
			flag = <img src={`/img/country-flags/${regionCode.toLowerCase()}.svg`} className="country-flag" alt={`flag for ${regionCode}`} />
		}

		return (
			<GLCard className={space('country-impressions p-2', isUnset && 'country-unset')} key={regionCode} noMargin noPadding>
				<div className="row-main">
					<div className="row-id">
						<span className="region-code">{regionCode}</span>
						{flag}
					</div>
					<div className="counts">
						<div className="count campaign-count">
							<div className="label">Campaigns</div>
							<div className="number">{campaignsInRegion}</div>
						</div>
						<div className="count impression-count">
							<div className="label">Views</div>
							<div className="number">{printer.prettyNumber(impressions, 21)}</div>
						</div>
					</div>
				</div>
				{isUnset && <UnsetCountryWarning />}
			</GLCard>
		);
	});
}

export default ImpactOverviewPage;
