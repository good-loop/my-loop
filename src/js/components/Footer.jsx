import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropControl from '../base/components/PropControl';
import { space, equals, isPortraitMobile } from '../base/utils/miscutils';
import SubscriptionBox, { SubscriptionForm } from './cards/SubscriptionBox';

const setFooterClassName = (className) => {
	// NB: update if not equals, which avoids the infinite loop bug of default update behaviour
	if (equals(getFooterClassName(), className)) {
		return; // no-op
	}
	DataStore.setValue(['widget','Footer', 'className'], className);
}

const getFooterClassName = () => DataStore.getValue(['widget','Footer', 'className']) || DataStore.setValue(['widget','Footer', 'className'], '', false);

/**
 * The current My-Loop footer
 */
const MyLoopFooter = ({}) => {
	// Allow inner pages to modify className for styling
	let dsClassName = getFooterClassName();
	const fullClassName = space('my-loop-footer', dsClassName);
	return <Container fluid className={fullClassName}>
		<Row>
			<img src="/img/curves/curve-dark-turquoise.svg" className='w-100 footer-curve'/>
			<img src="/img/footer/Hummingbird.png" className='hummingbird'/>
			<div className='bg-gl-dark-turquoise w-100 p-5' style={{marginTop:-1}}>
				<Row>
					<Col md={6}>
						<SubscriptionForm label={"Sign up to our Newsletter for some Good News :)"} />
					</Col>
					{!isPortraitMobile() &&
						<Col md={6} className="d-flex justify-content-end">
							<div className="stamps d-flex flex-row align-items-end p-3">
								<div>
									<img src="/img/footer/Net-carbon-negative.png" className="w-100"/>
								</div>
								<div>
									<img src="/img/footer/B-corp.png" className="w-100"/>
								</div>
							</div>
						</Col>
					}
				</Row>
				<Row className="social-icons mx-auto pt-5 mt-5">
					<Col xs={3}>
						<img src="/img/footer/twitter_icon.200w.png" className="w-100"/>
					</Col>
					<Col xs={3}>
						<img src="/img/footer/facebook_icon.200w.png" className="w-100"/>
					</Col>
					<Col xs={3}>
						<img src="/img/footer/insta_icon.200w.png" className="w-100"/>
					</Col>
					<Col xs={3}>
						<img src="/img/footer/linkedin_icon.200w.png" className="w-100"/>
					</Col>
				</Row>
				{isPortraitMobile() &&
					<Col md={6} className="d-flex justify-content-center pt-5 mt-5">
						<div className="stamps d-flex flex-row align-items-end py-1 px-3">
							<div>
								<img src="/img/footer/Net-carbon-negative.png" className="w-100"/>
							</div>
							<div>
								<img src="/img/footer/B-corp.png" className="w-100"/>
							</div>
						</div>
					</Col>
				}
			</div>
		</Row>
	</Container>;
}

export default MyLoopFooter;
export {setFooterClassName};
