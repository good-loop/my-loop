import React, { useEffect } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import { isPortraitMobile } from '../../base/utils/miscutils';
import C from '../../C';
import CharityLogo from '../CharityLogo';
import { setFooterClassName } from '../Footer';
import { MyLandingSection, HowTabsForGoodWorks, PageCard, TabsForGoodSlideSection, TriCards, WhatIsTabsForGood, CornerHummingbird } from './CommonComponents';

const CharityT4GLogos = ({ngo, className, style, autosize}) => {
	const containerStyle = (!isPortraitMobile() && autosize) ? {width:"40%"} : {};
	return <Container fluid style={containerStyle}>
		<Row className={className} style={style} noGutters>
			<Col xs={6}>
				<CharityLogo charity={ngo} className="charity-banner-logo" />
			</Col>
			<Col xs={6} className='d-flex flex-column justify-content-center'>
				<img src="/img/gl-logo/TabsForGood/TabsForGood_Logo-01.png" className="charity-banner-logo" />
			</Col>
		</Row>
	</Container>;
}

const HelpCharityTogetherCard = ({ngo}) => {
	return <PageCard>
		<h1>Let's help {ngo.name}<br/>do even more good.<br/>Together.</h1>
		<Row className='mt-5 pt-5'>
			<Col md={6}>
				<img src={ngo.images} className='w-100'/>
			</Col>
			<Col md={6} className='p-5 d-flex flex-column justify-content-between'>
				<div>
					<h3>What {ngo.name} is doing</h3>
					<p>{ngo.summaryDescription || ngo.description}</p>
				</div>
				<T4GCTA className="w-100"/>
			</Col>
		</Row>
		{/*
		<Row className='mb-4 mt-5 pt-5'>
			{isPortraitMobile() ? secondSection.reverse() : secondSection}
		</Row>
		*/}
		<div className='d-flex justify-content-center mt-5 pt-5'>
			<CharityT4GLogos ngo={ngo} autosize/>
		</div>
	</PageCard>;
};

const SignUpSection = ({ngo}) => {
	return(
		<PageCard className="sign-up-section text-center bg-gl-pale-orange">
			<h1>Sign up today and raise money for {ngo.name}. For free.</h1>
			{isPortraitMobile() ? <>
				<Row className="pt-5">
					<Col xs={6}>
						<img className='w-50' src="/img/homepage/globe.png" alt="" />
					</Col>
					<Col xs={6}>
						<p><b>Sign up for Tabs for Good</b></p>
					</Col>
				</Row>
				<Row className="pt-5">
					<Col xs={6}>
						<img className='w-50' src="/img/homepage/heart.png" alt="" />
					</Col>
					<Col xs={6}>
						<p><b>Start browsing and raise money for {ngo.name}</b></p>
					</Col>
				</Row>
				<Row className="pt-5">
					<Col xs={6}>
						<img className='w-50' src="/img/homepage/world.png" alt="" />
					</Col>
					<Col xs={6}>
						<p><b>Help {ngo.name} raise money</b></p>
					</Col>
				</Row>
				<br/><br/>
			</> :
				<Row className="pt-5">
					<Col md={4}>
						<img className='w-50' src="/img/homepage/globe.png" alt="" />
						<h3 className='pt-4'>Sign up for Tabs for Good</h3>
					</Col>
					<Col md={4}>
						<img className='w-50' src="/img/homepage/heart.png" alt="" />
						<h3 className='pt-4'>Start browsing and raise money for {ngo.name}</h3>
					</Col>
					<Col md={4}>
						<img className='w-50' src="/img/homepage/world.png" alt="" />
						<h3 className='pt-4'>Help {ngo.name} raise money</h3>
					</Col>
				</Row>
			}
			<T4GCTA className="mt-5"/>
			<CharityT4GLogos ngo={ngo} className="mt-5" autosize/>
		</PageCard>
	)
};

const JustTheBeginning = () => {
	return <div className='w-100 bg-gl-pale-orange' style={{marginTop:-100}}>
		<img src="/img/curves/curve-desat-blue.svg" className='w-100'/>
		<PageCard className="bg-gl-desat-blue" style={{marginTop:-100}}>
			<h1 className='white'>This is just the beginning.</h1>
			<br/>
			<p className='white text-center'><b>See what else we're doing and join the Good-Loop movement.</b></p>
			<br/>
			<TriCards/>
		</PageCard>
	</div>
}

const CharityLandingPage = () => {
	// Is this for a charity?
	const path = DataStore.getValue(['location', 'path']);
	let cid = path[1];
	if (!cid) {
		return <h1>No charity</h1>;
	}
	let pvCharity = getDataItem({ type: 'NGO', id: cid, status: KStatus.PUBLISHED });
	if (!pvCharity.resolved) {
		return <Misc.Loading />;
	}
	const ngo = pvCharity.value;

	useEffect(() => {
		//setFooterClassName('bg-gl-desat-blue');
		setFooterClassName('bg-gl-pale-orange');
	}, []);

	return (<>
		<MyLandingSection ngo={ngo} />
		<CornerHummingbird/>
		{isPortraitMobile() ?
			<CharityT4GLogos ngo={ngo}/>
		:
			<Row>
				<Col md={8} className='d-none d-md-block'></Col>
				<Col md={4} className='d-flex justify-content-center px-2'>
					<CharityT4GLogos ngo={ngo}/>
				</Col>
			</Row>
		}
		<WhatIsTabsForGood ngo={ngo} />
		<HowTabsForGoodWorks classname="mt-5"/>
		<TabsForGoodSlideSection ngo={ngo} showLowerCTA bgClassName="bg-gl-light-blue"/>
		<HelpCharityTogetherCard ngo={ngo}/>
		<SignUpSection ngo={ngo}/>
		{/*<JustTheBeginning/>*/}
	</>);
};

export default CharityLandingPage;
