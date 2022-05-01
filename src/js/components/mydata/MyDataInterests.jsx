import React from 'react';
import { Button } from 'reactstrap';
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import UserClaimControl from '../../base/components/PropControls/UserClaimControl';
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
        <h2>{title}</h2>
        <hr/>
        <UserClaimControl prop={prop} type="checkboxes" options={options} labels={labels}/>
    </MyDataCard>;

};

const MyDataInterests = ({}) => {

    return <>
        <ProfileCreationSteps step={1}/>
        <CategoryCard
            title="Causes you're interested in"
            img="img/mydata/charity-default.png"
            info="We use this to select projects and charities to show you, and to prefer adverts that support charities in these areas."
            prop="causes"
            options={
				// See NGO.CATEGORY
				["culture", "education", "health", "community", "environment", "civil rights", "animals", "research", "international"]
			}
            labels={["Arts and Culture", "Education", "Health", "Community Development", "Environment", "Civil Rights", "Animals", "Science and Research", "International Development"]}
        />
        <br/>
        <CategoryCard
            title="Types of Ads you'd like to see"
            img="img/mydata/signup-ads.png"
            info="Used to pick relevant adverts. Advertisers pay more to show their message to an interested audience - so this will raise more for your charity."
            prop="adstype"
            options={["fashion", "food", "sports", "technology", "games", "travel", "health", "business"]} // are there IAB labels for these??
            labels={["Fashion", "Food and Drink", "Sports", "Technology", "Gaming", "Travel", "Healthy Living", "Business"]}
        />
        <br />
        <div className="d-flex flex-row align-items-center justify-content-center">
            <Button color="primary" className="w-100" onClick={nextSignupPage}>Next</Button>
        </div>
       
    </>;

};

export default MyDataInterests;
