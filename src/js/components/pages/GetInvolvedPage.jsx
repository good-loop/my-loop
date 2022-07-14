import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import BG from '../../base/components/BG';
import { isMobile, space } from '../../base/utils/miscutils';
import { ArrowLink, MyDataButton, NewsAwards } from './CommonComponents';
import { T4GHowItWorksButton, T4GSignUpButton } from '../T4GSignUp';
import { MyDataSignUpButton, MyDataSignUpModal } from '../mydata/MyDataSignUp';

const GetInvolvedSplash = () => {

	const styleBG = {
		backgroundImage: 'url(img/getinvolved/' + (isMobile() ? 'products-header-image.png' : 'getinvolved-background.svg') + ')',
		backgroundSize: 'cover',
		backgroundPosition: 'top center',
		backgroundRepeat: 'no-repeat',
		minHeight: '16em',
	}

	return (<div className='get-involved-splash'>
		<div className='position-relative' style={styleBG}>
			<img className='d-none d-md-block' src='/img/getinvolved/getinvolved-overlay.png' style={{ zIndex: 1 }} />
			<img src={"/img/curves/curve-white.svg"} className='curve position-absolute w-100' style={{ bottom: 0, zIndex: 2 }} />
		</div>
		<Container className='text-center mb-5'>
			<h1>Get Involved</h1>
			<h3>Sign Up For Our Products</h3>
			<p>Explore our free, simple ways to raise money for the cause you care about</p>
		</Container>
	</div>)

}

const ProductsCard = () => {
	const tabsForGood = {
		bgColour: 'bg-gl-light-pink',
		title: 'Tabs for Good',
		subtitle: 'Support A Charity Of Your Choice For Free',
		description: 'Convert your web browsing into a donations, simply by opening new tabs',
		image: 'img/homepage/tabs-for-good-card.png',
		button: <><T4GSignUpButton className="w-100 mb-3" />	<T4GHowItWorksButton className="w-100 color-gl-red" /></>,
		linkTarget: '_blank',
		orderReverse: false
	}
	const myData = {
		bgColour: 'bg-gl-lighter-blue',
		title: 'My.Data',
		subtitle: 'How Many Cookies Have You Accepted Today?',
		description: "Don't just give your data away - control your data and convert it into charity donations with My.Data",
		image: 'img/homepage/my-data-product.png',
		button: <><MyDataSignUpModal /><MyDataButton className="w-100" /> <ArrowLink className='w-100 color-gl-red' link="/getmydata#howitworks" >How it works</ArrowLink></>,
		linkTarget: '_blank',
		orderReverse: true
	}

	return (<div className='products'>
		{[].concat(tabsForGood, myData).map((product, i) => {

			const desktopTitleCard = <Col className='d-none d-md-flex flex-column text-center justify-content-center align-items-center p-5' xs='0' md='6'>
				<h3>{product.title}</h3>
				<h5>{product.subtitle}</h5>
				<p>{product.description}</p>
				{product.button}
			</Col>

			return <div key={i} className={space(product.bgColour, 'p-5')}>
				<Container>
					<Row>
						{product.orderReverse && desktopTitleCard}
						<Col className='text-center d-flex flex-column justify-content-center align-items-center' xs='12' md='6'>
							<h3 className='d-md-none'>{product.title}</h3>
							<img className='w-100' src={product.image} />
							<p className='d-md-none'>{product.description}</p>
							<div className='d-md-none'>{product.button}</div>
						</Col>
						{!product.orderReverse && desktopTitleCard}
					</Row>
				</Container>
			</div>
		})}
	</div>)
}

const GetInvolvedPage = () => {
	console.log('MyDataGetInvolvedPage');
	return (<>
		<GetInvolvedSplash />
		<ProductsCard />
		<NewsAwards nostars><h3 style={{fontWeight:'600'}}>As Featured In</h3></NewsAwards>
	</>)
}

export default GetInvolvedPage;