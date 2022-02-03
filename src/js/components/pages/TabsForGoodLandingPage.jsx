import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../base/components/Misc';
import KStatus from '../../base/data/KStatus';
import { getDataItem } from '../../base/plumbing/Crud';
import C from '../../C';
import CharityLogo from '../CharityLogo';
<<<<<<< HEAD
import { T4GSignUpModal } from '../T4GSignUp';
import { MyLandingSection, T4GCTAButton } from './CommonComponents';
=======
import { MyLandingSection, T4GCTAButton, WhatIsTabsForGood, HowTabsForGoodWorks, TabsForGoodSlideSection, WatchVideoSection, TriCards } from './CommonComponents';
>>>>>>> d39b5f2203b41364c4bda2569e8c496f7f986ddc


// Copywriting https://docs.google.com/document/d/1_mpbdWBeaIEyKHRr-mtC1FHAPEfokcRZTHXgMkYJyVk/edit#heading=h.5r45wnjwbf7j
// Design https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764517456508960&cot=14
// https://miro.com/app/board/o9J_lxO4FyI=/?moveToWidget=3458764516139446040&cot=14


const TabsForGoodLandingPage = () => {
	return (<>
		<MyLandingSection />
		<WhatIsTabsForGood />
		<HowTabsForGoodWorks />
		<TabsForGoodSlideSection img="/img/homepage/charities.png" showLowerCTA/>
		<WatchVideoSection />
		<TriCards />
	</>);
};

export default TabsForGoodLandingPage;
