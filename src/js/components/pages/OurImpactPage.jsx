import React from "react";
import { Container } from "reactstrap";
import BG from "../../base/components/BG";
import TickerTotal from '../TickerTotal';

const OurImpactSplash = () => {
	return (<>
		<BG className='position-relative' image='img/ourimpact/ourimpact-header-background.svg'>
			<img className="d-none d-md-block" style={{ width: '80em' }} src='img/ourimpact/ourimpact-header-overlay.png' />
			<img className="d-md-none w-100 position-relative" src="img/ourimpact/impact-image.png" style={{ zIndex: 1 }} />
			<img className='position-absolute w-100' src="img/curves/curve-white.svg" style={{ bottom: 0, left: 0 }} />
		</BG>
		<Container className="text-center">
			<h1>Our Impact</h1>
			<div className="color-gl-muddy-blue ourimpact-ticker" ><TickerTotal noPennies={true} /></div>
			<p>Raised And Counting</p>
		</Container>
	</>)
}

const OurImpactPage = () => {

	return (<>
		<OurImpactSplash />
	</>)
}

export default OurImpactPage;