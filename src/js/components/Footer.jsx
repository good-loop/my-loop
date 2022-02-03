import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import PropControl from '../base/components/PropControl';
import { space, equals } from '../base/utils/miscutils';
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
					<Col md={6}>
						
					</Col>
				</Row>
			</div>
		</Row>
	</Container>;
}

export default MyLoopFooter;
export {setFooterClassName};
