import React from "react";
import { Container, Row, Col } from "reactstrap";
import BG from "../../base/components/BG";
import TickerTotal from '../TickerTotal';
import { ArrowLink, CurvePageCard, PageCard } from "./CommonComponents";
import { DiscoverMoreCard } from "./HomePage";
import { isMobile } from "../../base/utils/miscutils"

const OurImpactSplash = () => {

	const tickerStyle = {
		fontSize: "2.5rem",
		fontWeight: "bold",
		fontFamily: 'Montserrat',
	}

	return (<>
		<BG className='position-relative' image='img/ourimpact/ourimpact-header-background.svg'>
			<img className="d-none d-md-block" style={{ width: '80em' }} src='img/ourimpact/ourimpact-header-overlay.png' />
			<img className="d-md-none w-100 position-relative" src="img/ourimpact/impact-image.png" style={{ zIndex: 1 }} />
			<img className='position-absolute w-100' src="img/curves/curve-white.svg" style={{ bottom: 0, left: 0 }} />
		</BG>
		<div className='splash-section'>
			<Container className="text-center">
				<h1 className="m-0" style={{ fontSize: '2rem' }}>Our Impact</h1>
				<div className="color-gl-muddy-blue position-relative" style={tickerStyle}>
					<TickerTotal noPennies={true} />
					<img className="position-absolute" style={{ width: '1em', left: '20%', bottom: '-.2em' }} src="img/TabsForGood/sparkle.png" />
					<img className="position-absolute" style={{ width: '1em', right: '20%', top: '-.2em' }} src="img/TabsForGood/sparkle.png" />
				</div>
				<h5 className="color-gl-red">Raised And Counting</h5>
			</Container>
			<div className="position-relative bg-white rounded shadow text-center p-3 pb-5 mb-5 mx-auto" style={{ maxWidth: '768px', marginTop: '80px' }} >
				<img src="img/ourimpact/ad-break-header.png" className="position-absolute" style={{ width: '200px', left: '50%', top: 0, transform: 'translate(-50%,-60%)' }} />
				<p className="text-muted mt-5">By watching our ads, browsing with Tabs for Good, and signing up for My.Data, you've:</p>

				<p className="color-gl-muddy-blue">Helped Plant<br /><span className="font-weight-bold" style={{ fontSize: '1.25rem' }}>Over 1 Million Trees</span></p>
				<p className="color-gl-muddy-blue">Together with</p>
				<img className="mx-auto w-100" style={{ maxWidth: '460px' }} src="img/ourimpact/logos-trees.png" />
				{/* <div className="brands d-flex justify-content-between mx-auto">
					<img src="img/LandingBrand/H&M-Logo.png" />
					<img src="img/LandingBrand/toms-shoes-logo.png" />
					<img src="img/LandingBrand/universal-music-group-logo.png" />
					<img src="img/ourimpact/huggies-brand-logo-vector.png" />
					<img src="img/vertiser-logos/linda-mac-logo.png" />
				</div>
				<div className="brands d-flex justify-content-center mx-auto my-3">
					<img src="img/ourimpact/eden-logo.png" />
				</div> */}
				<hr />

				<p className="color-gl-red">Helped Provide<br /><span className="font-weight-bold" style={{ fontSize: '1.25rem' }}>1-2-1 Coaching For 122 Young Women</span></p>
				<p className="color-gl-red">Together with</p>
				<div className="brands d-flex justify-content-center mx-auto">
					<img className="larger" src="img/ourimpact/logos-yet.png" />
				</div>
				<hr />

				<p className="color-gl-red">Helped Remove<br /><span className="font-weight-bold" style={{ fontSize: '1.25rem' }}>21,792 Kg Of River Trash</span></p>
				<p className="color-gl-red">Together with</p>
				<div className="brands d-flex justify-content-center mx-auto">
					<img className="larger" src="img/ourimpact/logos-rivercleanup.png" />
				</div>
				<br /><br />

				<ArrowLink className='color-gl-muddy-blue' link="/impactoverview">Learn More In Our Ad Campaigns</ArrowLink>

				<img className="position-absolute" style={{ width: '200px', transform: 'translate(-50%, -50%)', left: '-2em', top: '60%' }} src="img/ourimpact/bubble-ywt.png" />
				<img className="position-absolute" style={{ width: '200px', transform: 'translate(-50%, -50%)', right: '-14em', bottom: '-20%' }} src="img/ourimpact/bubble-rivercleanup.png" />
				<img className="position-absolute" style={{ width: '200px', transform: 'translate(-50%, -50%)', right: '-14em', top: '20%' }} src="img/ourimpact/bubble-eden.png" />

			</div>

			<div className="cta text-center color-gl-red">
				<h5>WANT TO JOIN US?</h5>
				<p>Do Good Easily, For Free</p>
				<a href="/getinvolved" className="btn btn-primary">VIEW OUR PRODUCTS</a>
			</div>
		</div>
	</>)
}

const GlobalImpactSection = () => {
	const impactBubbles = [
		{
			img: 'img/ourimpact/projects-sierra-leone.png',
			text: "Supporting children's education, Sierra Leone"
		},
		{
			img: 'img/ourimpact/projects-uk.png',
			text: "Helping people take the first steps out of homelessness, UK"
		},
		{
			img: 'img/ourimpact/projects-burundi.png',
			text: "Increasing the natural habitats of wild chimpanzees, Burundi"
		},
		{
			img: 'img/ourimpact/projects-madagascar.png',
			text: "Mangrove Forest Restoration, Madagascar"
		},
	]

	return (<>
		<CurvePageCard className="global-impact" color="white" bgClassName="bg-gl-lighter-blue" >
			<div className="color-gl-muddy-blue text-center">
				<h4>Our Global Impact</h4>
				<p>We donate to hundreds of charities and projects worldwide. Spreading that money far and wide to those who need it the most. All thanks to our fantastic Good-Loop community.</p>
			</div>
			<div className="global-impact-bubbles position-relative d-flex flex-column justify-content-start align-items-center" style={{ marginBottom: '-10em' }}>
				<img className="w-75" style={{ maxWidth: '400px' }} src="img/ourimpact/projects-globe.svg" />
				{impactBubbles.map((bubble, i) => {
					return (
						<div key={i} className="d-flex flex-column text-center position-absolute" style={{ maxWidth: '180px'}}>
							<img className="w-100" src={bubble.img} />
							<span className="text-muted mt-1 font-weight-bold" style={{fontSize:'.85rem'}}>{bubble.text}</span>
						</div>
					)
				})}
			</div>
		</CurvePageCard>
		<CurvePageCard color="white" bgClassName="bg-gl-lighter-blue" >
			<div className="color-gl-muddy-blue text-center">
				<h4>Our Impact In Focus</h4>
				<p className="mt-3 mb-5">Together we're helping make a tangible difference in people's lives.</p>
			</div>
			<Row>
				<Col xs={12} md={6} className='d-flex justify-content-center align-items-center'>
					<img className="w-100" src="img/ourimpact/impact-focus.png" />
				</Col>
				<Col xs={12} md={6}>
					<h5 className="color-gl-red text-uppercase">Tenneh, Sierra Leone</h5>
					<p className="color-gl-red text-capitalize">In a remote village by a river in Sierra Leone, 13-years-old Tenneh is determinded to get to school.</p>
					<p>Her goal is to become a nurse and help her parents, and she's on her way to achieving that thanks to her hard work and supportive teacher.</p>
					<p className="text-center"><img className="logo" src="img/ourimpact/girl-school.png" /></p>
					<p className="text-capitalize">Our community is fundign charities like Save The Children - Who are supporting schools in Sierra Leone so children can continue to learn and play. They provide books, uniforms and desks. And their teacher traning programme makes sure that girls like Tenneh can stay in school and reach their potential.</p>
				</Col>
			</Row>
		</CurvePageCard>
		<CurvePageCard color="lighter-blue" bgClassName="white" className='position-relative pb-5' >
			<div className="position-relative" style={{ zIndex: 1, maxWidth: '370px', left: '50%', transform: 'translate(-50%, 7%)' }}>
				<img src='img/homepage/quote-red.svg' className="logo position-relative" style={{ left: '-1em' }} />
				<div className="position-relative" style={{ fontSize: '.9rem' }}>
					<p className="color-gl-red font-weight-bold">
						We are delighted to be working with Good-Loop and their partnering brands. Good-Loop are incredibly proactive and deliver excellent levels of stewardship.
					</p>
					<p className="color-gl-red ">
						Donation values have recently doubled and they continue to support children throughout the globe by partnering with Save The Children. Over £45,000 has been raised in the short period our partnership has been established. Sincere thanks for your onging support.
					</p>
					<p className="text-left" style={{ fontSize: '.85rem' }}>BECCA MCNAIR <br /> COMMUNITY FUNDRAISING AND ENGAGEMENT MANAGER, <br /> SAVE THE CHILDREN UK</p>
				</div>
				<div className="text-center"><img src='img/LandingCharity/save-the-children.png' className="w-25" /></div>
				<br />
				<img src="img/ourimpact/bubble-kids.png" className="position-absolute w-50" style={{ bottom: '-1em', right: '-3em' }} />
			</div>
			<img src="img/homepage/testimonial-blob-long.svg" className="position-absolute"
				style={{ maxWidth: '512px', left: '50%', top: 0, transform: 'translate(-50%, 0)', width: '120%' }} alt="blob" />
		</CurvePageCard>
	</>);
}

const ImpactMovementSection = () => {

	return (
		<div className='movement position-relative overflow-hidden'>
			<img className="position-absolute" style={{ width: '125%', bottom: 0, transform: 'translate(-12%,12%)' }} src="img/green/world-map.svg" />
			<PageCard>
				<div className="movement-blob position-relative d-flex align-items-center justify-content-center pb-5">
					<img style={{ maxWidth: '480px', zIndex: '1', margin: '0 -1rem' }} src="img/homepage/movement-blob-images.svg" />
					<div className="bubble-content position-absolute text-center" style={{ top: '18%', margin: '0 10%', maxWidth: '400px', zIndex: '2' }}>
						<h4 className='color-gl-red'>Join Our Movement</h4>
						<p className='color-gl-dark-grey' style={isMobile() ? { fontSize: '.9rem' } : {}} >Start Transforming Your Web Browsing And Data Into <b>Life Saving Vaccines, Meals For Children In Need, Habitats For Endangered Animals,</b> Plus Many More Good Causes.</p>
						<ArrowLink className='color-gl-red font-weight-bold' link='/getinvolved'>Get Involved</ArrowLink>
					</div>
				</div>
				<img className='position-absolute w-100 join-our-movement-bg-front' src="img/homepage/our-movement-front-curve.svg" />
			</PageCard>
		</div>
	);
}

const CharitiesDonationSection = () => {
	return (<PageCard className='pt-0 pb-1 text-white text-center bg-gl-light-blue'>
		<h2>105</h2>
		<h4>CHARITIES DONATED TO IN 2021</h4>
		<h5>All Thanks To Our Amazing Community</h5>
		<img className="w-100 my-4" style={{ maxWidth: '768px' }} src="img/ourimpact/top-charities-2021.png" />
		<p>Top charities donated to in 2021; size of the circle is correlated to the amount donated.</p>
	</PageCard>)
}

const OurImpactPage = () => {

	return (<>
		<OurImpactSplash />
		<GlobalImpactSection />
		<DiscoverMoreCard />
		<ImpactMovementSection />
		<CharitiesDonationSection />
	</>)
}

export default OurImpactPage;