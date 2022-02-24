import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import LinkOut from '../../base/components/LinkOut';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import { getBrowserVendor, isPortraitMobile, space } from '../../base/utils/miscutils';
import { PageCard, CardImgLeft, NewsAwards, TriCards, CurvePageCard } from './CommonComponents';
import {T4GSignUpButton} from '../T4GSignUp';
import SubscriptionBox, { SubscriptionForm } from '../cards/SubscriptionBox';
import DynImg from '../../base/components/DynImg';
import BG from '../../base/components/BG';

const OurStorySplash = () => {
	return (<>
		<CurvePageCard
			color="white"
			bgImg="img/ourstory/Good-Loop_WatchAnAdToGiveBack.png"
			bgSize="cover"
			bgPosition="center 65%"
			bgClassName="bg-gl-desat-blue"
			topSpace={150}
			className="text-center pt-0"
		>
			<h1>Our Story</h1>
			<p className='leader-text'>At Good-Loop, we're on a mission to make the internet a more positive place and to make online advertising a more positive force in the world.</p>
		</CurvePageCard>
		<PageCard className="text-center pt-0">
			<CardImgLeft imgUrl='img/homepage/amyanddaniel.png' roundedImg>
				<h3>How it all began</h3>
				<p>In 2016 our co-founder, Amy Williams put a question out to the advertising world - can we redesign online advertising to make annoying internet ads a force for good in the world?</p>
				<p>It was an ambitious question. But it turned out Daniel Winterstein had been asking himself the very same thing. Amy and Dan met up, shared stories, put ideas on the table, and in October 2016 their dream became a reality - Good-Loop was born. With one sole misson...</p>
			</CardImgLeft>
		</PageCard>
	</>)
}

const OurMissionSection = ({className}) => {
	return (<>
		<PageCard className={space("text-center bg-gl-light-pink", className)}>
			<div>
				<h1>Let's make the internet a more positive place</h1>
				<p className='leader-text mt-4'>At Good-Loop, we work with fantastic brands that want to make advertising good for everyone. The way we do it couldn't be simpler. We just need the final piece of the puzzle to make it happen - you.</p>
			</div>
			<br/>
			<CardImgLeft imgUrl='/img/ourstory/Good-Loop_UsingAdMoneyForGoodWithBG.png' classname='bg-white border mt-5' roundedImg>
				<h3>Here's how it works</h3>
				<p>With My.Good-Loop, every time you see, watch or engage with a brand’s ad through our platforms, we’ll donate 50% of the ad fee to charity.</p>
				<p>Since 2016, people like you have helped us raise millions of pounds for 100s of incredible causes all over the world. Just from seeing an ad. So what do you say? Fancy joining the Good-Loop community and helping us raise even more?</p>
				<T4GSignUpButton/>
			</CardImgLeft>
		</PageCard>
	</>)
}

const CaringCommunitySection = ({className}) => {
	return (<>
		<PageCard className={space("text-center bg-gl-light-pink", className)}>
			<div>
				<h1>We're one big caring community</h1>
				<p className='leader-text mt-5'>Today we're a fast-growing community of passionate, kind and caring people united by one ambition - to use online tech to make the world a better place.</p>
			</div>
			<Row className='mt-5'>
				<Col md={4}>
					<DynImg className='w-100 h-100 rounded' src="/img/ourstory/oxford-2.jpg" alt="" style={{objectFit:'cover'}}/>
				</Col>
				<Col md={4}>
					<DynImg className='w-100 h-100 rounded' src="/img/ourstory/edinburgh-team.jpg" alt="" style={{objectFit:'cover'}}/>
				</Col>
				<Col md={4}>
					<DynImg className='w-100 h-100 rounded' src="/img/ourstory/oxford-1.jpg" alt="" style={{objectFit:'cover'}}/>
				</Col>
			</Row>
			</PageCard>
			<PageCard className={space("text-center bg-gl-light-pink pt-0 shared-values", className)}>
				<h1>We're driven by shared values</h1>
				<Row className="pt-5">
					<Col md={4} className='mt-md-0 mt-4' >
						<img className='w-25' src="/img/icons/fifty-percent.png" alt="" />
						<h4 className='pt-4'>Give 50% of Ad money to charity </h4>
					</Col>
					<Col md={4} className='mt-md-0 mt-4' >
						<img className='w-25' src="/img/icons/padlock.png" alt="" />
						<h4 className='pt-4'>Protect online privacy</h4>
					</Col>
					<Col md={4} className='mt-md-0 mt-4' >
						<img className='w-25' src="/img/icons/planet.png" alt="" />
						<h4 className='pt-4'>Do good for the planet</h4>
					</Col>
				</Row>
				<Row className="pt-5">
					<Col md={4} >
						<img className='w-25' src="/img/icons/handshake.png" alt="" />
						<h4 className='pt-4'>Be honest and transparent </h4>
					</Col>
					<Col md={4} className='mt-md-0 mt-4' >
						<img className='w-25' src="/img/icons/world-hand.png" alt="" />
						<h4 className='pt-4'>Be ethical</h4>
					</Col>
					<Col md={4} className='mt-md-0 mt-4' >
						<img className='w-25' src="/img/icons/heart.png" alt="" />
						<h4 className='pt-4'>Be decent humans</h4>
					</Col>
				</Row>
			</PageCard>		
		</>)
}

const MyGetInvolvedSection = () =>{

	return(<>
	<PageCard className={"my-get-involved white text-center bg-gl-desat-blue pb-0"}>
		<img src="img/icons/Heart_single.png" className='logo' alt="" />
		<h1 className='white mb-5'>Get Involved!</h1>
		<p className='mb-5 leader-text'>Join the My.Good-Loop community today and start raising money for chairty. For free.</p>
		<T4GSignUpButton className="mb-5"/>
	</PageCard>
	<img className='w-100 d-none d-md-block' src="img/curves/curve-desat-blue-bottom.svg" alt="" />
	<PageCard className="container text-center mb-5">
		<p className='leader-text'>We're developing exciting new products that will help us all make the internet a more positive place. Register below to get exlusive access to future product launches and join the Good-Loop movement.</p>
		<SubscriptionForm purpose="preregister" />
	</PageCard>
	</>) 
}

export const OurStoryPage = () => {
	return (<>
	<div className="OurStoryPage widepage">
		<OurStorySplash />
		<OurMissionSection />
		<NewsAwards>
			<h1 className='mb-3'>We've been featured by</h1>
		</NewsAwards>
		<CaringCommunitySection />
		{/* TODO <NewsAwards firstIMG="Awards1" secondIMG="Awards2" thirdIMG="Awards3" /> */}
		<MyGetInvolvedSection classname="" />
		<TriCards className="TODO bg-gl-light-pink" 
			titles={["Check out our podcast", "Good-Loop for business", "Good-Loop for charities"]}
			texts={["Discover... a sentence about this page/article", "Discover... a sentence about this page/article", "Discover... a sentence about this page/article"]}
			images={["img/ourstory/podcast-mic.png", "img/homepage/good-loop-for-business.png", "img/ourstory/part-of-earth.png"]}
		/>
	</div>
	</>)
}

export default OurStoryPage;
