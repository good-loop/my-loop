import React from 'react';
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import UserClaimControl, { getPersonSetting } from '../../base/components/PropControls/UserClaimControl';
import { getDataItem } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import { MyDataCard, Steps, SkipNextBtn } from './MyDataCommonComponents';
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
        <CategoryCard
            title="Causes you're interested in"
            img="https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/spring-flowers-1613759017.jpg?crop=0.669xw:1.00xh;0.0635xw,0&resize=640:*"
            info="What do you want to support?"
            prop="causes"
            options={["arts", "education", "health", "community", "environment", "civil rights", "animals", "science", "international"]}
            labels={["Arts and Culture", "Education", "Health", "Community Development", "Environment", "Civil Rights", "Animals", "Science and Research", "International Development"]}
        />
        <CategoryCard
            title="Types of Ads you'd like to see"
            img="https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/spring-flowers-1613759017.jpg?crop=0.669xw:1.00xh;0.0635xw,0&resize=640:*"
            info="What do you want to see?"
            prop="adstype"
            options={["videoads", "bannerads"]}
            labels={["Video Ads", "Banner Ads"]}
        />
        <SkipNextBtn skip={true} />
    </>;

};

export default MyDataInterests;
