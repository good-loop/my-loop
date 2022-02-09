import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import LinkOut from '../../base/components/LinkOut';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import { getBrowserVendor, isPortraitMobile, space } from '../../base/utils/miscutils';
import { PageCard, CardImgLeft, NewsAwards, TriCards } from './CommonComponents';
import {T4GSignUpButton} from '../T4GSignUp';

const OurStorySplash = () => {
	return (<>
		<div className="our-story-curve-banner">
			<img className='w-100 curve' src="img/curves/curve-white.svg" alt="" />
		</div>
		<PageCard className="text-center pt-0">
			<h1>Our Story</h1>
			<p>At Good-Loop, we're on a mission to make the internet a more postive place and to make online advertising a more positive force in the world.</p>
		</PageCard>
		<PageCard className="text-center">
			<h1>Can we make online ads a force for good?</h1>
			<CardImgLeft imgUrl='img/homepage/amyanddaniel.png'>
				<h3>How it all began</h3>
				<p>In 2016 our co-founder, Amy Williams put a question out to the advertising world - can we redesign online advertising to make annoying internet ads a force for good in the world?</p>
				<p>It was an ambitious question. But it turned out Daniel Winterstein had been asking himself the very same thing. Amy and Dan met up, shared stories, put ideas on the table, and in October 2016 their dream became a reality - Good-Loop was born. With one sole misson...</p>
			</CardImgLeft>
		</PageCard>
	</>)
}

const OutMissionSection = ({className}) => {
	return (<>
		<PageCard className={space("text-center bg-gl-light-pink", className)}>
			<div>
				<h1>Let's make the internet a more postive place</h1>
				<p>At Good-Loop, we work with fantastic brands that want to make advertising good for everyone. The way we do it couldn't be simpler. We just need the final piece of the puzzle to make it happen - you.</p>
			</div>
			<CardImgLeft imgUrl='img/ourstory/nyc.png' classname='bg-white border'>
				<h3>Our Misson</h3>
				<p>With MY.Good-Loop. Every time you see, watch or engage with a brand's ad ad through our platforms, we'll donate 50% of the ad fee to charity. Told you it was simple. </p>
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
				<p>Today we're a fast-growing community of passionate, kind and caring people united by one ambition - to use online tech to make the world a better place.</p>
			</div>
			<Row>
				<Col md={4}>
					<img className='w-100 h-100 rounded' src="img/ourstory/ideas.png" alt="" style={{objectFit:'cover'}}/>
				</Col>
				<Col md={4}>
					<img className='w-100 h-100 rounded' src="img/homepage/amyanddaniel.png" alt="" style={{objectFit:'cover'}}/>
				</Col>
				<Col md={4}>
					<img className='w-100 h-100 rounded' src="img/homepage/amyanddaniel.png" alt="" style={{objectFit:'cover'}}/>
				</Col>
			</Row>
			</PageCard>
			<PageCard className={space("text-center bg-gl-light-pink pt-0", className)}>
				<h1>We're all driven by the same value too</h1>
				<Row className="pt-5">
					<Col md={4} className="video-points">
						<img className='w-50' src="/img/homepage/bird-circle.png" alt="" />
						<h3 className='pt-4'>Keep giving 50% of ad money to charity </h3>
					</Col>
					<Col md={4} className="video-points">
						<img className='w-50' src="/img/homepage/heart.png" alt="" />
						<h3 className='pt-4'>Protect online privacy</h3>
					</Col>
					<Col md={4} className="video-points">
						<img className='w-50' src="/img/homepage/girl-circle.png" alt="" />
						<h3 className='pt-4'>Do good for the planet</h3>
					</Col>
				</Row>
				<Row className="pt-5">
					<Col md={4} className="video-points">
						<img className='w-50' src="/img/homepage/bird-circle.png" alt="" />
						<h3 className='pt-4'>Be honest and transparent </h3>
					</Col>
					<Col md={4} className="video-points">
						<img className='w-50' src="/img/homepage/heart.png" alt="" />
						<h3 className='pt-4'>Be decent humans</h3>
					</Col>
					<Col md={4} className="video-points">
						<img className='w-50' src="/img/homepage/girl-circle.png" alt="" />
						<h3 className='pt-4'>Be ethical</h3>
					</Col>
				</Row>
			</PageCard>		
		</>)
}

const MyGetInvolvedSection = () =>{

	return(<>
	<PageCard className={"my-get-involved white text-center bg-gl-desat-blue pb-0"}>
		<h1 className='white mb-5'>Get Involved!</h1>
		<p className='mb-5'>Join the My.Good-Loop community today and start raising money for chairty. For free.</p>
		<T4GSignUpButton />
	</PageCard>
	<img className='w-100 d-none d-md-block' src="img/curves/curve-desat-blue-bottom.svg" alt="" />
	<div className="text-center">
		<p>We're developing exciting new products that will help us all make the internet a more positive place. Register below to get exlusive access to future product launches and join the Good-Loop movement.</p>
		<p>Your email</p>
		<input type="email" />
		<p><b>TODO</b> Register Area</p>
	</div>
	</>)
}

export const OurStoryPage = () => {
	return (<>
	<div className="OurStoryPage widepage">
		<OurStorySplash />
		<OutMissionSection />
		<NewsAwards firstIMG="img/homepage/BBCNews.png" secondIMG="img/homepage/The-Guardian.png" thirdIMG="img/homepage/BBCNews.png">
			<h1 className='mb-5'>We've been featured by</h1>
		</NewsAwards>
		<CaringCommunitySection />
		<NewsAwards firstIMG="Awards1" secondIMG="Awards2" thirdIMG="Awards3" />
		<MyGetInvolvedSection classname="" />
		<TriCards className="bg-gl-light-pink" 
			firstTitle="Check out our podcast" firstText="Discover... a sentence about this page/article" firstIMG="img/ourstory/podcast-mic.png"
			secondTitle="Good-Loop for business" secondText="Discover... a sentence about this page/article" secondIMG="img/homepage/good-loop-for-business.png"
			thirdTitle="Good-Loop for charities" thirdText="Discover... a sentence about this page/article" thirdIMG="img/ourstory/part-of-earth.png"
		/>
	</div>
	</>)
}

export default OurStoryPage;
