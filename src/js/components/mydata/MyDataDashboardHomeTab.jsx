import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Form, Alert} from 'reactstrap';
import { ProfileDot, ProfileDotRow, getThisWeeksAd, hasWatchedThisWeeksAd, MyDataCard, hasRegisteredForMyData } from './MyDataCommonComponents';
import { getCharityObject, getEmail, getPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import GoodLoopUnit from '../../base/components/GoodLoopUnit';
import ServerIO from '../../plumbing/ServerIO'
import TickerTotal from '../TickerTotal';
import Icon from '../../base/components/Icon';
import { T4GCharityScreenshot } from '../pages/CommonComponents';
import NGO from '../../base/data/NGO';
import C from '../../C';
import { getId } from '../../base/data/DataClass';
import NGOImage from '../../base/components/NGOImage';
import NGODescription from '../../base/components/NGODescription';
import { isPortraitMobile, space } from '../../base/utils/miscutils';
import DataStore from '../../base/plumbing/DataStore';
import PropControl from '../../base/components/PropControl';
import CharityLogo from '../CharityLogo';
import Misc from '../../base/components/Misc';
import { CompleteDataCTA, getDataProgress } from './MyDataDashboardPage';
import { setFooterClassName } from '../Footer';
import Person, { getProfile } from '../../base/data/Person';
import { MyDataSignUpButton, MyDataSignUpModal } from './MyDataSignUp';
import { modifyPage } from '../../base/plumbing/glrouter';


// Hidden until we get some latest news to show
/*
const LatestNewsCard = () => {
	const pvNgo = getCharityObject();
    let ngo = null;
    if (pvNgo) ngo = pvNgo.value || pvNgo.interim;

	return (<>
	<h1>Latest News</h1>
	<Container className='latest-news-card border border-dark rounded'>
		<Row id="latest-news-title-tab">
		</Row>
		<Row id="latest-news-content">
			<Col xs={4}>
			<img src="/img/placeholder-circle.png" className='w-100' alt="" />
			</Col>
			<Col xs={8}>
				<p>Complete Your Profile To Unlock More Donations for {ngo && ngo.name}.</p>
			</Col>
		</Row>
	</Container>
	</>);
};*/

const AchievementCard = () => {
	return (<>
	<h1 className="mt-4">Our Community Impact</h1>
	<Container className='dashboard-card achievements'>
			<Container className='together-we-raised'>
				<h3>Together we've raised</h3>
				<h1>&lt;&nbsp;<TickerTotal/>&nbsp;&gt;</h1>
				<h3>For global causes</h3>
			
				<Container className="d-flex flex-row justify-content-center">
					<img src="/img/mydata/world-impact.png" className='img-lg' />
				</Container>

				<Container className="my-2 py-2 text-white">
					<ProfileDotRow>
						<ProfileDot imgUrl="/img/mydata/supporting.png"><>1 Million Trees Planted</></ProfileDot>
						<ProfileDot imgUrl="/img/mydata/supporting.png"><>17,827 Children Vaccinated</></ProfileDot>
						<ProfileDot imgUrl="/img/mydata/supporting.png"><>12,689 lbs of Trash Collected From the Ocean</></ProfileDot>
					</ProfileDotRow>
				</Container>
			</Container>		
	</Container>
	</>)
}

const ThisWeeksAdCard = () => {
	// if user clicked "watch it again", override watched
	const [watchAnyway, setWatchAnyway] = useState(false);
	// The good-loop unit is calling back too fast before its loaded - use a timeout for now
	// TODO get proper loading callback
	const [adLoaded, setAdLoaded] = useState(false);
	useEffect(() => {
		setTimeout(() => setAdLoaded(true), 2500);
	}, [adLoaded]);

	const pvAd = getThisWeeksAd();
	const exists = !!(pvAd && pvAd.resolved && pvAd.value);
	const adid = exists && pvAd.value.id;
	const watched = adid && hasWatchedThisWeeksAd(adid) && !watchAnyway;

	const watchAgain = () => {
		setWatchAnyway(true);
		setAdLoaded(false);
	}

	const WatchedAd = ({className, style, children}) => {
		
		return <div className={space("watch-ad-done", className)} style={style}>
			<div className="watched-text">
				<img src="/img/mydata/tick-white.svg" className="tick"/>
				<h4>{children}</h4>
			</div>
			<img src="/img/mydata/fireworks.png" className="fireworks"/>
		</div>;
	}

	return (<MyDataCard
				className="this-weeks-ad"
				img={<div className="bg-gl-light-blue d-flex flex-row justify-content-center align-items-center">
					<img src="/img/mydata/ads-badge.png" className="title-img py-3"/>
				</div>}
		>
			<br/>
			<h4>Watch This Week's Ad</h4>
			<hr/>
			<div className="position-relative">
			{!watched ? 
				<div className="position-relative d-flex flex-column justify-content-center align-items-center">
					{adLoaded && exists && <WatchedAd className="position-absolute" style={{top:0, left:0, width:"100%", height:"100%"}}>Weekly Watch Done</WatchedAd>}
					{exists && adid ? <GoodLoopUnit vertId={adid} className="dashboard-ad"/>
						: (pvAd && pvAd.resolved ? <WatchedAd>
							No ad this week!
						</WatchedAd> : <Misc.Loading />)}
				</div> : 
				<WatchedAd>Weekly Watch Done</WatchedAd>}
			</div>
			<br/>
			<p className="text-center">When you watch one of our ads 50% of the ad fee goes to charity.</p>
			{watched && <div className="d-flex flex-row justify-content-center align-items-center">
				<Button color="primary" onClick={watchAgain}>Watch Again</Button>
			</div>}
		</MyDataCard>);
};

const GetT4GCard = ({ngo}) => {
	
	const hasT4G = Person.hasApp(getProfile().value, "t4g.good-loop.com");
	const [copiedLink, setCopiedLink] = useState(false);
	const copyLink = e => {
		e.preventDefault();
		if (!window.isSecureContext) {
			console.warn("Not in an HTTPS connection, so cannot copy to clipboard! Will work on HTTPS");
		} else {
			window.navigator.clipboard.writeText("https://my.good-loop.com/charity/" + getId(ngo));
		}
		setCopiedLink(true);
	}

	return <MyDataCard
			className="get-t4g"
			img={<div className="bg-gl-muddy-blue d-flex flex-row justify-content-center align-items-center">
					<img src="/img/mydata/tabs-badge.png" className="title-img py-3"/>
				</div>}
	>
		<br/>
		<h4>{hasT4G ? "Share Tabs for Good" : "Browse with Tabs for Good"}</h4>
		<hr/>
		<br/>
		<Row>
			<Col md={6} className="mb-3 mb-md-0">
				<img src="/img/homepage/slide-1.png" className="w-100 rounded"/>
			</Col>
			<Col md={6} className="d-flex flex-column align-items-center justify-content-center">
				<p className="text-center">
					{hasT4G ? "Share Tabs for Good with a friend so they can raise money for charity while they browse too!"
						: "Add Tabs for Good to your desktop browser to raise money for "+NGO.displayName(ngo)+" while you surf the web"}
				</p>
				{hasT4G ? <a onClick={copyLink} className="share-link">{copiedLink ? "LINK COPIED!" : "SHARE TABS FOR GOOD"}</a>
					: <C.A href={ngo ? "/charity/" + getId(ngo) : "/tabsforgood"}><Button color="primary">Find out more</Button></C.A>}
			</Col>
		</Row>
	</MyDataCard>;
};

const SignUpForMyDataCard = () => {
	return <MyDataCard
			className="mydata-dashboard-signup"
			img={<div className="bg-gl-muddy-blue d-flex flex-row justify-content-center align-items-center">
					<img src="/img/mydata/data-cta.png" className="title-img py-3"/>
				</div>}
		>
		<br/>
		<h4>Sign Up To My.Data</h4>
		<br/>
		<Row>
			<Col md={6} className="mb-3 mb-md-0">
				<img src="/img/mydata/my-data.png" className="w-100 rounded"/>
			</Col>
			<Col md={6} className="d-flex flex-column align-items-center justify-content-center">
				<p className="text-center">	
					Sign up for My-Data today
					<br />
					Share your online data with us  and we’ll transform it into money for good causes.
				</p>
				<MyDataSignUpButton />
			</Col>
		</Row>
	</MyDataCard>;
}

const AboutYourCharity = ({ngo}) => {
	if (!ngo) return null;
	const name = NGO.displayName(ngo);
	return (
		<Container className="dashboard-card supporting bg-white">
			<h5 className="pt-2">Your Are Supporting</h5>
			<br/>
			{ngo && <div className="charity-logo"><CharityLogo charity={ngo} /></div>}
			<br/>
			<div className="d-flex flex-row justify-content-center align-items-center">
				<NGOImage src="/img/stats1-cropped.jpg" main ngo={ngo} className="charity-img"/>
			</div>
			<br/>
			<h4 className="mt-3 text-left">What {name} Is Doing</h4>
			<NGODescription extended ngo={ngo} className="text-center"/>
		</Container>
	)
};


const MyDataDashboardHomeTab = () => {

	const pvCharity = getCharityObject();
	const ngo = pvCharity && (pvCharity.value || pvCharity.interim);
	const scrollToMyDataSignup = (e) => {
		e.preventDefault();
		document.getElementById("mydata-dashboard-signup").scrollIntoView({behavior: "smooth"});
	}

	const dataCompleteIsh = getDataProgress() > 0.65; // ?? ideally we'd distinguish between "complete" and "share"
	const hasMyData = hasRegisteredForMyData();

	useEffect(() => {
		if (isPortraitMobile()) setFooterClassName('bg-gl-light-pink');
	}, []);
	
	return (<>
		{/*<LatestNewsCard />*/}
		<br/>
		{ (!hasMyData || !dataCompleteIsh) &&
			<CompleteDataCTA ngo={ngo} 
			link={<>
				  <p className="text-black m-0">Complete your data profile to raise even more for {ngo && NGO.displayName(ngo) || "charity"}!</p>
				  <br/>
				  
				  {/* onClick doesn't seem to work with C.A */}
				  {!hasMyData 
				  	? <a onClick={scrollToMyDataSignup} style={{textDecoration: "underline"}}>Find out more</a>
					: <C.A href={"/account?tab=profile"} style={{textDecoration: "underline"}}>Complete your profile</C.A>
			      }
				</>} 
			/>
		}
		<br/>
		<hr/>
		<div className="bg-gl-lighter-blue-gradient dashboard-bg">
			<AchievementCard />
		</div>
		<div className="bg-gl-lighter-blue dashboard-bg">
			<br/>
			<AboutYourCharity ngo={ngo}/>
			<br/>
			<div className="position-relative">
				<img src="/img/curves/curve-light-pink.svg" className="w-100 d-md-none"/>
				<div className="mt-5 d-none d-md-block"/>
				<img src="/img/green/hummingbird.png" className="hummingbird"/>
			</div>
		</div>
		<div className="bg-gl-light-pink dashboard-bg">
			<br/>
			<h3 className="px-3 my-3 my-md-5 raise-more">Ways to Raise Even More</h3>
			<ThisWeeksAdCard />
			<br />
			{ <div id="mydata-dashboard-signup" style={hasMyData ? {display: "none"} : {}}><SignUpForMyDataCard/></div>}
			<MyDataSignUpModal />;
			<br/>
			<GetT4GCard ngo={ngo}/>
			<br/>
			<FeedbackCard />
		</div>
	</>)
};

const FeedbackCard = () => {
	let [sent, setSent] = useState();
	const sendFeedback = () => {
		let data = {
			name: Login.getId(),
			email: getEmail(),
			message: DataStore.getValue("widget","feedback","message"),
			notify: "support@good-loop.com"
		};
		ServerIO.load("https://profiler.good-loop.com/form/good-loop.com", {data, method: 'POST'});
		setSent(true);
	};

	return (<Container className="dashboard-card">
		<h1>Send Feedback</h1>
		<p className="text-center">Let us know what you think! Feedback really helps us to learn and improve.</p>
		<br/>
		<Row>
			{/* TODO an image <Col md={6} className="mb-3 mb-md-0">
				<img src="/img/homepage/slide-1.png" className="w-100"/>
			</Col> */}
			<Col className="d-flex flex-column align-items-center justify-content-center">
				<Form onSubmit={sendFeedback} className=" w-100 d-flex flex-column align-items-center justify-content-center">
					<PropControl label="Your Message" className="w-100 d-flex flex-column align-items-center justify-content-center" disabled={sent} type="textarea" rows={5} prop="message" path={["widget","feedback"]} />
					<Button disabled={sent} color="primary" className='mx-auto mt-2 w-50' onClick={sendFeedback}>Send</Button>
				</Form>
				{sent && <Alert color="success">Thank you - Your message has been sent.</Alert>}
			</Col>
		</Row>
</Container>);
};

export default MyDataDashboardHomeTab;