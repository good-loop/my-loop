import React from 'react';
import Login from 'you-again';
import _ from 'lodash';
// import pivot from 'data-pivot';
import { Chart } from 'react-google-charts';
import Roles from '../../base/Roles';
import C from '../../C';
import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import ActionMan from '../../plumbing/ActionMan';
import {ListItems} from '../../base/components/ListLoad';
import Footer from '../Footer';
import NavBar from '../MyLoopNavBar';
import Money from '../../base/data/Money';
import CampaignPageDC from '../../data/CampaignPage';
import SearchQuery from '../../base/searchquery';
import BS from '../../base/components/BS';
import ACard from '../cards/ACard';
import CharityCard from '../cards/CharityCard';
import AdvertCard from '../cards/AdvertCard';
import {sortByDate} from '../../base/utils/SortFn';
import Counter from '../../base/components/Counter';
import pivot from 'data-pivot';
import printer from '../../base/utils/printer';
import publishers from '../../data/PublisherList';
import CSS from '../../base/components/CSS';

let isMulti = false; // We'll use this for some text options, such as plurals in splash or ad cards presentation
/**
 * HACK fix campaign name changes to clean up historical campaigns
 */
const viewCount = (viewcount4campaign, ad) => {
	if ( ! ad.campaign) return null;
	let vc = viewcount4campaign[ad.campaign];
	if (vc) return vc;

	// HACK TOMS?? ella / josh / sara
	if (ad.vertiser==='bPe6TXq8') {
		isMulti = true;
		let keyword = ad.campaign.includes('sara')? 'sara' : ad.campaign.includes('ella')? 'ella' : 'josh';
		let total = 0;
		Object.keys(viewcount4campaign).filter(c => c.includes(keyword)).forEach(c => total += viewcount4campaign[c]);
		return total;
	}
	return null;
};

/**
 * Expects url parameters: `gl.vert` or `gl.vertiser` or `via`
 * TODO support q=flexible query
 * TODO support agency and ourselves! with multiple adverts
 * Split: branding - a vertiser ID, vs ad-params
 */
const CampaignPage = () => {
	// What adverts should we look at?
	let { 'gl.vert': adid, 'gl.vertiser': vertiserid, via, q='', status=C.KStatus.PUB_OR_ARC } = DataStore.getValue(['location', 'params']) || {};	
	let sq = new SearchQuery(q);
	// NB: convert url parameters into a backend ES query against the Advert.java object
	if (adid) sq = sq.setProp('id', adid);
	if (vertiserid) sq = sq.setProp('vertiser', vertiserid);
	if (via) sq = sq.setProp('via', via);
	q = sq.query;
	console.log("query", q);
	const slug = DataStore.getValue('location','path', 1);
	const all = slug==='all';
	if ( ! q && ! all) {
		// No query -- show a list
		// TODO better graphic design before we make this list widget public
		if ( ! Login.isLoggedIn()) {
			return <div>Missing: campaign or advertiser ID. Please check the link you used to get here.</div>;
		}
		return <ListItems type={C.TYPES.Advert} servlet='campaign' />;		
	}

	let pvAds = ActionMan.list({type: C.TYPES.Advert, status, q});
	if (!pvAds.resolved) {
		return <Misc.Loading text='Loading campaign data...' />;
	}

	let ads = pvAds.value.hits;

	// No ads?!
	if ( ! ads.length) {
		return <BS.Alert>Could not load adverts for {q} {status}</BS.Alert>;
	}

	// Get the advertiser's name (TODO append to advert as vertiserName)
	const pvVertiser = ActionMan.getDataItem({type: C.TYPES.Advertiser, id: ads[0].vertiser, status: C.KStatus.PUBLISHED});
	if (!pvVertiser.resolved) {
		return <Misc.Loading text='Loading campaign data...' />;
	}
	const vertiser = pvVertiser.value;

	// console.log(ads)

	// Combine campaign page and branding settings from all ads
	// Last ad wins any branding settings!
	// TODO support for agency level (and avdertiser level) branding to win through
	let branding = {};
	let campaignPage = {};
	ads.forEach(ad => Object.assign(branding, ad.branding));
	ads.forEach(ad => Object.assign(campaignPage, ad.campaignPage));
	
	const soloAd = ads.length===1? ads[0] : null;
	// const startDateString = soloAd && soloAd.startDate;
	// const smallPrint = soloAd && soloAd.smallPrint;

	// SoGive occasionally provides duplicated charity objects, so we check and filter them first.
	// TODO: This check shouldn't be here, maybe SoGive can filter its stuff before sending it over?
	const removeDuplicateCharities = arr => {
		let ids = [];
		return arr.filter(obj => {
			if ( ! obj || ! obj.id) return false;
			if (ids.includes(obj.id)) return false;
			ids.push(obj.id);
			return true;
		});
	};

	// individual charity data
	let charities = removeDuplicateCharities(_.flatten(ads.map(
		ad => ad.charities && ad.charities.list || []
	)));
	let cids = charities.map(x => x.id);

	// Unfortunately need to repeat structure as ActionMan.list does not return a promise
	let sqDon = new SearchQuery();
	for(let i=0; i<ads.length; i++) {
		sqDon = sqDon.or('vert:' + ads[i].id);
		if (ads[i].campaign) sqDon = sqDon.or('campaign:' + ads[i].campaign);
	}

	// load the community total for the ad
	let pvDonationsBreakdown = DataStore.fetch(['widget','CampaignPage','communityTotal', sqDon.query], () => {
		// TODO campaign would be nicer 'cos we could combine different ad variants... but its not logged reliably
		// Argh: Loop.Me have not logged vert, only campaign.
		// but elsewhere vert is logged and not campaign.
		// let q = ad.campaign? '(vert:'+adid+' OR campaign:'+ad.campaign+')' : 'vert:'+adid;		
		// TODO "" csv encoding for bits of q (e.g. campaign might have a space)
		return ServerIO.getDonationsData({q:sqDon.query});	
	}, true, 5*60*1000);

	if ( ! pvDonationsBreakdown.resolved ) {
		return <Misc.Loading text='Loading campaign donations...' />;
	}
	if ( ! pvDonationsBreakdown.value ) {
		// TODO let's refactor this out into a standard error card -- possibly stick it in wwappbase or Misc
		return <div>Error: {pvDonationsBreakdown.error}. Try reloading the page. Contact us if this persists.</div>;
	}

	let campaignTotal = pvDonationsBreakdown.value.total; 
	let donationValue = campaignTotal; // check if statically set and, if not, then update with latest figures
	// Allow the campaign page to override and specify a total
	let campaignTotalViews = pvDonationsBreakdown.value.stats.count;
	let campaignPageDonations = ads.map(ad => ad.campaignPage && CampaignPageDC.donation(ad.campaignPage)).filter(x => x);
	if (campaignPageDonations.length === ads.length) {
		donationValue = Money.sum(campaignPageDonations);
	}
	donationValue = donationValue.value;
	// also the per-charity numbers
	let donByCid = pvDonationsBreakdown.value.by_cid;
	console.log(pvDonationsBreakdown);

	let brandColor = branding.color || branding.backgroundColor;

	// Group ads by campaign {String: Advert}
	let campaignByName = {};
	ads.forEach(ad => {
		let name = ad.campaign || ad.id;
		campaignByName[name] = Object.assign({}, campaignByName[name], ad);
	});

	let campaigns = Object.values(campaignByName);
	// sort by date
	campaigns.sort(sortByDate(ad => ad.end || ad.start));

	// Get ad viewing data
	let pvViewData = DataStore.fetch(['misc','views',q], () => {
		// filter to these ads
		let qads = '(vert:'+ads.map(ad => ad.id).join(" OR vert:")+')';
		let filters = {
			dataspace: 'gl',
			q: 'evt:minview AND '+qads // minview vs spend ??
		};
		// start = early for all data
		return ServerIO.getDataLogData({filters, breakdowns:['campaign', 'pub'], start:'2017-01-01', name:'view-data'});
		// return ServerIO.getDonationsData({cid:'ashoka', start: '2017-01-01T00:00:00Z', end: '2019-10-15T23:59:59Z'})
	});

	let viewcount4campaign = {};
	window.viewcount4campaign = viewcount4campaign;
	if (pvViewData.value) {
		window.pivot = pivot; // for debug
		viewcount4campaign = pivot(pvViewData.value, "by_campaign.buckets.$bi.{key, doc_count}", "$key.$doc_count");
	}

	const pubData = pvViewData.value;

	// @Andris - for hack code like this - document the hack when you write it.
	const mockUpLogoUrls = [
		{
			name: 'buzzfeed',
			branding: { logo: 'http://www.worksdesigngroup.com.php72-34.phx1-1.websitetestlink.com/wp-content/uploads/2017/05/buzzfeed-e1515438116988.png'},
			url: 'https://www.buzzfeed.com'
		},
		{
			name: 'empire',
			branding: { logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1l-KWl1ddiB47rGuU4qO6D_NPGGdDeB6WyM9vKLCPKSGC-stw&s'},
			url: 'https://www.empire.com'
		},
		{
			name: 'nme',
			branding: { logo: 'https://s3.eu-central-1.amazonaws.com/centaur-wp/designweek/prod/content/uploads/2013/10/image001-1002x466.jpg'},
			url: ''
		}
	];
	// Array of publisher logos from mockup.
	// TODO: Get proper
	// let campaignPublishers = [];
	// if (pubData && pubData.by_pub) {
	// 	campaignPublishers = pubData.by_pub.forEach(pub => {
	// 		publishers.forEach(publisher => {
	// 			if (pub.key === publisher.name) {
	// 				campaignPublishers.push(publisher);
	// 			}	
	// 		});
	// 	});
			

	// }
	// console.log(`campaign publishers`, campaignPublishers);
	// (pub => <img src={pub.branding.logo} alt={pub.name} />);

	// publisherCards(pubData);

	// Calculates total donations per charity based on percentage available, adding [donation] and [donationPercentage] to the charities object
	const assignUnsetDonations = () => {
		charities = charities.map(char => {
			if (donByCid[char.id]) { // if the charities have been edited after the campaign they might be missing values.
				return { ...char, donation: Math.floor(donByCid[char.id].value)};
			} return char; 
		});

		charities = charities.filter(c => c.donation); // Get rid of charities with no logged donations.
		const donationTotalMinusUnset = Object.values(charities).reduce((t, {donation}) => t + donation, 0);
		charities = charities.map(e => {
			const percentage = e.donation * 100 / donationTotalMinusUnset;
			const calculatedDonation = percentage * donationValue / 100;
			return {...e, donation: calculatedDonation, donationPercentage: percentage};
		});
	};

	// Prepare data to be used in the Chart from charities names and donation value.
	const chartData = () => {
		let dataArray =[];
		charities.forEach(char => dataArray.push([char.name, Math.floor(char.donation)]));
		return [['Charity', 'Donation'], ...dataArray];
	};

	let charitiesById = _.uniq(_.flattenDeep(ads.map(c => c.charities.list)));
	let charIds = [];
	charitiesById.forEach(c => {
		if (!charIds.includes(c.name)) {
			charIds.push(c.name);
		}
	});

	// Picks one video from each campaign to display as a sample.
	const sampleAdFromEachCampaign = () => {
		let campaignNames = [];
		return removeDuplicateCharities(ads).map(ad => {
			if (!campaignNames.includes(ad.campaign) && ad.videos[0].url) { // Only those ads with a valid video. Filters out dummies.
				campaignNames.push(ad.campaign);
				return ad;
			} return null;
		}).filter(ad => ad);
	};

	// Sum of the views from every ad in the campaign. We use this number for display
	// and to pass it to the AdvertCards to calculate the money raised against the total.
	let totalViewCount = 0;
	sampleAdFromEachCampaign().forEach(ad => totalViewCount += viewCount(viewcount4campaign, ad));

	assignUnsetDonations();

	// We use this bit to alternate orientation of charity cards, either left or right
	// TODO device a more elgant way of accomplishing this effect.
	let imageLeft = false;

	console.log(ads);
	if(pubData && pubData.by_pub) console.log(pubData.by_pub.buckets);
	// console.log(donationValue);
	// TODO: refactor this because it's very similar now to mypage
	// Don't do multiple pies - but group all below a certain threshold as "Other"
	// TODO Assign unset donations - Check whether we do proportional or equal
	// TODO Discrepancy between viewer counts - probably because some percentage unlock by clickthrough & videos list uses minview
	return (<>
		<CSS css={campaignPage.advanced && campaignPage.advanced.customcss} />
		<CSS css={branding.customCss} />
		<div className="widepage CampaignPage text-center">
			<NavBar brandLogo={branding.logo} logo="/img/new-logo-with-text-white.svg" style={{backgroundColor: brandColor}} />
			<div className='avoid-navbar' />

			<SplashCard branding={branding} campaignPage={campaignPage} donationValue={donationValue} totalViewCount={totalViewCount} />
			
			<div className="container-fluid" style={{backgroundColor: '#af2009'}}>
				<div className="intro-text">
					<span>At {vertiser.name || ads[0].name} we want to give back. We work with Good-Loop to put out Ads for Good, and donate money to charity. Together with <span className="font-weight-bold">{printer.prettyNumber(totalViewCount)}</span> people we've raised funds for the following causes and can't wait to see our positive impact go even further. See our impact below.</span>
				</div>
			</div>

			<div className="charity-card-container section clearfix">
				{charities.map( (charity, i) => {
					imageLeft = !imageLeft;
					return <CharityCard
						i={i} key={charity.id}
						imageLeft={imageLeft}
						charity={charity}
						donationValue={charity.donation}
						donationBreakdown={pvDonationsBreakdown}
					/>;
				})}
			</div>

			<div className="section pub-container d-flex column justify-content-center">
				<div className="header-font text-center pb-5 pl-4 pr-4">This is where you might have seen our campaign</div>
				<div className="row justify-content-around align-items-center">
					{/* {publishers} */}
				</div>
			</div>

			{/* <div className="total-views-column">
				<div className="d-flex align-items-center">
					<img src={branding.logo} alt="'advertise-logo" />
				</div>
				<div className="align-middle d-flex align-items-center">
					<div className="sub-header-font">
						{isMulti? 
							<span><span className="font-weight-bold">{printer.prettyNumber(totalViewCount)}</span><span> people watched an ad in all campaigns to unlock a donation</span></span>
							: <span>During this campaign: </span> }
					</div>
				</div>
			</div> */}

			<div className="advert-card-container clearfix  justify-content-center">
				<div className="pt-5 pb-4 advert-section-header" style={{margin: '0 auto'}}>The {isMulti? 'Campaigns' : 'Campaign'}</div>
				<div className="column justify-content-center mx-auto">
					{sampleAdFromEachCampaign().map( 
						(ad, i) => <AdvertCard 
							key={ad.id} 
							i={i} 
							advert={ad} 
							isMulti={isMulti}
							viewCount={viewCount(viewcount4campaign, ad)} 
							donationTotal={donationValue}
							totalViewCount={totalViewCount} />)}
				</div>
			</div>
			<Footer />
		</div>
	</>
	);
}; // ./CampaignPage


const SplashCard = ({branding, campaignPage, donationValue, totalViewCount}) => {
	// Use background image given to adunit, or show default image of sand dune 
	const backgroundImage = (campaignPage && campaignPage.bg) || (ServerIO.MYLOOP_ENDPONT + '/img/wheat_fields.jpg');
	return (<ACard className="hero">
		<div className='flex-row flex-centre p-1'>
			<img className='hero-logo' src={branding.logo} alt='advertiser-logo' />
		</div>
		<div className='sub-header p-1'>
			<div>
				<span>Together our ads for good have raised</span>
			</div>
			{donationValue? <div className='header' style={{color: 'black'}}>&pound;<Counter value={donationValue} minimumFractionDigits={2} /></div> : 'money'}
		</div>
	</ACard>);
};

/**
 * TODO link to a part of a page. How do we do this, given that we already use #foo for page nav??
 * TODO move into Misc?
 */
const ScrollTo = ({aName, children}) => {
	let url = window.location+"#"+escape(aName); // TODO modify to include something that will trigger a scroll to the target aName
	return <a href={url}>{children}</a>;
};

export default CampaignPage;
