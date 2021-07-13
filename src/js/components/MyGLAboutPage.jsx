
import React from 'react';
import AboutPage from '../base/components/AboutPage';
import MyLoopNavBar from './MyLoopNavBar';

const MyGLAboutPage = () => {
	return (<>
		<MyLoopNavBar logo="/img/new-logo-with-text-white.svg"/>
		<div className="MyPage widepage">
			<AboutPage />
		</div>
	</>);
};

export default MyGLAboutPage;
