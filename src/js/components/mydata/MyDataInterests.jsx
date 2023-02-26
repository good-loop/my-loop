import React from 'react';
import { Button } from 'reactstrap';
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import UserClaimControl from '../../base/components/propcontrols/UserClaimControl';
import { getDataItem } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import { MyDataCard, Steps, ProfileCreationSteps } from './MyDataCommonComponents';
import { nextSignupPage } from './MyDataSignUp';

/**
 * A card showing a selection of selectors for a category
 * @param {String} title
 * @param {*} img see MyDataCard
 * @param {*} info see MyDataCard
 * @param {String} prop key to save the interest under
 * @param {Array} options values for interest
 * @param {Array} labels nice text for values
 */
const CategoryCard = ({title, img, info, prop, options, labels, ...props}) => {
	return <MyDataCard
		img={img}
		info={info}
		{...props}
	>
		<h2 className="pt-3">{title}</h2>
		<hr/>
		<UserClaimControl prop={prop} type="checkboxes" options={options} labels={labels}/>
	</MyDataCard>;
};

const MyDataInterests = ({}) => {
	return <>
		<ProfileCreationSteps step={1}/>
		<h1 className="pt-4 pb-4">First up, tell us your interests</h1>
		<CategoryCard
			title="Pick the causes you're interested in"
			img="/img/mydata/charity-default.png"
			info="We use this to select projects and charities to show you, and to prefer adverts that support charities in these areas."
			prop="causes"
			// Options and Labels are built in UserClaimControl
		/>
		<br/>
		<CategoryCard
			title="Pick the types of ads you'd prefer to see"
			img="/img/mydata/signup-ads.png"
			info="Used to pick relevant adverts. Advertisers pay more to show their message to an interested audience - so this will raise more for your charity."
			prop="adstype"
			// Options and Labels are built in UserClaimControl
		/>
		<br />
		<div className="profile-creation-step">
			<div className="button-container">
				<Button color="primary" onClick={nextSignupPage}>Next</Button>
			</div>
		</div>
	</>;
};

export default MyDataInterests;
