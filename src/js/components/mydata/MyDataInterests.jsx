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

    return <div className="mydata-card">

    </div>

};

const MyDataInterests = ({}) => {

    return <>
        <MyDataCard img="https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/spring-flowers-1613759017.jpg?crop=0.669xw:1.00xh;0.0635xw,0&resize=640:*"
            info="A test of information!"
        >
            <h2>Oh hell yeah!</h2>
            Whats up peeps its the new MyData card!
        </MyDataCard>
    </>;

};

export default MyDataInterests;
