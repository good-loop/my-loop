import React from 'react';
import { Button } from 'reactstrap';
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import { getPersonSetting } from './MyDataUtil';
import { getDataItem } from '../../base/plumbing/Crud';
import NGOImage from '../../base/components/NGOImage';
import { MyDataCard, Steps } from './MyDataCommonComponents';
import { nextSignupPage } from './MyDataSignUp';

const InterestsCard = ({title, interests}) => {

    return <MyDataCard
        img="https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/spring-flowers-1613759017.jpg?crop=0.669xw:1.00xh;0.0635xw,0&resize=640:*"
        info="An extended explanation of this category of interests, whatever that may be!"
    >
        <h2>Causes your interested in</h2>
        <hr/>
        <p>A bit of testing information!</p>
    </MyDataCard>;

};

const MyDataInterests = ({}) => {

    return <>
        <InterestsCard/>
    </>;

};

export default MyDataInterests;
