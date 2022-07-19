import React from "react";
import { Container } from "reactstrap";
import BG from "../../base/components/BG";
import TickerTotal from '../TickerTotal';

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
		<div style={{ background: 'linear-gradient(180deg, white 0%, #DEEEF3 100%)' }}>
			<Container className="text-center">
				<h1 className="m-0" style={{ fontSize: '2rem' }}>Our Impact</h1>
				<div className="color-gl-muddy-blue position-relative" style={tickerStyle}>
					<TickerTotal noPennies={true} />
					<img className="position-absolute" style={{ width: '1em', left: '20%', bottom: '-.2em' }} src="img/TabsForGood/sparkle.png" />
					<img className="position-absolute" style={{ width: '1em', right: '20%', top: '-.2em' }} src="img/TabsForGood/sparkle.png" />
				</div>
				<h5 className="color-gl-red">Raised And Counting</h5>
			</Container>
			<div className="bg-white rounded shadow text-center m-5 p-5" >
				<p className="text-muted">By watching our ads, browsing with Tabs for Good, and signing up for My.Data, youve:</p>
				
				<p className="color-gl-muddy-blue">Helped Plant<br /><span className="font-weight-bold">Over 1 Million Trees</span></p>
				<p className="color-gl-muddy-blue">Together with</p>
				<div className="brands d-flex justify-content-between">
					<img className="logo" src="img/LandingBrand/H&M-Logo.png" />
					<img className="logo" src="img/LandingBrand/toms-shoes-logo.png" />
					<img className="logo" src="img/LandingBrand/universal-music-group-logo.png" />
					<img className="logo" src="img/ourimpact/huggies-brand-logo-vector.png" />
					<img className="logo" src="img/LandingBrand/H&M-Logo.png" />
				</div>
				<hr/>

				<p className="color-gl-red">Helped Provide<br /><span className="font-weight-bold">1-21 Coaching For 122 Young Women</span></p>
				<p className="color-gl-red">Together with</p>
				<div className="brands d-flex justify-content-center">
					<img className="w-50" src="img/ourimpact/logos-yet.png" />
				</div>
			</div>
		</div>
	</>)
}

const AdBreakSection = () => {
	return (<>
		<Container className="d-flex align-items-center justify-content-center">
			<img style={{ maxHeight: '15em' }} src="img/ourimpact/ad-break-header.png" />
		</Container>
	</>)
}

const OurImpactPage = () => {

	return (<>
		<OurImpactSplash />
	</>)
}

export default OurImpactPage;