import React, {useEffect, useRef, useState, useCallback} from 'react';
import Login from 'you-again';
import { Col, Row, Form } from 'reactstrap';

import DataStore from '../../base/plumbing/DataStore';

import DigitalMirrorCard from '../cards/DigitalMirrorCard';
import ConsentWidget from '../ConsentWidget';
import SignUpConnectCard from '../cards/SignUpConnectCard';
import LinkedProfilesCard from '../cards/LinkedProfilesCard';
import MyLoopNavBar from '../MyLoopNavBar';
import { LoginLink } from '../../base/components/LoginWidget';
import Footer from '../Footer';
import {getAllXIds} from '../../base/Profiler';
import Misc from '../../base/components/Misc';
import { space } from '../../base/utils/miscutils';
import PropControl from '../../base/components/PropControl';
import SubscriptionBox from '../cards/SubscriptionBox';
import ShareButton from '../ShareButton';
import { addImageCredit } from '../../base/components/AboutPage';

const Page = () => {
	const xids = DataStore.getValue(['data', 'Person', 'xids']) || [];

	// HACK (23/04/19): you_again does not call login.change() after user connects with Twitter
	// Means that xids were never being refreshed => user can never use the DigitalMirror
	// Think that taking a look at you_again is the proper long-term solution, but this will do for right now
	useEffect(() => {
		DataStore.setValue(['data', 'Person', 'xids'], getAllXIds());
	}, [Login && Login.aliases && Login.aliases.length]);

	const user = Login.getUser();
	const name = Login.isLoggedIn() ? user.name || user.xid : "";

	return (
		<div className="AccountPage">
			<MyLoopNavBar logo="/img/new-logo-with-text-white.svg" alwaysScrolled/>
			<div className="container mt-5 pt-5">
				<Row className="mb-5 user">
					<Col md={3} className="d-md-block d-flex justify-content-center">
						<img src="/img/LandingBackground/user.png" alt="user icon" />
					</Col>
					<Col md={8} className="flex-column justify-content-center align-items-start">
						{Login.isLoggedIn() ? <div>
							<h1>Hi {name},</h1>
							<p>Thanks for being a member of the Good-loop family. Together we are changing the global ad industry and making a meaningful impact on the world.</p>
						</div>:<div> <h1>You need an account to see this page.</h1>
							<LoginLink className="btn btn-transparent fill">Register / Log in</LoginLink>
						</div>}
					</Col>
				</Row>
				
				{Login.isLoggedIn() ? <>
					<div className="w-75 mx-auto">
						<div className="text-center">
							<h2>What to do now?</h2>
							<p>You have already made the first important step in helping us: you joined our community. But there is more you can do!</p>
						</div>
						<MoreToDo/>
					</div>
					
					<h2 className="text-center mb-5">Your settings</h2>
					<Settings xids={xids}/>
				</> : null}

			</div>
		</div>
	);
};

addImageCredit({name:"add-user", author:"Icons8", url:"https://icons8.com/icons/set/add-user-male"});

// See also GetInvoledPage
export const MoreToDo = () => {
	const [subbed, setSubbed] = useState(false);

	return (
		<div className="more-to-do TubeLine">
			<DoSection title="Sign up" tqTitle="Thanks for signing up" 
				img="/img/icons8-add-user-male.png" done={Login.isLoggedIn()}>
				<p>Creating an account unlocks more features, which help us do more good and gives you more control.</p>
				{ ! Login.isLoggedIn() && <LoginLink><div className="btn btn-transparent fill">Sign up</div></LoginLink>}
			</DoSection>
			<DoSection title="Recognise Good-Loop ads" img="/img/LandingBackground/Group30.png" done>
				<p className="w-md-50">Remember our logo, so when you see one of our ads, 
				you can recognise it. The Good-Loop logo guarantees that a full 50% of the money is going to charity.</p>
				<img className="w-50" src="/img/gl-logo/rectangle/logo-name.svg" alt="logo" />
			</DoSection>
			<DoSection title='Newsletter' tqTitle="Thanks for subscribing to our newsletter" img="/img/LandingBackground/Group33.png" done={subbed}>
				<p>Sign up to our monthly newsletter to read about the ad world and our achievements within it.</p>
				<SubscriptionBox onSubmit={() => setSubbed(true)} />
			</DoSection>
			<DoSection title="Share the good news" img="/img/LandingBackground/share.png" last>
				<p className="w-md-50">Spread the word about our mission by sharing this website on one of your social media channels.</p>
				<ShareButton className="btn-transparent fill"
					title="My-Loop"
					image="/img/GoodLoopLogos_Good-Loop_AltLogo_Colour.png"
					description="Using ads for good"
					url="https://my.good-loop.com"
					onShare={() => {
						console.error("TODO onShare");
					}}
				>
					Share
				</ShareButton>
			</DoSection>
		</div>
	);
};

const Settings = ({xids}) => {
	return (<div className="settings">
		<ConsentWidget xids={xids}/>
		<div className="pt-3"/>
		<YourDataSettings/>
	</div>);
};

const YourDataSettings = () => {
	const path = ['widget', 'YourDataWidget', 'details'];
	return (<div className="your-data-form">
		<h4>Your data:</h4>
		<Row>
			<Col md={4}>Name:</Col>
			<Col md={8} xs={6}>
				<PropControl 
					path={path} 
					prop="name"
					type="text" 
					saveFn={null} 
				/>
			</Col>
		</Row>
		<Row>
			<Col md={4}>Email:</Col>
			<Col md={8} xs={6}>
				<PropControl 
					path={path} 
					prop="email"
					type="text" 
					saveFn={null} 
				/>
			</Col>
		</Row>
		<Row>
			To change password, please go through password reset.
		</Row>
	</div>);
};

/**
 * 
 * @param {!string} img url for an icon in a yellow circle. Minor TODO this would be nicer as a text icon (unicode or an icont font like FA) instead of an image
 * @param {?boolean} last If false, use .doline to draw in a line down to the next item
 */
const DoSection = ({title, tqTitle, done=false, img, last=false, children}) => {	
	return (
		<Row className={space("position-relative", done ? "done" : "")}>
			{!last ? <div className="TubeLine-line" /> : null}
			<Col md={2} className="mb-5 text-center">
				<img src={done ? "/img/LandingBackground/Group30.png" : img} className="w-100 TubeLine-img"/>
			</Col>
			<Col className="offset-md-1 flex-column unset-margins justify-content-center mb-5">
				<div> {/* NB: div needed to avoid centering children */}
					<h4>{done? tqTitle : title}</h4>
					{children}
				</div>
			</Col>
		</Row>
	);
};

export default Page;
