import React, { useEffect, useState } from 'react';
import { animated } from 'react-spring';
import TODO from '../../base/components/TODO';
import { Button, Col, Container, Row } from 'reactstrap';
import BG from '../../base/components/BG';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop } from './GLCards';
import NGO from '../../base/data/NGO';
import Money from '../../base/data/Money';
import CharityLogo from '../CharityLogo';
import AdvertsCatalogue from '../campaignpage/AdvertsCatalogue';
import Misc from '../../base/components/Misc';
import Advert from '../../base/data/Advert';
import { getActiveTypes, getImpressionsByCampaignByCountry } from '../../base/data/ImpactPageData';
import printer from '../../base/utils/printer'

/**
 * DEBUG OBJECTS
 */

import {TEST_CHARITY, TEST_CHARITY_OBJ, TEST_BRAND, TEST_BRAND_OBJ, TEST_CAMPAIGN, TEST_CAMPAIGN_OBJ} from './TestValues';
import { addAmountSuffixToNumber } from '../../base/utils/miscutils';
import { dataColours, getCountryFlag, getCountryName } from '../pages/greendash/dashUtils';
import { isEmpty } from 'lodash';

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
function IOPFirstHalf({ brand, campaign, charities, impactDebits, totalString, mainLogo }) {
	return <GLVertical>
		{/* top left corner - both top corners with basis 60 to line up into grid pattern */}
		<GLCard basis={campaign ? 80 : 60} className="hero-card">
			<div className='white-circle'>
				<div className='content'>
					<img  className='logo' src={mainLogo} />
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
			<BrandDonationInfo brand={brand}/>
		)}

		<GLModalCard id="left-half" />
	</GLVertical>;
};

/**
 * Collapsed: Count of campaigns/sub-campaigns under the current focus
 * Expanded: List of campaigns
 * @param {obect} p
 * @param {object[]} p.brand Currently focused brand
 * @param {object[]} p.subBrandsWithDebits List of brands under the current focus which have impact debits attached
 * 
 * @returns {JSX.Element}
 */
function SubBrandsCard({ brand, subBrandsWithDebits }) {
	if (!subBrandsWithDebits.length) return null;

	const cardProps = {
		className: 'center-number',
		modalContent: () => <BrandList brand={brand} subBrands={subBrandsWithDebits} />,
		modalTitle: `${subBrandsWithDebits.length} Brands`,
		modalId: 'right-half',
		modalClassName: 'list-modal'
	};

	return <GLCard {...cardProps}>
		<h2>{subBrandsWithDebits.length}</h2>
		<h3>Brands</h3>
	</GLCard>;
}


/**
 * Collapsed: Count of charities helped by group/brand/campaign
 * Expanded: List of charities helped
 * @param {object} p
 * @param {object[]} p.charities List of charity objects associated with ads under the current focus
 * @returns {JSX.Element}
 */
function CharitiesCard({ charities }) {
	const cardProps = {
		className: 'center-number',
		modalContent: () => <CharityList charities={charities}/>,
		modalTitle: `${charities.length} Charities`,
		modalId: 'right-half',
		modalClassName: 'list-modal'
	};

	return <GLCard {...cardProps}>
		<h2>{charities.length}</h2>
		<h3>Charities</h3>
	</GLCard>;
}


/**
 * Collapsed: Count of campaigns/sub-campaigns under the current focus
 * Expanded: List of campaigns
 * @param {obect} p
 * @param {object[]} p.subCampaignsWithDebits List of campaigns under the current focus which have impact debits attached
 * @param {object[]} p.brand Currently focused brand
 * @param {object[]} p.subBrands List of sub-brands under the current focus
 * @param {object[]} p.impactDebits ImpactDebits associated with campaigns under the current focus
 * @returns {JSX.Element}
 */
function SubCampaignsCard({ brand, subBrands, subBrandsWithDebits, subCampaignsWithDebits, impactDebits}) {
	if (!subCampaignsWithDebits.length) return null;

	const cardProps = {
		basis: 10,
		modalContent: () => <CampaignList brand={brand} subBrands={subBrands} campaigns={subCampaignsWithDebits} impactDebits={impactDebits}/>,
		modalTitle: `${subCampaignsWithDebits.length} Campaigns`,
		modalId: 'right-half',
		modalClassName: 'list-modal'
	};

	return <GLCard {...cardProps}>
		<h3>{subCampaignsWithDebits.length} CAMPAIGNS</h3>
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
		modalHeader={CO2OffsetInfoHeader}
		modalContent={CO2OffsetInfo}
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
function AdsCatalogueCard({ ads, campaign, noPreviews, unwrap }) {
	let showAds = ads.filter(ad => !Advert.hideFromShowcase(ad));

	const content = showAds.length ? (
		<AdvertsCatalogue
			ads={showAds}
			noPreviews={noPreviews}
		/>
	) : (
		<h3>No ads yet!</h3>
	);

	if (unwrap) return content;

	const cardProps = {
		basis: (campaign && 70),
		className: 'ads-catalogue-card',
		modalId: 'full-page',
		modalContent: () => <AdsCatalogueCard ads={ads} unwrap />,
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

	return <GLVertical>
		{/* top right corner */}
		{!campaign && <GLHorizontal collapse="md" basis={60}>
			<GLVertical>
				<GLHorizontal>
					<SubBrandsCard {...baseObjects} />
					<CharitiesCard {...baseObjects} />
				</GLHorizontal>
				<SubCampaignsCard {...baseObjects} />
				<CountryViewsGLCard basis={10} baseObjects={baseObjects} />
				<OffsetsCard />
			</GLVertical>
			<div>
				<ContentListCard {...baseObjects } />
				<GLModalCard id="ads-for-good-modal" />
			</div>
		</GLHorizontal>}

		{/* bottom right corner */}
		<GLVertical>
			{campaign && <CountryViewsGLCard basis={10} baseObjects={baseObjects}cd />}
			<AdsCatalogueCard ads={ads} noPreviews />
			{campaign && <GLCard className="boast" basis={20}>
				<h2>SUSTAINABLE GOALS</h2>
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
		<GLModalBackdrop/>
	</>;
};

const CampaignCharityDisplay = ({charities, impactDebits}) => {
	// sort debits by charity
	let debitsByCharity = {};
	impactDebits.forEach(debit => {
		if (debit.impact.charity) {
			debitsByCharity[debit.impact.charity] = debit;
		}
	});

	return <GLHorizontal basis={20}>
		{charities.map(charity => <GLCard key={charity.id}
			className="boast"
			modalContent={() => <CharityInfo charity={charity}/>}
			modalHeader={() => <CharityHeader charity={charity}/>}
			modalHeaderImg={charity.images}
			modalClassName="charity-info"
			modalId="right-half">
				<img src={charity.logo} style={{width:"7rem"}}/>
				<br/>
				{debitsByCharity[charity.id] && <h2>{Money.prettyStr(debitsByCharity[charity.id].impact.amount)} Donated</h2>}
				<br/>
				<h4>{NGO.displayName(charity)}</h4>
		</GLCard>)}
	</GLHorizontal>;
}

const BrandDonationInfo = ({brand}) => {
	let charity = TEST_CHARITY_OBJ; 
	return <GLHorizontal>
		<GLCard
			className="boast"
			modalContent={() => <WatchToDonateModal brand={brand}/>}
			modalTitle="Watch To Donate"
			modalId="full-page"
			modalClassName="no-padding watch-to-donate">
				<h3>Watch to donate</h3>
				<h2><TODO>£333,203</TODO></h2>
				<h3 className="text-bold">Donated...</h3>

				<h5>INCLUDING</h5>

				<h4><TODO>15,000 Trees Planted</TODO></h4>
				<CharityLogo charity={charity}/>

				<h4><TODO>10,012 Children's Meals</TODO></h4>
				<TODO>charity load</TODO>
				<CharityLogo charity={charity}/>

				<QuestionIcon/>
		</GLCard>
		<GLCard
			className="boast"
			modalContent={() => <ThisAdDoesGoodModal brand={brand}/>}
			modalTitle="This Ad Does Good"
			modalId="full-page"
			modalClassName="no-padding this-ad-does-good">
				<h3 className="color-greenmedia-darkcyan">This ad does good</h3>
				<h2 className="color-greenmedia-darkcyan"><TODO>136,580</TODO></h2>
				<h3 className="color-greenmedia-darkcyan text-bold">Trees planted...</h3>

				<img  src={brand?.branding?.logo} className="logo"/>
				<CharityLogo charity={charity}/>
				<QuestionIcon/>
		</GLCard>
	</GLHorizontal>;
}


const BrandLogo = ({item}) => {
	return <Col md={1} xs={7} className="text-center">
		{item.branding?.logo ? <img  src={item.branding.logo} className="logo"/> : <p>{item.name}</p>}
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

const ThisAdDoesGoodModal = ({brand}) => {
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
							<TODO><b>XX%</b></TODO>
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
const WatchToDonateModal = ({brand}) => {

	const charity = TEST_CHARITY_OBJ;

	return <div className="bg-gl-background-default inmodal-wrapper p-5">
		<GLCard className="inmodal-content" noPadding >
			<BG src="/img/Impact/curves-background.svg" className="py-5 img-bg">
				<h3 className='text-white'><TODO>15</TODO> Watch To Donate Campaigns</h3>
				<br/>
				<AdsCatalogueModal noPreviews />
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


const contentTypes = {
	wtd: 'Watch To Donate',
	tadg: 'This Ad Does Good',
	gat: 'Green Ad Tag',
	etd: 'Engage To Donate',
	tasl: 'This Ad Supports Local'
};

const ContentListCard = ({ ads, greenTags, charities }) => {
	const [activeTypes, setActiveTypes] = useState({});

	useEffect(() => {
		setActiveTypes(getActiveTypes({ ads, greenTags }));
	}, []);

	return <GLCard>
		<div className="d-flex flex-column align-items-stretch justify-content-between h-100">
			<img className="w-75 align-self-center mb-3" src="/img/gl-logo/AdsForGood/AdsForGood.svg" />
			{Object.entries(activeTypes).map(([k, active], i) => (
				<Row key={i}>
					<Col xs={3}>
						<img src={`/img/mydata/circle${active ? '' : '-no'}-tick.svg`} className="logo" />
					</Col>
					<Col xs={9} className="d-flex flex-column align-items-start justify-content-center">
						<h5 className='text-left'>{contentTypes[k]}</h5>
					</Col>
				</Row>
			))}
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
		return <Col md={4} className="mt-3">
			<GLCard className="preview h-100" noMargin href={"/impact/view/brand/"+item.id}>
				
				{item && item.branding?.logo && <img  src={item.branding.logo} className="logo"/>}
				<p className='text-center'>{item.name}</p>
			</GLCard>
		</Col>;
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

const CharityList = ({charities}) => {
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
		<img  className='w-25' src="/img/gl-logo/AdsForGood/AdsForGood.svg"/>
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
			{campaigns.map(campaign => {
				const myBrand = allBrands[campaign.vertiser];
				return <GLCard className="preview campaign mt-3" noMargin key={campaign.id} href={"/impact/view/campaign/" + campaign.id}>
					<div className='campaign-details'>
						<p className='text-left m-0'>
							<b>{campaign.vertiserName}</b>
							<br/>
							{campaign.name}
						</p>
					</div>
					{campaign && <img  className="logo" src={myBrand?.branding?.logo}/>}
				</GLCard>
			})}
		</GLVertical>
	</>;
};


const CountryViewsGLCard = ({basis, baseObjects}) => {
	// TODO This is a pretty expensive call to make on every render. Should really use useState & async set impressionsData when ready.
	// Unfortunately getImpressionsEtc doesn't expose a promise & doing so is a BIG refactor.
	let impressionData = getImpressionsByCampaignByCountry({baseObjects})
	if (isEmpty(impressionData)) return <></>;

	// handle Total Impressions
	let totalCountries = Object.keys(impressionData).filter(country => country !== "unset").length;

	let impressions = Object.values(impressionData).reduce((sum, val) => sum + val.impressions, 0) // sum impressions over all regions
	impressions = printer.prettyNumber(impressions, 3).replaceAll(",", "") // round to sig figs
	impressions = addAmountSuffixToNumber(impressions) // reduce to units in thousands, millions or billions

	let countryWord = (totalCountries > 1) ? "COUNTRIES" : "COUNTRY"
	
	// assign colours to data object for map 
	Object.keys(impressionData).forEach((country) => {
		impressionData[country].colour = "hsl(8, 100%, 23%)"
	})
	
	let modalMapCardContent = <>
		<MapCardContent data={impressionData}/>
		<CampaignCountryList data={impressionData} />
	</>;

	// handle list of campaigns & countries inside modal
	
	return (
	<GLCard
		basis={basis}
		modalContent={() => modalMapCardContent}
		modalClassName="impact-map"
		modalId="right-half"
	>
		<h3>{impressions} VIEWS | {totalCountries} {countryWord}</h3>
	</GLCard>
	)
}

// TODO map widget in its own file
const MapCardContent = ({data}) => {
	const [mapData, setMapData] = useState('loading'); // Object mapping region ID to imps + carbon
	const [focusRegion, setFocusRegion] = useState('v'); // ID of currently focused country
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
			res
				.json()
				.then((json) => {
					setMapDefs(json);
					// clear error on successfully loading a country map
					if (!isWorld) setError(null);
				})
				.catch(onError);
		});
	}, [focusRegion]);


	const isWorld = (focusRegion === 'world');

	return <SVGMap mapDefs={mapDefs} data={data} setFocusRegion={setFocusRegion} showLabels={false} svgEl={svgEl} setSvgEl={setSvgEl}/>
}

const SVGMap = ({ mapDefs, data, setFocusRegion, showLabels, setSvgEl}) => {

	const [pathCentres, setPathCentres] = useState({}); // Estimate region centres from bounding boxes to place text labels

	if (!mapDefs) return null;
	const loading = data === 'loading';

	let regions = [];
	Object.entries(mapDefs.regions).forEach(([id, props]) => {
		const zeroFill = "hsl(204, 27%, 45%)";
		
		// HACK , our labels don't line up nicely with the maps labels, this just brute forces them to work
		// there's no GB label so it shouldn't cause any issues, just it's a stupid fix
		let { impressions = 0, colour = zeroFill } = (id == "UK") ? data?.["GB"] || {} : data?.[id] || {}


		props = { ...props, fill: colour, stroke: '#fff', strokeWidth: mapDefs.svgAttributes.fontSize / 10 };
		// Don't paint misleading colours on a map we don't have data for
		if (loading) {
			props.fill = 'none';
			props.stroke = '#bbb';
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
			<title>
				{props.name}: {impressions} impressions 
			</title>
		);

		regions.push(
			<path key={`path-${id}`} data-id={id} {...props} ref={pathRef}>
				{title}
			</path>
		);
	})
	const svgRef = (element) => element && setSvgEl(element);

	return (
		<div className="map-container text-center">
			<svg className="map-svg" version="1.1" {...mapDefs.svgAttributes} xmlns="http://www.w3.org/2000/svg" ref={svgRef}>
				{regions}
			</svg>
			{loading && <Misc.Loading text={`Fetching map data for ${mapDefs.name}`} />}
		</div>
	);
}

const CampaignCountryList = ({data}) => {
	const regions = Object.keys(data)

	// if data has an unset region, push it to the back so it'll appear at the bottom of the country list
	let unsetIndex = regions.indexOf("unset")
	if(unsetIndex !== -1){
		regions.splice(unsetIndex, 1)
		regions.push("unset")
	}
	
	return regions.map((region) => {
		if(data[region].impressions === 0) return
		const impressions = printer.prettyNumber(data[region].impressions, 21) // get a pretty number with no rounding on sigfigs 
		const countries = data[region].campaignsInRegion
		const pluralCampaigns = countries > 1 ? "Campaigns" : "Campaign"
		const isUnset = region === "unset"
		return (
		<div className='country-impression-container'>
			<div className='country-impression-content'>
				<div className='flag-cropper'>
					<img src={"/img/country-flags/"+region.toLowerCase()+".svg"}className='country-flag' alt={("flag for " + region)} />
				</div>
				<div className='impression-text'>
					<p className='impression-header'>{region}</p>
					<p className='impression-values'>{countries} {pluralCampaigns}{"  |  "}{impressions} Views</p> 
				</div>
			</div>
			{isUnset && <p className='unset-warning'>Geolocation recording was implemented in April 2022. Older ads impressions will not be locatable</p>}
		</div>)
})
}

export default ImpactOverviewPage;
